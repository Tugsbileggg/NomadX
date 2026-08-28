"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/db-types";

export type FormState = { error?: string; success?: string } | null;

/** Бизнесийн зүгээс хийж болох төлөвийн шилжилтүүд. */
const ALLOWED: Record<string, { from: BookingStatus[]; label: string }> = {
  confirmed: { from: ["pending"], label: "Захиалгыг баталгаажууллаа." },
  completed: { from: ["confirmed"], label: "Захиалгыг дууссан гэж тэмдэглэлээ." },
  cancelled: { from: ["pending", "confirmed"], label: "Захиалгыг цуцаллаа." },
};

/**
 * Захиалгын төлөвийг өөрчилнө.
 *
 * RLS нь эзэн эсэхийг шалгадаг ч аль төлвөөс аль төлөв рүү шилжихийг
 * хязгаарладаггүй — дууссан захиалгыг дахин баталгаажуулах зэрэг утгагүй
 * шилжилтээс энд сэргийлнэ.
 */
export async function setBookingStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("booking_id") ?? "");
  const next = String(formData.get("status") ?? "") as BookingStatus;

  const rule = ALLOWED[next];
  if (!id || !rule) return { error: "Буруу хүсэлт." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, business_id")
    .eq("id", id)
    .maybeSingle();
  if (!booking) return { error: "Захиалга олдсонгүй." };

  // RLS нь захиалагчийн захиалгыг ч уншуулдаг тул эзэн мөн эсэхийг шалгана.
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", booking.business_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { error: "Энэ захиалгыг өөрчлөх эрхгүй байна." };

  if (!rule.from.includes(booking.status)) {
    return { error: "Одоогийн төлвөөс энэ үйлдлийг хийх боломжгүй." };
  }

  const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/business/bookings");
  revalidatePath("/artist/bookings");
  return { success: rule.label };
}

/**
 * Нэхэмжлэх үүсгэх / дүнг засах — ⚠️ ТУРШИЛТЫН.
 *
 * Бодит төлбөр тооцоо хийгддэггүй: энэ нь зөвхөн "бизнес дүнгээ бичиж
 * үлдээх → үйлчлүүлэгч харах" урсгалыг туршихад зориулсан бүртгэл.
 *
 * Үйлчилгээ дуусаагүй байхад дүн тавих нь утгагүй тул зөвхөн `completed`
 * захиалга дээр зөвшөөрнө.
 */
export async function saveInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  const bookingId = String(formData.get("booking_id") ?? "");
  const amount = Number(formData.get("amount") ?? NaN);

  if (!bookingId) return { error: "Буруу хүсэлт." };
  if (!Number.isFinite(amount) || amount < 0) return { error: "Дүнг зөв оруулна уу." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, business_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { error: "Захиалга олдсонгүй." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", booking.business_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { error: "Энэ захиалгад нэхэмжлэх үүсгэх эрхгүй байна." };

  if (booking.status !== "completed") {
    return { error: "Зөвхөн дууссан захиалгад нэхэмжлэх үүсгэнэ." };
  }

  const fields = {
    booking_id: bookingId,
    business_id: business.id,
    amount: Math.round(amount),
    note: String(formData.get("note") ?? "").trim() || null,
  };

  // Нэг захиалгад нэг нэхэмжлэх (invoices_booking_uniq) — дүн буруу бол засна.
  const { error } = await supabase
    .from("invoices")
    .upsert(fields, { onConflict: "booking_id" });
  if (error) return { error: error.message };

  revalidatePath("/business/bookings");
  revalidatePath("/artist/bookings");
  return { success: "Туршилтын нэхэмжлэхийг хадгаллаа." };
}

/** Нэхэмжлэхийг төлөгдсөн/цуцлагдсан гэж тэмдэглэнэ — гар аргаар, туршилтаар. */
export async function setInvoiceStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("invoice_id") ?? "");
  const next = String(formData.get("status") ?? "");

  if (!id || !["paid", "cancelled", "issued"].includes(next)) return { error: "Буруу хүсэлт." };

  const supabase = await createClient();
  // Бичих эрхийг RLS-ийн owns_business() шалгана.
  const { error } = await supabase
    .from("invoices")
    .update({ status: next as "paid" | "cancelled" | "issued" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/business/bookings");
  revalidatePath("/artist/bookings");
  return { success: "Нэхэмжлэхийн төлөвийг шинэчиллээ." };
}
