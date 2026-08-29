import { decode } from "base64-arraybuffer"

import { supabase } from "@/lib/supabase"
import { BUCKET_PUBLIC } from "@/lib/db-types"
import { publicAssetUrl } from "@/lib/storage"

/**
 * Артистын үнийн цэс, бүтээл, хуваарь, сэтгэгдэл.
 *
 * Вэб панелийн `catalog`, `schedule`, `reviews` номын сангуудын хос.
 * Бүх бичих эрхийг RLS-ийн `owns_business()` шалгадаг тул энд зөвхөн
 * утгуудыг шалгаад дамжуулна.
 */

/** Нэвтэрсэн артистын бизнесийн id — бүх дуудлагын эхлэл. */
async function myBusinessId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()
  return data?.id ?? null
}

/* ------------------------------------------------------------ үйлчилгээ */

export type ArtistService = {
  id: string
  name: string
  description: string | null
  price: number
  durationMin: number
  isActive: boolean
}

export async function fetchArtistServices(): Promise<ArtistService[]> {
  const businessId = await myBusinessId()
  if (!businessId) return []

  const { data } = await supabase
    .from("services")
    .select("id, name, description, price, duration_min, is_active")
    .eq("business_id", businessId)
    .order("sort_order")

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    durationMin: s.duration_min,
    isActive: s.is_active,
  }))
}

/** Үйлчилгээ нэмэх/засах. `id` ирвэл засна. */
export async function saveArtistService(input: {
  id?: string
  name: string
  price: number
  durationMin: number
  description: string
  isActive: boolean
}): Promise<string | null> {
  const businessId = await myBusinessId()
  if (!businessId) return "Бизнесийн бүртгэл олдсонгүй."
  if (!input.name.trim()) return "Үйлчилгээний нэрийг бөглөнө үү."
  if (!Number.isFinite(input.price) || input.price < 0) return "Үнийг зөв оруулна уу."
  if (!Number.isFinite(input.durationMin) || input.durationMin <= 0) {
    return "Үргэлжлэх хугацааг зөв оруулна уу."
  }

  const fields = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: Math.round(input.price),
    duration_min: Math.round(input.durationMin),
    is_active: input.isActive,
  }

  if (input.id) {
    const { error } = await supabase
      .from("services")
      .update(fields)
      .eq("id", input.id)
      .eq("business_id", businessId)
    return error ? error.message : null
  }

  const { count } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)

  const { error } = await supabase
    .from("services")
    .insert({ ...fields, business_id: businessId, sort_order: count ?? 0 })
  return error ? error.message : null
}

export async function deleteArtistService(id: string): Promise<string | null> {
  const { error } = await supabase.from("services").delete().eq("id", id)
  return error ? error.message : null
}

/* -------------------------------------------------------------- бүтээл */

export type ArtistMedia = { id: string; url: string | null; caption: string | null }

export async function fetchArtistMedia(): Promise<ArtistMedia[]> {
  const businessId = await myBusinessId()
  if (!businessId) return []

  const { data } = await supabase
    .from("business_media")
    .select("id, storage_path, caption")
    .eq("business_id", businessId)
    .order("sort_order")

  return (data ?? []).map((m) => ({
    id: m.id,
    // Seed нь бүтэн URL хадгалдаг, аппаас орсон нь bucket доторх зам.
    url: m.storage_path.startsWith("http") ? m.storage_path : publicAssetUrl(m.storage_path),
    caption: m.caption,
  }))
}

/**
 * Бүтээлийн зураг нэмнэ.
 *
 * Зам нь business id-аар эхэлнэ — storage-ийн `public_assets_write` эрх
 * үүгээр шийдэгдэнэ. React Native дээр base64-аар авч хөрвүүлнэ.
 */
