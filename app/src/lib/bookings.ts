import { decode } from "base64-arraybuffer"

import {
  BUCKET_BOOKING_REFS,
  type BookingStatus,
  type InvoiceStatus,
} from "@/lib/db-types"
import { supabase } from "@/lib/supabase"

/** Signed URL-ийн хүчинтэй хугацаа (сек) — нэг дэлгэц үзэхэд хангалттай. */
const SIGNED_URL_TTL = 60 * 60

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
  /** ⚠️ Туршилтын нэхэмжлэх — бодит төлбөр тооцоо хийгддэггүй. */
  invoice: { id: string; amount: number; note: string | null; status: InvoiceStatus } | null
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

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, booking_id, amount, note, status")
    .in(
      "booking_id",
      rows.map((r) => r.id),
    )

  const byInvoice = new Map((invoices ?? []).map((i) => [i.booking_id, i]))

  return rows.map((r) => {
    const b = byId.get(r.business_id)
    return {
      id: r.id,
      status: r.status,
      scheduledAt: r.scheduled_at,
      note: r.note,
      business: b ? { id: b.id, name: b.name, type: b.type, logoPath: b.logo_path } : null,
      invoice: byInvoice.get(r.id) ?? null,
    }
  })
}

export type NewBooking = { id: string } | { error: string }

/**
 * Шинэ захиалга үүсгэнэ.
 *
 * `note` нь үйлчлүүлэгч юу хийлгэхээ бичсэн тайлбар — үйлчилгээний
 * жагсаалтаас сонгодоггүй тул энэ нь бизнест очих гол мэдээлэл.
 * Жишээ зургийг захиалга үүссэний дараа `uploadBookingImages`-ээр
 * хавсаргана (зам нь захиалгын id-г шаарддаггүй ч RLS нь захиалга
 * аль хэдийн үүссэн байхыг шаардана).
 */
export async function createBooking(
  businessId: string,
  scheduledAt: Date,
  note: string,
): Promise<NewBooking> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Нэвтрээгүй байна." }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      business_id: businessId,
      scheduled_at: scheduledAt.toISOString(),
      note: note.trim(),
    })
    .select("id")
    .single()

  if (error || !data) return { error: error?.message ?? "Захиалга үүсгэж чадсангүй." }
  return { id: data.id }
}

/**
 * Жишээ зургуудыг booking-refs bucket руу байршуулж, захиалгад холбоно.
 *
 * React Native дээр `fetch(uri).arrayBuffer()` найдваргүй (FileReader нь
 * readAsArrayBuffer-ийг дэмждэггүй) тул зургийг ImagePicker-ээс base64-аар
 * авч энд хөрвүүлнэ.
 */
export async function uploadBookingImages(
  bookingId: string,
  images: { base64: string; mime: string }[],
): Promise<string | null> {
  if (!images.length) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  const rows: { booking_id: string; storage_path: string; sort_order: number }[] = []

  for (const [i, image] of images.entries()) {
    const ext = image.mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
    // Зам нь захиалагчийн id-аар эхэлнэ — storage-ийн бичих эрх үүгээр
    // шийдэгдэнэ. Hermes дээр `crypto.randomUUID` байхгүй тул нэрийг
    // цаг + санамсаргүй мөрөөр үүсгэв (нэг хавтас дотор хангалттай).
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    const path = `${user.id}/${unique}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET_BOOKING_REFS)
      .upload(path, decode(image.base64), { contentType: image.mime })

    if (error) return error.message
    rows.push({ booking_id: bookingId, storage_path: path, sort_order: i })
  }

  const { error } = await supabase.from("booking_images").insert(rows)
  return error ? error.message : null
}

/**
 * Захиалгын зургуудын түр хугацааны URL. Bucket нь хувийн тул
 * getPublicUrl ажиллахгүй — signed URL шаардана.
 */
export async function bookingImageUrls(bookingId: string): Promise<string[]> {
  const { data: rows } = await supabase
    .from("booking_images")
    .select("storage_path")
    .eq("booking_id", bookingId)
    .order("sort_order")

  if (!rows?.length) return []

  const { data } = await supabase.storage
    .from(BUCKET_BOOKING_REFS)
    .createSignedUrls(rows.map((r) => r.storage_path), SIGNED_URL_TTL)

  // Аль нэг зам алдаа өгвөл signedUrl нь null ирдэг тул шүүнэ.
  return (data ?? []).flatMap((d) => (d.signedUrl ? [d.signedUrl] : []))
}

/** Захиалгаа цуцлана (зөвхөн pending/confirmed үед боломжтой). */
export async function cancelBooking(id: string): Promise<string | null> {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id)
  return error ? error.message : null
}

/**
 * Нэхэмжлэхийг төлөгдсөн гэж тэмдэглэнэ.
 *
 * ⚠️ Мөнгө шилжүүлэхгүй. Энэ систем ямар ч төлбөрийн системтэй
 * холбогдоогүй бөгөөд энэ дуудлага нь зөвхөн `invoices.status`-ыг
 * `paid` болгоно (0023).
 *
 * Шалгалт нь өгөгдлийн сан дээр: `mark_invoice_paid()` нь захиалгын
 * эзэн эсэхийг, нэхэмжлэх `issued` төлөвтэй эсэхийг өөрөө шалгадаг тул
 * энд давхардуулж бичихгүй.
 */
export async function payInvoice(invoiceId: string): Promise<string | null> {
  const { error } = await supabase.rpc("mark_invoice_paid", { p_invoice_id: invoiceId })
  return error ? error.message : null
}
