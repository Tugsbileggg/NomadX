import { decode } from "base64-arraybuffer"

import { supabase } from "@/lib/supabase"
import { BUCKET_DOCS, type DocumentKind } from "@/lib/db-types"

/**
 * Хувиараа артистын бүртгэл — аппын гурван алхам.
 *
 * Вэбийн 5 алхамт wizard-аас ялгаатай нь банкны данс энд БАЙХГҮЙ: бодит
 * төлбөр тооцоо хараахан хийгддэггүй тул одоо асуух нь утгагүй. Хожим
 * төлбөр нэмэгдэхэд тусад нь алхам болгоно.
 *
 * Утгуудыг вэбтэй нийцүүлэв (ангиллын нэр, гэрээний хувилбар) — нэг л
 * `businesses` хүснэгт рүү бичдэг тул зөрвөл админы хуудсанд эвгүй харагдана.
 */

/** Вэбийн `SERVICE_TAGS`-тай ижил байх ёстой. */
export const ARTIST_CATEGORIES = [
  "Гоо сайхан",
  "Үсчин",
  "Хумс",
  "Спа, Массаж",
  "Арьс арчилгаа",
]

/** Вэбийн `CONTRACT_VERSION`-тэй ижил. */
const CONTRACT_VERSION = "2024-10-01"

/** Аппаас шаардах баримт бичиг. Вэб дээр илүү олон төрөл асуудаг. */
export const REQUIRED_DOCS: DocumentKind[] = ["id_front"]
export const OPTIONAL_DOCS: DocumentKind[] = ["certificate"]

export const DOC_LABEL: Record<string, { title: string; hint: string }> = {
  id_front: {
    title: "Иргэний үнэмлэх",
    hint: "Урд талын гэрэл зураг — нэр, регистр тод харагдана уу.",
  },
  certificate: {
    title: "Мэргэжлийн үнэмлэх",
    hint: "Байвал хавсаргана уу. Заавал биш ч итгэл нэмнэ.",
  },
}

export type ArtistInfo = {
  name: string
  phone: string
  address: string
  about: string
  categories: string[]
}

/** Шинэ артистад анхдагчаар тавих ажлын цаг — дараа нь Хуваарь дээр засна. */
const DEFAULT_HOURS = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  open_time: "09:00",
  close_time: "18:00",
  // 6 = Ням.
  is_closed: weekday === 6,
}))

/**
 * 1-р алхам. Бизнес байхгүй бол үүсгэнэ, байвал шинэчилнэ.
 *
 * Ажлын цагийг зөвхөн ШИНЭЭР үүсгэх үед тавина — буцаж ирээд мэдээллээ
 * засахад хэрэглэгчийн тохируулсан цаг дарагдах ёсгүй.
 */
export async function saveArtistInfo(info: ArtistInfo): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  if (!info.name.trim()) return "Нэрээ бөглөнө үү."
  if (!info.phone.trim()) return "Утасны дугаараа бөглөнө үү."
  if (!info.address.trim()) return "Хаягаа бөглөнө үү."
  if (!info.categories.length) return "Дор хаяж нэг чиглэл сонгоно уу."

  const fields = {
    name: info.name.trim(),
    phone: info.phone.trim(),
    address: info.address.trim(),
    about: info.about.trim() || null,
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("id, current_step")
    .eq("owner_id", user.id)
    .maybeSingle()

  let businessId = existing?.id

  if (businessId) {
    const { error } = await supabase
      .from("businesses")
      .update({ ...fields, current_step: Math.max(existing!.current_step, 2) })
      .eq("id", businessId)
    if (error) return error.message
  } else {
    const { data, error } = await supabase
      .from("businesses")
      .insert({ ...fields, owner_id: user.id, type: "artist", status: "draft", current_step: 2 })
      .select("id")
      .single()
    if (error || !data) return error?.message ?? "Бүртгэл үүсгэж чадсангүй."
    businessId = data.id

    const { error: hoursError } = await supabase
      .from("business_hours")
      .insert(DEFAULT_HOURS.map((h) => ({ ...h, business_id: businessId })))
    if (hoursError) return hoursError.message
  }

  // Ангиллыг бүхэлд нь солино — хассаныг нь мөн тусгана.
  await supabase.from("business_categories").delete().eq("business_id", businessId)
  const { error } = await supabase
    .from("business_categories")
    .insert(info.categories.map((category) => ({ business_id: businessId, category })))

  return error ? error.message : null
}

/** Одоогийн бизнесийн оруулсан мэдээлэл — буцаж ирээд засахад. */
export async function fetchArtistDraft(): Promise<(ArtistInfo & { id: string }) | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone, address, about")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!business) return null

  const { data: categories } = await supabase
    .from("business_categories")
    .select("category")
    .eq("business_id", business.id)

  return {
    id: business.id,
    name: business.name ?? "",
    phone: business.phone ?? "",
    address: business.address ?? "",
    about: business.about ?? "",
    categories: (categories ?? []).map((c) => c.category),
  }
}

/**
 * 2-р алхам. Баримт бичгийг хувийн bucket руу тавина.
 *
 * React Native дээр `fetch(uri).arrayBuffer()` найдваргүй тул ImagePicker-ээс
 * base64-аар авч хөрвүүлнэ — захиалгын жишээ зурагтай ижил арга.
 *
 * Зам нь business id-аар эхэлнэ: storage-ийн `docs_owner_write` эрх үүгээр
 * шийдэгдэнэ.
 */
export async function uploadArtistDocument(
  businessId: string,
  kind: DocumentKind,
  image: { base64: string; mime: string },
): Promise<string | null> {
  const ext = image.mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
  // Hermes дээр `crypto.randomUUID` байхгүй тул цаг + санамсаргүй мөр.
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const path = `${businessId}/${kind}-${unique}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_DOCS)
    .upload(path, decode(image.base64), { contentType: image.mime })
  if (error) return error.message

  // Нэг төрөлд нэг файл — хуучныг сольж бичнэ.
  await supabase.from("documents").delete().eq("business_id", businessId).eq("kind", kind)
  const { error: rowError } = await supabase.from("documents").insert({
    business_id: businessId,
    kind,
    storage_path: path,
    mime: image.mime,
  })
  if (rowError) return rowError.message

  await supabase
    .from("businesses")
    .update({ current_step: 3 })
    .eq("id", businessId)
    .lt("current_step", 3)

  return null
}

/** Аль баримт бичиг орсныг харуулна. */
export async function fetchArtistDocuments(businessId: string): Promise<Set<DocumentKind>> {
  const { data } = await supabase
    .from("documents")
    .select("kind")
    .eq("business_id", businessId)

  return new Set((data ?? []).map((d) => d.kind))
}

/**
 * 3-р алхам. Гэрээнд гарын үсэг зурж бүртгэлээ илгээнэ.
 *
 * Илгээмэгц `businesses_update_own` (0003) нь `submitted` төлөвт засварыг
 * хаадаг тул энэ бол буцаах боломжгүй алхам — UI дээр сануулна.
 */
export async function submitArtistRegistration(
  businessId: string,
  signedName: string,
): Promise<string | null> {
  if (!signedName.trim()) return "Цахим гарын үсгээ бичнэ үү."

  await supabase.from("contracts").delete().eq("business_id", businessId)
  const { error } = await supabase.from("contracts").insert({
    business_id: businessId,
    version: CONTRACT_VERSION,
    signed_name: signedName.trim(),
  })
  if (error) return error.message

  const { error: submitError } = await supabase
    .from("businesses")
    .update({
      status: "submitted",
      current_step: 5,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", businessId)

  return submitError ? submitError.message : null
}
