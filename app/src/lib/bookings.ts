import { supabase } from "@/lib/supabase"
import type { BookingStatus } from "@/lib/db-types"

export type BookingWithBusiness = {
  id: string
  status: BookingStatus
  scheduledAt: string
  note: string | null
  business: {
    id: string
    name: string | null
    type: "salon" | "artist"
    logoPath: string | null
  } | null
}

/** Нэвтэрсэн хэрэглэгчийн бүх захиалгыг (шинэ нь эхэндээ) бизнесийн мэдээлэлтэй нь татна. */
export async function fetchMyBookings(): Promise<BookingWithBusiness[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows, error } = await supabase
    .from("bookings")
    .select("id, status, scheduled_at, note, business_id")
    .eq("customer_id", user.id)
    .order("scheduled_at", { ascending: false })

  if (error || !rows) return []

  const businessIds = [...new Set(rows.map((r) => r.business_id))]
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, type, logo_path")
    .in("id", businessIds)

  const byId = new Map((businesses ?? []).map((b) => [b.id, b]))

  return rows.map((r) => {
    const b = byId.get(r.business_id)
    return {
      id: r.id,
      status: r.status,
      scheduledAt: r.scheduled_at,
      note: r.note,
      business: b ? { id: b.id, name: b.name, type: b.type, logoPath: b.logo_path } : null,
    }
  })
}

/** Шинэ захиалга үүсгэнэ. */
export async function createBooking(
  businessId: string,
  scheduledAt: Date,
  note?: string,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  const { error } = await supabase.from("bookings").insert({
    customer_id: user.id,
    business_id: businessId,
    scheduled_at: scheduledAt.toISOString(),
    note: note?.trim() || null,
  })

  return error ? error.message : null
}

/** Захиалгаа цуцлана (зөвхөн pending/confirmed үед боломжтой). */
export async function cancelBooking(id: string): Promise<string | null> {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id)
  return error ? error.message : null
}
