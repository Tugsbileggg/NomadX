"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeFile } from "@/lib/storage/store-file";
import { geocodeAddress } from "@/lib/geocode";
import type { SupabaseClient } from "@supabase/supabase-js";

export type FormState = { error?: string } | null;

/** Гэрээний хувилбар — текст өөрчлөгдвөл шинэ огноо тавина. */
const CONTRACT_VERSION = "2024-10-01";

const STEP_PATHS = [
  "/business/register",
  "/business/register/info",
  "/business/register/documents",
  "/business/register/contract",
  "/business/register/review",
];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Нэвтэрсний дараа хаашаа явахыг тодорхойлно: бүртгэлгүй бол wizard-ын
 * эхлэл рүү, дуусаагүй бол өөрийн орхисон алхам руу, шалгагдаж байгаа бол
 * төлвийн хуудас руу, баталгаажсан бол өөрийн (business/artist) самбар руу.
 */
export async function resolveLandingPath(supabase: SupabaseClient, ownerId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", ownerId)
    .maybeSingle();
  if (profile?.role === "super_admin") return "/admin";

  const { data: business } = await supabase
    .from("businesses")
    .select("type, status, current_step")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!business) return STEP_PATHS[0];
  if (business.status === "approved") return business.type === "artist" ? "/artist" : "/business";
  if (business.status === "draft") {
    return STEP_PATHS[Math.min(Math.max(business.current_step - 1, 0), STEP_PATHS.length - 1)];
  }
  return "/status";
}

/** current_step-ийг зөвхөн урагш ахиулна — буцаж ирээд засахад алхам ухрахгүй. */
function advance(current: number, completed: number) {
  return Math.max(current, Math.min(completed + 1, STEP_PATHS.length));
}

// ------------------------------------------------------------------ step 1
export async function saveBusinessType(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const type = formData.get("business-type");
  if (type !== "salon" && type !== "artist") {
    return { error: "Бизнесийн төрлөө сонгоно уу." };
  }

  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase
    .from("businesses")
    .select("id, current_step")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("businesses")
        .update({ type, current_step: advance(existing.current_step, 1) })
        .eq("id", existing.id)
    : await supabase
        .from("businesses")
        .insert({ owner_id: user.id, type, status: "draft", current_step: 2 });

  if (error) return { error: error.message };

  revalidatePath("/business/register", "layout");
  redirect(STEP_PATHS[1]);
}

// ------------------------------------------------------------------ step 2
export async function saveBusinessInfo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const business = await loadDraft(supabase, user.id);
  if (!business) return { error: "Эхлээд бизнесийн төрлөө сонгоно уу." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Салоны нэрээ бөглөнө үү." };

  const address = String(formData.get("address") ?? "").trim() || null;
  const coords = address ? await geocodeAddress(address) : null;

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address,
      staff_size: String(formData.get("staff_size") ?? "").trim() || null,
      current_step: advance(business.current_step, 2),
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
    .eq("id", business.id);

  if (error) return { error: error.message };

  // Ажлын цаг: бүх өдрийг дахин бичнэ (7 мөр).
  const open = String(formData.get("open_time") ?? "");
  const close = String(formData.get("close_time") ?? "");
  if (open && close) {
    await supabase.from("business_hours").delete().eq("business_id", business.id);
    await supabase.from("business_hours").insert(
      Array.from({ length: 7 }, (_, weekday) => ({
        business_id: business.id,
        weekday,
        open_time: open,
        close_time: close,
        is_closed: false,
      })),
    );
  }

  const categories = formData.getAll("services").map(String).filter(Boolean);
  await supabase.from("business_categories").delete().eq("business_id", business.id);
  if (categories.length) {
    await supabase.from("business_categories").insert(
      categories.map((category) => ({ business_id: business.id, category })),
    );
  }

  const uploads: Array<[FormDataEntryValue | null, "logo" | "cover" | "license"]> = [
    [formData.get("logo"), "logo"],
    [formData.get("cover"), "cover"],
    [formData.get("license"), "license"],
  ];
  for (const [file, kind] of uploads) {
    const failed = await storeFile(supabase, business.id, file, kind);
    if (failed) return { error: failed };
  }

  revalidatePath("/business/register", "layout");
  redirect(STEP_PATHS[2]);
}

// ------------------------------------------------------------------ step 3
export async function saveDocuments(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const business = await loadDraft(supabase, user.id);
  if (!business) return { error: "Бүртгэл олдсонгүй." };

  const uploads: Array<[FormDataEntryValue | null, "id_front" | "id_back" | "license" | "certificate"]> = [
    [formData.get("id_front"), "id_front"],
    [formData.get("id_back"), "id_back"],
    [formData.get("license"), "license"],
    [formData.get("certificate"), "certificate"],
  ];
  for (const [file, kind] of uploads) {
    const failed = await storeFile(supabase, business.id, file, kind);
    if (failed) return { error: failed };
  }

  const { error } = await supabase.from("payout_accounts").upsert({
    business_id: business.id,
    bank_name: String(formData.get("bank_name") ?? "").trim() || null,
    holder_name: String(formData.get("holder_name") ?? "").trim() || null,
    account_number: String(formData.get("account_number") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  await supabase
    .from("businesses")
    .update({ current_step: advance(business.current_step, 3) })
    .eq("id", business.id);

  revalidatePath("/business/register", "layout");
  redirect(STEP_PATHS[3]);
}

// ------------------------------------------------------------------ step 4
export async function saveContract(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const business = await loadDraft(supabase, user.id);
  if (!business) return { error: "Бүртгэл олдсонгүй." };

  if (!formData.get("accept")) {
    return { error: "Гэрээний нөхцөлийг зөвшөөрнө үү." };
  }
  const signedName = String(formData.get("signed_name") ?? "").trim();
  if (!signedName) return { error: "Цахим гарын үсгээ бичнэ үү." };

  // Хуучин гарын үсгийг устгаж, шинэ version-оор дахин бичнэ.
  await supabase.from("contracts").delete().eq("business_id", business.id);
  const { error } = await supabase.from("contracts").insert({
    business_id: business.id,
    version: CONTRACT_VERSION,
    signed_name: signedName,
  });
  if (error) return { error: error.message };

  await supabase
    .from("businesses")
    .update({ current_step: advance(business.current_step, 4) })
    .eq("id", business.id);

  revalidatePath("/business/register", "layout");
  redirect(STEP_PATHS[4]);
}

// ------------------------------------------------------------------ step 5
export async function submitRegistration(): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const business = await loadDraft(supabase, user.id);
  if (!business) return { error: "Бүртгэл олдсонгүй." };

  if (!business.name) return { error: "Үндсэн мэдээлэл дутуу байна." };

  const { count } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);
  if (!count) return { error: "Гэрээнд гарын үсэг зураагүй байна." };

  const { error } = await supabase
    .from("businesses")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      reject_reason: null,
    })
    .eq("id", business.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/status");
}

// ------------------------------------------------------------------ helpers
type Draft = { id: string; current_step: number; name: string | null };

async function loadDraft(supabase: SupabaseClient, ownerId: string) {
  const { data } = await supabase
    .from("businesses")
    .select("id, current_step, name")
    .eq("owner_id", ownerId)
    .maybeSingle();
  return data as Draft | null;
}
