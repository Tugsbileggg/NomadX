import type { Tone } from "@/components/admin/kit";
import { createClient } from "@/lib/supabase/server";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingRow = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  scheduledAt: string;
  note: string | null;
  status: BookingStatus;
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

export const STATUS_TONE: Record<BookingStatus, Tone> = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

export const STATUS_FILTERS: Array<{ label: string; value: BookingStatus | "all" }> = [
  { label: "Бүгд", value: "all" },
  { label: "Хүлээгдэж буй", value: "pending" },
  { label: "Баталгаажсан", value: "confirmed" },
  { label: "Дууссан", value: "completed" },
  { label: "Цуцлагдсан", value: "cancelled" },
];

/** Нэвтэрсэн эзний бизнесийг (салон/артист) төрлөөр нь олно. */
export async function findOwnedBusiness(type: "salon" | "artist") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("type", type)
    .maybeSingle();

  return business ?? null;
}

/** Тухайн бизнес рүү ирсэн бүх захиалгыг харилцагчийн мэдээллийн хамт татна. */
export async function fetchBusinessBookings(businessId: string): Promise<BookingRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, scheduled_at, note, status, customer:profiles(full_name, phone)")
    .eq("business_id", businessId)
    .order("scheduled_at", { ascending: false });

  return (data ?? []).map((b) => {
    const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer;
    return {
      id: b.id,
      customerName: customer?.full_name || "Харилцагч",
      customerPhone: customer?.phone ?? null,
      scheduledAt: b.scheduled_at,
      note: b.note,
      status: b.status,
    };
  });
}

/** Огноог "YYYY-MM-DD" түлхүүр болгоно (локал цагийн бүсээр). */
export function dateKey(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function computeBookingStats(bookings: BookingRow[]) {
  const now = new Date();
  const todayKey = now.toDateString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.scheduledAt).toDateString() === todayKey,
  ).length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const thisMonth = bookings.filter((b) => new Date(b.scheduledAt) >= monthStart).length;

  return { today, pending, thisMonth };
}
