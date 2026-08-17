"use server";

import { revalidatePath } from "next/cache";
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
