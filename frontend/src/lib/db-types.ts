// АВТОМАТААР ҮҮССЭН — гараар засахгүй.
// Эх сурвалж: server/src/db/types.ts · шинэчлэх: cd server && npm run sync:types

/**
 * LUMINA — Supabase схемийн TypeScript тодорхойлолт.
 *
 * Эх сурвалж: `server/supabase/migrations/` доторх бүх migration.
 * frontend (Next.js), app (Expo), server (Hono) гурав энэ файлыг хуваалцана.
 *
 * Схем өөрчлөгдвөл шинэ migration нэмээд энэ файлыг мөн шинэчилнэ.
 * Эсвэл Supabase CLI-аар автоматаар гаргаж авна:
 *   npx supabase gen types typescript --project-id <ref> > src/db/types.ts
 */

/* ----------------------------------------------------------------- enums */

export type BusinessType = "salon" | "artist"

export type UserRole = "salon" | "artist" | "super_admin" | "customer"

export type BusinessStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_info"

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

/** ⚠️ Туршилтын нэхэмжлэх — бодит төлбөр тооцоо хийгддэггүй. */
export type InvoiceStatus = "issued" | "paid" | "cancelled"

export type DocumentKind =
  | "id_front"
  | "id_back"
  | "license"
  | "certificate"
  | "logo"
  | "cover"

/* ---------------------------------------------------------------- tables */

export type Profile = {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  created_at: string
}

export type Business = {
  id: string
  owner_id: string
  type: BusinessType
  name: string | null
  reg_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  about: string | null
  staff_size: string | null
  logo_path: string | null
  cover_path: string | null
  lat: number | null
  lng: number | null
  status: BusinessStatus
  /** Захиалгын нэг цагийн нүдний урт, минутаар (0014). */
  slot_minutes: number
  /** Нэг цагт зэрэг үйлчилж чадах тоо (0014). */
  slot_capacity: number
  /** 1..5 — бүртгэлийн wizard хаана зогссоныг заана */
  current_step: number
  submitted_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  reject_reason: string | null
  created_at: string
  updated_at: string
}

