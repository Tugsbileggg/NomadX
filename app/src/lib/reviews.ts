import { supabase } from "@/lib/supabase"

/**
 * Үйлчлүүлэгчийн сэтгэгдэл.
 *
 * Нэг хэрэглэгч нэг бизнест нэг л сэтгэгдэл үлдээнэ (0007-ийн
 * `reviews_author_business_uniq`) — дахин бичих нь засах гэсэн үг.
 * Сэтгэгдэл бичихийн тулд тухайн бизнест **дууссан захиалгатай** байх
 * ёстой (0017).
 */

export type MyReview = {
  id: string
  rating: number
  body: string | null
}

export type ReviewEligibility = {
  /** Дууссан захиалгатай юу — үгүй бол маягт харуулах утгагүй. */
  canReview: boolean
  /** Сэтгэгдлийг холбох захиалга — байхгүй бол null. */
  bookingId: string | null
  /** Урьд бичсэн сэтгэгдэл — байхгүй бол null. */
  mine: MyReview | null
}

const NOT_ELIGIBLE: ReviewEligibility = { canReview: false, bookingId: null, mine: null }

/** Тухайн бизнест сэтгэгдэл бичих эрхтэй эсэх, өмнөх сэтгэгдэл нь юу вэ. */
export async function fetchReviewEligibility(businessId: string): Promise<ReviewEligibility> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NOT_ELIGIBLE

  const [booking, mine] = await Promise.all([
    supabase
      .from("bookings")
      .select("id")
      .eq("customer_id", user.id)
      .eq("business_id", businessId)
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select("id, rating, body")
      .eq("business_id", businessId)
      .eq("author_id", user.id)
      .maybeSingle(),
  ])

  return {
    canReview: Boolean(booking.data),
    bookingId: booking.data?.id ?? null,
    mine: mine.data ?? null,
  }
}

/**
 * Сэтгэгдэл хадгална — байхгүй бол шинээр, байвал засна.
 *
 * `author_name` нь бичигдсэн үеийн нэрийн хуулбар: `profiles`-ийн RLS нь
 * бусдын мөрийг уншуулдаггүй тул сэтгэгдэл харуулахад join хийх боломжгүй.
 */
export async function saveReview(
  businessId: string,
  rating: number,
  body: string,
  bookingId: string | null,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  if (rating < 1 || rating > 5) return "Оноогоо сонгоно уу."

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  const { error } = await supabase.from("reviews").upsert(
    {
      business_id: businessId,
      author_id: user.id,
      author_name: profile?.full_name?.trim() || "Хэрэглэгч",
      booking_id: bookingId,
      rating,
      body: body.trim() || null,
    },
    { onConflict: "business_id,author_id" },
  )

  return error ? error.message : null
}

/** Өөрийн сэтгэгдлийг устгана. */
export async function deleteMyReview(id: string): Promise<string | null> {
  const { error } = await supabase.from("reviews").delete().eq("id", id)
  return error ? error.message : null
}
