import { fetchBusiness, type BusinessCard } from "@/lib/businesses"
import { supabase } from "@/lib/supabase"

/** Профайл дээр эхлээд харуулах сэтгэгдлийн тоо. */
export const REVIEW_PREVIEW = 3

export type ProfileService = {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
}

export type ProfileStaff = {
  id: string
  name: string
  role: string | null
  photoPath: string | null
}

export type ProfileMedia = {
  id: string
  path: string
  caption: string | null
}

export type ProfileReview = {
  id: string
  authorName: string
  rating: number
  body: string | null
  createdAt: string
}

export type BusinessProfile = {
  business: BusinessCard
  services: ProfileService[]
  staff: ProfileStaff[]
  gallery: ProfileMedia[]
  reviews: ProfileReview[]
  /** Сэтгэгдэл огт байхгүй бол null. */
  rating: { average: number; count: number } | null
  /** Өнөөдрийн ажлын цаг — амарч байвал null. */
  todayHours: { open: string; close: string } | null
}

/**
 * Профайлын дэлгэцэд хэрэгтэй бүх зүйлийг нэг дуудлагаар татна.
 *
 * Бизнес олдоогүй (эсвэл зөвшөөрөгдөөгүй) бол шууд null буцаана — үлдсэн
 * зургаан хүсэлтийг дэмий явуулах шаардлагагүй. Дараа нь бүгдийг зэрэг
 * илгээнэ: аль нэг нь унасан ч тухайн хэсэг л хоосон гарна.
 */
export async function fetchBusinessProfile(id: string): Promise<BusinessProfile | null> {
  const business = await fetchBusiness(id)
  if (!business) return null

  // business_hours дээр 0 = Даваа, JS дээр 0 = Ням.
  const weekday = (new Date().getDay() + 6) % 7

  const [services, staff, gallery, reviews, rating, hours] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, price, duration_min")
      .eq("business_id", id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("business_staff")
      .select("id, name, role, photo_path")
      .eq("business_id", id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("business_media")
      .select("id, storage_path, caption")
      .eq("business_id", id)
      .order("sort_order"),
    supabase
      .from("reviews")
      .select("id, author_name, rating, body, created_at")
      .eq("business_id", id)
      .order("created_at", { ascending: false })
      .limit(REVIEW_PREVIEW),
    supabase
      .from("business_ratings")
      .select("rating, review_count")
      .eq("business_id", id)
      .maybeSingle(),
    supabase
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("business_id", id)
      .eq("weekday", weekday)
      .maybeSingle(),
  ])

  const today = hours.data
  const openToday =
    today && !today.is_closed && today.open_time && today.close_time
      ? { open: hhmm(today.open_time), close: hhmm(today.close_time) }
      : null

  return {
    business,
    services: (services.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      durationMin: s.duration_min,
    })),
    staff: (staff.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      photoPath: m.photo_path,
    })),
    gallery: (gallery.data ?? []).map((g) => ({
      id: g.id,
      path: g.storage_path,
      caption: g.caption,
    })),
    reviews: (reviews.data ?? []).map((r) => ({
      id: r.id,
      authorName: r.author_name,
      rating: r.rating,
      body: r.body,
      createdAt: r.created_at,
    })),
    rating: rating.data ? { average: rating.data.rating, count: rating.data.review_count } : null,
    todayHours: openToday,
  }
}

/** Postgres `time` нь "09:00:00" гэж ирдэг — цаг:минут болгоно. */
function hhmm(value: string) {
  return value.slice(0, 5)
}

/** 45000 → "45,000₮" */
export function formatPrice(mnt: number) {
  return `${mnt.toLocaleString("en-US")}₮`
}

/** 90 → "1ц 30мин", 45 → "45 мин" */
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} цаг` : `${h}ц ${m}мин`
}
