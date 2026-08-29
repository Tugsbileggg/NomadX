"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string } | null;

/** Хонх салоны панелийн толгойд байдаг тул бүхэл layout-ыг шинэчилнэ. */
function revalidatePanels() {
  revalidatePath("/business", "layout");
}

/**
 * Мэдэгдлийг уншсан болгоно.
 *
 * Бичих эрхийг RLS-ийн `notifications_update_own` шалгана — өөрийн мөрөөс
 * бусдыг хөндөх боломжгүй тул энд эзэн эсэхийг дахин шалгах шаардлагагүй.
 */
export async function markNotificationRead(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("notification_id") ?? "");
  if (!id) return { error: "Буруу хүсэлт." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePanels();
  return null;
}

export async function markAllNotificationsRead(): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) return { error: error.message };

  revalidatePanels();
  return { success: "Бүгдийг уншсан болголоо." };
}

export async function deleteNotification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("notification_id") ?? "");
  if (!id) return { error: "Буруу хүсэлт." };

  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePanels();
  return null;
}