export async function uploadArtistMedia(
  image: { base64: string; mime: string },
  caption: string,
): Promise<string | null> {
  const businessId = await myBusinessId()
  if (!businessId) return "Бизнесийн бүртгэл олдсонгүй."

  const ext = image.mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
  // Hermes дээр `crypto.randomUUID` байхгүй тул цаг + санамсаргүй мөр.
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const path = `${businessId}/media-${unique}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_PUBLIC)
    .upload(path, decode(image.base64), { contentType: image.mime })
  if (error) return error.message

  const { count } = await supabase
    .from("business_media")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)

  const { error: rowError } = await supabase.from("business_media").insert({
    business_id: businessId,
    storage_path: path,
    caption: caption.trim() || null,
    sort_order: count ?? 0,
  })
  return rowError ? rowError.message : null
}

/**
 * Бүтээлийг устгана.
 *
 * Мөрийг устгаад файлыг ч арилгана (0016-ийн delete policy). Файл
 * арилгаж чадаагүй ч мөр устсан бол амжилттай — галерейд харагдахаа
 * больсон нь гол зорилго.
 */
export async function deleteArtistMedia(id: string): Promise<string | null> {
  const { data: row } = await supabase
    .from("business_media")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("business_media").delete().eq("id", id)
  if (error) return error.message

  if (row?.storage_path && !row.storage_path.startsWith("http")) {
    await supabase.storage.from(BUCKET_PUBLIC).remove([row.storage_path])
  }
  return null
}

/* ------------------------------------------------------------- хуваарь */

export type ArtistDay = { weekday: number; open: string; close: string; isClosed: boolean }

export type ArtistSchedule = {
  days: ArtistDay[]
  slotMinutes: number
  slotCapacity: number
}

export const WEEKDAY_LABELS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"]

/** Сонгож болох цагийн нүдний урт — вэбтэй ижил. */
export const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120]

export async function fetchArtistSchedule(): Promise<ArtistSchedule | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slot_minutes, slot_capacity")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!business) return null

  const { data: hours } = await supabase
    .from("business_hours")
    .select("weekday, open_time, close_time, is_closed")
    .eq("business_id", business.id)

  const byWeekday = new Map((hours ?? []).map((h) => [h.weekday, h]))

  return {
    slotMinutes: business.slot_minutes ?? 60,
    slotCapacity: business.slot_capacity ?? 1,
    days: Array.from({ length: 7 }, (_, weekday) => {
      const row = byWeekday.get(weekday)
      return {
        weekday,
        open: row?.open_time?.slice(0, 5) ?? "09:00",
        close: row?.close_time?.slice(0, 5) ?? "18:00",
        isClosed: row?.is_closed ?? false,
      }
    }),
  }
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export async function saveArtistSchedule(schedule: ArtistSchedule): Promise<string | null> {
  const businessId = await myBusinessId()
  if (!businessId) return "Бизнесийн бүртгэл олдсонгүй."

  for (const d of schedule.days) {
    if (d.isClosed) continue
    if (!TIME_RE.test(d.open) || !TIME_RE.test(d.close)) {
      return `${WEEKDAY_LABELS[d.weekday]} гарагийн цагийг бүрэн оруулна уу.`
    }
    if (d.open >= d.close) {
      return `${WEEKDAY_LABELS[d.weekday]} гарагийн хаах цаг нээх цагаас хойш байна.`
    }
  }

  // (business_id, weekday) түлхүүртэй тул upsert — устгаад дахин оруулбал
  // алдаа гарсан үед хуваарь бүрмөсөн алга болох эрсдэлтэй.
  const { error } = await supabase.from("business_hours").upsert(
    schedule.days.map((d) => ({
      business_id: businessId,
      weekday: d.weekday,
      open_time: d.open,
      close_time: d.close,
      is_closed: d.isClosed,
    })),
    { onConflict: "business_id,weekday" },
  )
  if (error) return error.message

  const { error: bizError } = await supabase
    .from("businesses")
    .update({ slot_minutes: schedule.slotMinutes, slot_capacity: schedule.slotCapacity })
    .eq("id", businessId)
  return bizError ? bizError.message : null
}

/* ----------------------------------------------------------- сэтгэгдэл */

export type ArtistReview = {
  id: string
  authorName: string
  rating: number
  body: string | null
  reply: string | null
  createdAt: string
}

export async function fetchArtistReviews(): Promise<ArtistReview[]> {
  const businessId = await myBusinessId()
  if (!businessId) return []

  const { data } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, reply, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((r) => ({
    id: r.id,
    authorName: r.author_name || "Хэрэглэгч",
    rating: r.rating,
    body: r.body,
    reply: r.reply,
    createdAt: r.created_at,
  }))
}

/**
 * Сэтгэгдэлд хариу бичнэ.
 *
 * RLS нь баганаар хязгаарлаж чаддаггүй тул хариуг зөвхөн `reply_to_review`
 * функцээр бичнэ (0012) — эс тэгвэл эзэн оноогоо ч өөрчилж чадах болно.
 * Хоосон илгээвэл хариуг устгана.
 */
export async function replyToArtistReview(id: string, body: string): Promise<string | null> {
  const { error } = await supabase.rpc("reply_to_review", { rid: id, body })
  return error ? error.message : null
}
