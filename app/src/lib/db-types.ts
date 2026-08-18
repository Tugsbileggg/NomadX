// АВТОМАТААР ҮҮССЭН — гараар засахгүй.
// Эх сурвалж: server/src/db/types.ts · шинэчлэх: cd server && npm run sync:types

/**
 * LUMINA — Supabase схемийн TypeScript тодорхойлолт.
 *
 * Эх сурвалж: `server/supabase/migrations/0001_init.sql`.
 * frontend (Next.js), app (Expo), server (Hono) гурав энэ файлыг хуваалцана.
 *
 * Схем өөрчлөгдвөл шинэ migration нэмээд энэ файлыг мөн шинэчилнэ.
 * Эсвэл Supabase CLI-аар автоматаар гаргаж авна:
 *   npx supabase gen types typescript --project-id <ref> > src/db/types.ts
 */

/* ----------------------------------------------------------------- enums */

export type BusinessType = "salon" | "artist"

export type UserRole = "salon" | "artist" | "super_admin"

export type BusinessStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_info"

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

/* --------------------------------------------------------------- storage */

/** Хувийн bucket — баримт бичиг. Зам: `<business_id>/<kind>-<uuid>.<ext>` */
export const BUCKET_DOCS = "business-docs" as const

/** Нийтийн bucket — лого, ковер зураг. */
export const BUCKET_PUBLIC = "business-public" as const

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
    }
    Views: Record<never, never>
    Functions: {
      is_super_admin: { Args: Record<never, never>; Returns: boolean }
      owns_business: { Args: { bid: string }; Returns: boolean }
      can_read_business: { Args: { bid: string }; Returns: boolean }
    }
    Enums: {
      business_type: BusinessType
      user_role: UserRole
      business_status: BusinessStatus
      document_kind: DocumentKind
    }
  }
}