export type BusinessHour = {
  business_id: string
  /** 0 = Даваа … 6 = Ням */
  weekday: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export type BusinessCategory = {
  business_id: string
  category: string
}

export type Document = {
  id: string
  business_id: string
  kind: DocumentKind
  storage_path: string
  mime: string | null
  size_bytes: number | null
  uploaded_at: string
}

export type PayoutAccount = {
  business_id: string
  bank_name: string | null
  holder_name: string | null
  account_number: string | null
  updated_at: string
}

export type Contract = {
  id: string
  business_id: string
  version: string
  signed_name: string
  signed_at: string
  ip_address: string | null
}

export type VerificationEvent = {
  id: string
  business_id: string
  actor_id: string | null
  from_status: BusinessStatus | null
  to_status: BusinessStatus
  note: string | null
  created_at: string
}

export type Booking = {
  id: string
  /** Зочны захиалгад null — оронд нь guest_name/guest_phone (0019). */
  customer_id: string | null
  business_id: string
  status: BookingStatus
  scheduled_at: string
  note: string | null
  /** Бүртгэлгүй зочны нэр — панелаас үүсгэсэн захиалгад (0019). */
  guest_name: string | null
  guest_phone: string | null
  created_at: string
  updated_at: string
}

export type BookingImage = {
  id: string
  booking_id: string
  /** booking-refs bucket доторх зам: `<customer_id>/<uuid>.<ext>` */
  storage_path: string
  sort_order: number
  created_at: string
}

/**
 * Захиалгын нэхэмжлэх — ЗӨВХӨН ТУРШИЛТЫН бүртгэл.
 * Гүйлгээ хийгддэггүй; бизнес дүнгээ бичиж, үйлчлүүлэгч хардаг.
 */
export type Invoice = {
  id: string
  booking_id: string
  business_id: string
  /** Төгрөгөөр, бүхэл тоо */
  amount: number
  note: string | null
  status: InvoiceStatus
  created_at: string
  updated_at: string
}

/** Хэрэглэгчийн дуртай бизнес — зөвхөн эзэн нь харна. */
export type Favourite = {
  customer_id: string
  business_id: string
  created_at: string
}

export type Service = {
  id: string
  business_id: string
  name: string
  description: string | null
  /** Төгрөгөөр, бүхэл тоо */
  price: number
  duration_min: number
  category: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type BusinessStaff = {
  id: string
  business_id: string
  name: string
  role: string | null
  photo_path: string | null
  bio: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type BusinessMedia = {
  id: string
  business_id: string
  /** business-public bucket доторх зам, эсвэл бүтэн http(s) URL */
  storage_path: string
  caption: string | null
  sort_order: number
  created_at: string
}

export type Review = {
  id: string
  business_id: string
  author_id: string
  /** Бичигдсэн үеийн нэрийн хуулбар — profiles-ийн RLS join хийхийг зөвшөөрдөггүй */
  author_name: string
  booking_id: string | null
  /** 1..5 */
  rating: number
  body: string | null
  /** Бизнесийн хариу — зөвхөн `reply_to_review()`-ээр бичигдэнэ. */
  reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

/* ----------------------------------------------------------------- views */

/** `business_ratings` — сэтгэгдлийн дундаж болон тоо. */
export type BusinessRating = {
  business_id: string
  rating: number
  review_count: number
}

/* --------------------------------------------------------------- storage */

/** Хувийн bucket — баримт бичиг. Зам: `<business_id>/<kind>-<uuid>.<ext>` */
export const BUCKET_DOCS = "business-docs" as const

/** Нийтийн bucket — лого, ковер зураг. */
export const BUCKET_PUBLIC = "business-public" as const

/**
 * Хувийн bucket — захиалгын жишээ зураг. Зам: `<customer_id>/<uuid>.<ext>`
 * Зөвхөн захиалагч болон захиалга хүлээн авсан бизнес уншина.
 */
export const BUCKET_BOOKING_REFS = "booking-refs" as const

/* ------------------------------------------------- supabase-js generic DB */

type Row<T> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] }

export type Database = {
  public: {
    Tables: {
      profiles: Row<Profile>
      businesses: Row<Business>
      business_hours: Row<BusinessHour>
      business_categories: Row<BusinessCategory>
      documents: Row<Document>
      payout_accounts: Row<PayoutAccount>
      contracts: Row<Contract>
      verification_events: Row<VerificationEvent>
      bookings: Row<Booking>
      services: Row<Service>
      business_staff: Row<BusinessStaff>
      business_media: Row<BusinessMedia>
      reviews: Row<Review>
      booking_images: Row<BookingImage>
      invoices: Row<Invoice>
      favourites: Row<Favourite>
    }
    Views: {
      // supabase-js нь View бүрээс `Relationships`-ийг шаарддаг — үүнгүй бол
      // Database төрөл нь хязгаарлалтад тохирохгүй болж, бүх хүснэгтийн мөр
      // `never` болж унана.
      business_ratings: { Row: BusinessRating; Relationships: [] }
    }
    Functions: {
      is_super_admin: { Args: Record<never, never>; Returns: boolean }
      owns_business: { Args: { bid: string }; Returns: boolean }
      can_read_business: { Args: { bid: string }; Returns: boolean }
      owns_booking: { Args: { bid: string }; Returns: boolean }
      can_read_booking: { Args: { bid: string }; Returns: boolean }
      reply_to_review: { Args: { rid: string; body: string }; Returns: undefined }
      /** Эзэлсэн цагууд — зөвхөн цаг, тоо (0014). */
      booking_slot_load: {
        Args: { bid: string; from_ts: string; to_ts: string }
        Returns: { slot: string; taken: number }[]
      }
    }
    Enums: {
      business_type: BusinessType
      user_role: UserRole
      business_status: BusinessStatus
      document_kind: DocumentKind
      booking_status: BookingStatus
      invoice_status: InvoiceStatus
    }
  }
}
