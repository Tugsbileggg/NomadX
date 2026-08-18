import { supabase } from "@/lib/supabase"
import type { BusinessType } from "@/lib/db-types"

export type BusinessCard = {
  id: string
  type: BusinessType
  name: string | null
  address: string | null
  about: string | null
  logoPath: string | null
  coverPath: string | null
  lat: number | null
  lng: number | null
  categories: string[]
}

const CARD_COLUMNS = "id, type, name, address, about, logo_path, cover_path, lat, lng"

/** Зөвшөөрөгдсөн (approved) бүх бизнесийг ангилалтай нь хамт татна. */
export async function fetchApprovedBusinesses(): Promise<BusinessCard[]> {
  const { data: rows, error } = await supabase
    .from("businesses")
    .select(CARD_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (error || !rows) return []

  const ids = rows.map((r) => r.id)
  const { data: cats } = await supabase
    .from("business_categories")
    .select("business_id, category")
    .in("business_id", ids)

  const byBusiness = new Map<string, string[]>()
  for (const c of cats ?? []) {
    const list = byBusiness.get(c.business_id) ?? []
    list.push(c.category)
    byBusiness.set(c.business_id, list)
  }

  return rows.map((r) => toCard(r, byBusiness.get(r.id) ?? []))
}

/** Нэг бизнесийн дэлгэрэнгүйг татна. */
export async function fetchBusiness(id: string): Promise<BusinessCard | null> {
  const { data: r, error } = await supabase
    .from("businesses")
    .select(CARD_COLUMNS)
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle()

  if (error || !r) return null

  const { data: cats } = await supabase
    .from("business_categories")
    .select("category")
    .eq("business_id", id)

  return toCard(
    r,
    (cats ?? []).map((c) => c.category),
  )
}

function toCard(
  r: {
    id: string
    type: BusinessType
    name: string | null
    address: string | null
    about: string | null
    logo_path: string | null
    cover_path: string | null
    lat: number | null
    lng: number | null
  },
  categories: string[],
): BusinessCard {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    address: r.address,
    about: r.about,
    logoPath: r.logo_path,
    coverPath: r.cover_path,
    lat: r.lat,
    lng: r.lng,
    categories,
  }
}
