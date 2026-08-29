"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "./data";

export type FormState = { error?: string } | null;

async function transition(
  bookingId: string,
  to: Extract<BookingStatus, "confirmed" | "completed" | "cancelled">,
  revalidate: string,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." };

  // RLS (bookings_update) зөвхөн харилцагч эсвэл бизнесийн эзнийг шинэчлэхийг
  // зөвшөөрдөг тул мөр буцаагдаагүй бол эрхгүй эсвэл олдоогүй гэсэн үг.
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: to })
    .eq("id", bookingId)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Захиалга олдсонгүй." };

  revalidatePath(revalidate);
  return null;
}

export async function confirmBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  return transition(
    String(formData.get("booking_id")),
    "confirmed",
    String(formData.get("base_path")),
  );
}

export async function completeBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  return transition(
    String(formData.get("booking_id")),
    "completed",
    String(formData.get("base_path")),
  );
}

export async function cancelBookingByBusiness(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return transition(
    String(formData.get("booking_id")),
    "cancelled",
    String(formData.get("base_path")),
  );
}
