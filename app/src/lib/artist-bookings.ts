import { supabase } from "@/lib/supabase"
import { BUCKET_BOOKING_REFS, type BookingStatus, type InvoiceStatus } from "@/lib/db-types"

/**
 * Артистын зүгээс харах захиалгууд.
 *
 * `app/src/lib/bookings.ts` нь ҮЙЛЧЛҮҮЛЭГЧИЙН талынх (өөрийн захиалга);
 * энэ нь бизнесийн талынх. RLS нь хоёуланг нь нэг `bookings_select`
 * дүрмээр зохицуулдаг — эзэн өөрийн бизнес рүү ирсэн бүхнийг харна.
 *
 * `frontend/src/lib/bookings/queries.ts`-ийн хос. Ижил өгөгдөл харуулах
 * ёстой тул аль нэгийг өөрчилбөл нөгөөг нь мөн шалгана.
 */

/** Signed URL-ийн хугацаа (сек) — дэлгэц нэг харахад хангалттай. */
const SIGNED_URL_TTL = 60 * 60

export type ArtistBooking = {
  id: string
  status: BookingStatus
  scheduledAt: string
  /** Захиалга ирсэн мөч — жагсаалт үүгээр эрэмбэлэгдэнэ. */
  createdAt: string
  note: string | null
  /** Бүртгэлтэй хэрэглэгч, эсвэл панелаас бүртгэсэн зочин (0019). */
  customer: { name: string; phone: string | null; isGuest: boolean } | null
  /** Жишээ зургууд — bucket хувийн тул signed URL. */
  images: string[]
  /** ⚠️ Туршилтын нэхэмжлэх. Үүсээгүй бол null. */
  invoice: { id: string; amount: number; note: string | null; status: InvoiceStatus } | null
}

export type ArtistBookings = {
  businessId: string | null
  bookings: ArtistBooking[]
  counts: { total: number; today: number; pending: number }
}

const EMPTY: ArtistBookings = {
  businessId: null,
  bookings: [],
  counts: { total: 0, today: 0, pending: 0 },
}

/** Нэвтэрсэн артистын бизнес рүү ирсэн бүх захиалга. */
export async function fetchArtistBookings(): Promise<ArtistBookings> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return EMPTY

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!business) return EMPTY

  const { data: rows } = await supabase
    .from("bookings")
    .select("id, status, scheduled_at, created_at, note, customer_id, guest_name, guest_phone")
    .eq("business_id", business.id)
    // Хамгийн сүүлд ИРСЭН нь дээрээ. Үйлчилгээний цагаар (`scheduled_at`)
    // эрэмбэлбэл шинэ захиалга жагсаалтын дунд ороод анзаарагдахгүй өнгөрдөг.
    .order("created_at", { ascending: false })

  if (!rows?.length) return { ...EMPTY, businessId: business.id }

  // Зочны захиалгад customer_id байхгүй — профайл татах хэрэггүй.
  const customerIds = [...new Set(rows.map((r) => r.customer_id).filter((id) => id !== null))]
  const { data: profiles } = customerIds.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", customerIds)
    : { data: [] }
  const byCustomer = new Map((profiles ?? []).map((p) => [p.id, p]))

  const ids = rows.map((r) => r.id)
  const [{ data: images }, { data: invoices }] = await Promise.all([
    supabase.from("booking_images").select("booking_id, storage_path").in("booking_id", ids).order("sort_order"),
    supabase.from("invoices").select("id, booking_id, amount, note, status").in("booking_id", ids),
  ])

  const signed = await signPaths((images ?? []).map((i) => i.storage_path))
  const byBooking = new Map<string, string[]>()
  for (const image of images ?? []) {
    const url = signed.get(image.storage_path)
    if (!url) continue
    byBooking.set(image.booking_id, [...(byBooking.get(image.booking_id) ?? []), url])
  }
  const byInvoice = new Map((invoices ?? []).map((i) => [i.booking_id, i]))

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  return {
    businessId: business.id,
    counts: {
      total: rows.length,
      today: rows.filter((r) => {
        const at = new Date(r.scheduled_at)
        return at >= startOfDay && at < endOfDay && r.status !== "cancelled"
      }).length,
      pending: rows.filter((r) => r.status === "pending").length,
    },
    bookings: rows.map((r) => {
      const p = r.customer_id ? byCustomer.get(r.customer_id) : null
      return {
        id: r.id,
        status: r.status,
        scheduledAt: r.scheduled_at,
        createdAt: r.created_at,
        note: r.note,
        customer: p
          ? { name: p.full_name, phone: p.phone, isGuest: false }
          : r.guest_name
            ? { name: r.guest_name, phone: r.guest_phone, isGuest: true }
            : null,
        images: byBooking.get(r.id) ?? [],
        invoice: byInvoice.get(r.id) ?? null,
      }
    }),
  }
}

async function signPaths(paths: string[]) {
  const map = new Map<string, string>()
  if (!paths.length) return map

  const { data } = await supabase.storage
    .from(BUCKET_BOOKING_REFS)
    .createSignedUrls(paths, SIGNED_URL_TTL)

  for (const item of data ?? []) {
    // Аль нэг зам алдаа өгвөл signedUrl нь null ирдэг.
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl)
  }
  return map
}

/** Тухайн төлвөөс шилжиж болох үйлдлүүд — DB-ийн триггертэй (0015) ижил. */
export const NEXT_STEPS: Record<BookingStatus, { status: BookingStatus; label: string; primary?: boolean }[]> = {
  pending: [
    { status: "confirmed", label: "Баталгаажуулах", primary: true },
    { status: "cancelled", label: "Цуцлах" },
  ],
  confirmed: [
    { status: "completed", label: "Дууссан", primary: true },
    { status: "cancelled", label: "Цуцлах" },
  ],
  completed: [],
  cancelled: [],
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
}

/**
 * Захиалгын төлөв солино.
 *
 * Зөвшөөрөгдсөн шилжилтийг `enforce_booking_update()` триггер шалгадаг
 * тул энд давхар шалгалт бичихгүй — алдааны мессежийг нь шууд харуулна.
 */
export async function setArtistBookingStatus(
  id: string,
  next: BookingStatus,
): Promise<string | null> {
  const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id)
  return error ? error.message : null
}

/**
 * Нэхэмжлэх үүсгэх / дүнг засах — ⚠️ ТУРШИЛТЫН.
 *
 * Бодит төлбөр тооцоо хийгддэггүй: зөвхөн дүнг тэмдэглэж үйлчлүүлэгчид
 * харуулна. Нэг захиалгад нэг нэхэмжлэх (`invoices_booking_uniq`).
 */
export async function saveArtistInvoice(
  bookingId: string,
  businessId: string,
  amount: number,
  note: string,
): Promise<string | null> {
  if (!Number.isFinite(amount) || amount < 0) return "Дүнг зөв оруулна уу."

  const { error } = await supabase.from("invoices").upsert(
    {
      booking_id: bookingId,
      business_id: businessId,
      amount: Math.round(amount),
      note: note.trim() || null,
    },
    { onConflict: "booking_id" },
  )
  return error ? error.message : null
}
