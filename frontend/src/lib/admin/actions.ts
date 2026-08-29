"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | null;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user: profile?.role === "super_admin" ? user : null };
}

/**
 * Төлөв солиод, verification_events-д мөр үлдээнэ. RLS нь super_admin эсэхийг
 * дахин шалгах тул энэ нь давхар хамгаалалт.
 */
async function transition(
  businessId: string,
  to: "under_review" | "approved" | "rejected" | "needs_info",
  note?: string,
): Promise<FormState> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { error: "Танд энэ үйлдлийг хийх эрх алга." };

  const { data: business } = await supabase
    .from("businesses")
    .select("status")
    .eq("id", businessId)
    .single();

  if (!business) return { error: "Бүртгэл олдсонгүй." };

  const { error } = await supabase
    .from("businesses")
    .update({
      status: to,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: to === "rejected" || to === "needs_info" ? (note ?? null) : null,
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  await supabase.from("verification_events").insert({
    business_id: businessId,
    actor_id: user.id,
    from_status: business.status,
    to_status: to,
    note: note ?? null,
  });

  revalidatePath("/admin", "layout");
  return null;
}

export async function approveBusiness(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return transition(String(formData.get("business_id")), "approved");
}

export async function rejectBusiness(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Татгалзах шалтгаанаа бичнэ үү." };
  return transition(String(formData.get("business_id")), "rejected", reason);
}

export async function requestMoreInfo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const note = String(formData.get("reason") ?? "").trim();
  if (!note) return { error: "Юу дутуу байгааг бичнэ үү." };
  return transition(String(formData.get("business_id")), "needs_info", note);
}

/** Хэрэглэгчийг хориглох/цуцлах — Supabase Auth Admin API (service role). */
async function setBan(userId: string, banned: boolean): Promise<FormState> {
  const { user } = await requireAdmin();
  if (!user) return { error: "Танд энэ үйлдлийг хийх эрх алга." };
  if (userId === user.id) return { error: "Өөрийгөө хориглох боломжгүй." };

  const admin = createAdminClient();
  if (!admin) return { error: "Service role тохируулаагүй байна." };

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return null;
}

export async function banUser(_prev: FormState, formData: FormData): Promise<FormState> {
  return setBan(String(formData.get("user_id")), true);
}

export async function unbanUser(_prev: FormState, formData: FormData): Promise<FormState> {
  return setBan(String(formData.get("user_id")), false);
}

/**
 * Хэрэглэгчийн эрхийг өөрчилнө — админ томилох / чөлөөлөх.
 *
 * `profiles`-ийн RLS нь зөвхөн өөрийн мөрийг засуулдаг тул service role
 * хэрэгтэй. 0018-ийн триггер нь энэ замаас гадуур role солихыг хаадаг:
 * өмнө нь хэрэглэгч өөрөө өөрийгөө super_admin болгож чаддаг байсан.
 */
export async function setUserRole(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireAdmin();
  if (!user) return { error: "Танд энэ үйлдлийг хийх эрх алга." };

  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !["customer", "salon", "artist", "super_admin"].includes(role)) {
    return { error: "Буруу хүсэлт." };
  }

  // Сүүлчийн админ өөрийгөө чөлөөлбөл панел руу орох зам үлдэхгүй.
  if (userId === user.id) return { error: "Өөрийнхөө эрхийг өөрчлөх боломжгүй." };

  const admin = createAdminClient();
  if (!admin) return { error: "Service role тохируулаагүй байна." };

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/admin/users");
  return null;
}
