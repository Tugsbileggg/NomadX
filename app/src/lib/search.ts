import { fetchApprovedBusinesses, type BusinessCard } from "@/lib/businesses"
import { supabase } from "@/lib/supabase"

export type SearchBusiness = BusinessCard & {
  /** Сэтгэгдэл байхгүй бол null. */
  rating: number | null
  reviewCount: number
  /** Хамгийн хямд идэвхтэй үйлчилгээний үнэ — үйлчилгээгүй бол null. */
  minPrice: number | null
  /** Өнөөдөр хаагдах цаг ("20:00") — амарч байвал null. */
  openUntil: string | null
  isFavourite: boolean
}

/**
 * Хайх дэлгэцэд хэрэгтэй бүхнийг татна.
 *
 * Зайг энд тооцохгүй — байршлын зөвшөөрөл хойно ирдэг тул дэлгэц дээрээ
 * тооцвол хэрэглэгч зөвшөөрөл өгмөгц дахин татах шаардлагагүй.
 */
export async function fetchSearchBusinesses(): Promise<SearchBusiness[]> {
  const businesses = await fetchApprovedBusinesses()
  if (!businesses.length) return []

  const ids = businesses.map((b) => b.id)
  // business_hours дээр 0 = Даваа, JS дээр 0 = Ням.
  const weekday = (new Date().getDay() + 6) % 7

  const [ratings, services, hours, favourites] = await Promise.all([
    supabase.from("business_ratings").select("business_id, rating, review_count").in("business_id", ids),
    supabase
      .from("services")
      .select("business_id, price")
      .in("business_id", ids)
      .eq("is_active", true),
    supabase
      .from("business_hours")
      .select("business_id, close_time, is_closed")
      .in("business_id", ids)
      .eq("weekday", weekday),
    fetchFavouriteIds(),
  ])

  const byRating = new Map((ratings.data ?? []).map((r) => [r.business_id, r]))

  // Бизнес бүрийн хамгийн хямд үйлчилгээ.
  const minPrice = new Map<string, number>()
  for (const s of services.data ?? []) {
    const current = minPrice.get(s.business_id)
    if (current == null || s.price < current) minPrice.set(s.business_id, s.price)
  }

  const byHours = new Map((hours.data ?? []).map((h) => [h.business_id, h]))

  return businesses.map((b) => {
    const rating = byRating.get(b.id)
    const today = byHours.get(b.id)

    return {
      ...b,
      rating: rating?.rating ?? null,
      reviewCount: rating?.review_count ?? 0,
      minPrice: minPrice.get(b.id) ?? null,
      openUntil:
        today && !today.is_closed && today.close_time ? today.close_time.slice(0, 5) : null,
      isFavourite: favourites.has(b.id),
    }
  })
}

/** Нэвтэрсэн хэрэглэгчийн дуртай бизнесүүдийн id. */
export async function fetchFavouriteIds(): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data } = await supabase.from("favourites").select("business_id").eq("customer_id", user.id)
  return new Set((data ?? []).map((f) => f.business_id))
}

/**
 * Дуртай эсэхийг сэлгэнэ. Амжилттай бол шинэ төлөвийг, алдаа гарвал
 * `null` буцаана — дэлгэц дээр өөрчлөлтөө буцаана.
 */
export async function toggleFavourite(businessId: string, next: boolean): Promise<boolean | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { error } = next
    ? await supabase.from("favourites").insert({ customer_id: user.id, business_id: businessId })
    : await supabase
        .from("favourites")
        .delete()
        .eq("customer_id", user.id)
        .eq("business_id", businessId)

  return error ? null : next
}

/** 45000 → "₮45,000+" */
export function formatFromPrice(mnt: number) {
  return `₮${mnt.toLocaleString("en-US")}+`
}
