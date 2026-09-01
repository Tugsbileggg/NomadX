import { decode } from "base64-arraybuffer"

import { supabase } from "@/lib/supabase"
import { ARTIST_CATEGORIES } from "@/lib/artist-registration"
import { BUCKET_PUBLIC } from "@/lib/db-types"
import { geocodeAddress } from "@/lib/geocode"
import { publicAssetUrl } from "@/lib/storage"

/**
 * Батлагдсан артистын профайл засах.
 *
 * `businesses_update_own` (0003) нь `approved` төлөвт ч засварыг
 * зөвшөөрдөг тул бүртгэл батлагдсаны дараа ч мэдээллээ шинэчилж болно.
 *
 * `frontend/src/lib/business-profile/actions.ts`-ийн хос.
 */

export { ARTIST_CATEGORIES }

export type ArtistProfile = {
  id: string
  name: string
  phone: string
  address: string
  about: string
  categories: string[]
  logoUrl: string | null
  coverUrl: string | null
  /** Газрын зураг дээрх байршил — хэзээ ч тавиагүй бол null. */
  lat: number | null
  lng: number | null
}

export async function fetchArtistProfile(): Promise<ArtistProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone, address, about, logo_path, cover_path, lat, lng")
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
    logoUrl: publicAssetUrl(business.logo_path),
    coverUrl: publicAssetUrl(business.cover_path),
    lat: business.lat,
    lng: business.lng,
  }
}

/**
 * Профайлын мэдээллийг хадгална.
 *
 * Байршлыг хоёр эх сурвалжаас авна:
 *
 * 1. `coords` — эзэн нь газрын зураг дээр гараар тавьсан цэг. Үргэлж
 *    давуу эрхтэй: хаягийн бичвэрээс таасан цэгээс эзний өөрийнх нь
 *    тэмдэглэсэн байршил үргэлж зөв.
 * 2. Үгүй бол хаяг өөрчлөгдсөн тохиолдолд geocode. Nominatim-ийг дэмий
 *    дуудахгүйн тулд зөвхөн өөрчлөгдсөн үед.
 *
 * Аль нь ч гарахгүй бол хуучин координат хэвээр үлдэнэ — хадгалалт
 * geocoding-оос болж саатах ёсгүй.
 */
export async function saveArtistProfile(input: {
  name: string
  phone: string
  address: string
  about: string
  categories: string[]
  /** Газрын зураг дээр гараар тавьсан цэг. */
  coords?: { lat: number; lng: number } | null
}): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  if (!input.name.trim()) return "Нэрээ бөглөнө үү."
  if (!input.phone.trim()) return "Утасны дугаараа бөглөнө үү."
  if (!input.categories.length) return "Дор хаяж нэг чиглэл сонгоно уу."

  const { data: business } = await supabase
    .from("businesses")
    .select("id, address")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!business) return "Бизнесийн бүртгэл олдсонгүй."

  const address = input.address.trim()
  const coords =
    input.coords ??
    (address && address !== business.address ? await geocodeAddress(address) : null)

  const { error } = await supabase
    .from("businesses")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: address || null,
      about: input.about.trim() || null,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
    .eq("id", business.id)
  if (error) return error.message

  // Ангиллыг бүхэлд нь солино — хассаныг нь мөн тусгана.
  await supabase.from("business_categories").delete().eq("business_id", business.id)
  const { error: catError } = await supabase
    .from("business_categories")
    .insert(input.categories.map((category) => ({ business_id: business.id, category })))

  return catError ? catError.message : null
}

/**
 * Лого эсвэл ковер зураг солино.
 *
 * `business-public` нь нийтийн bucket — эдгээр нь үйлчлүүлэгчид харагдах
 * зураг. Зам нь business id-аар эхэлнэ (`public_assets_write`).
 */
export async function uploadArtistImage(
  kind: "logo" | "cover",
  image: { base64: string; mime: string },
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  const { data: business } = await supabase
    .from("businesses")
    .select("id, logo_path, cover_path")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!business) return "Бизнесийн бүртгэл олдсонгүй."

  const ext = image.mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
  // Hermes дээр `crypto.randomUUID` байхгүй тул цаг + санамсаргүй мөр.
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const path = `${business.id}/${kind}-${unique}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_PUBLIC)
    .upload(path, decode(image.base64), { contentType: image.mime })
  if (error) return error.message

  const previous = kind === "logo" ? business.logo_path : business.cover_path

  // Тооцоолсон түлхүүр нь `Partial<Business>`-д тохирохгүй тул тодорхой бичив.
  const { error: updateError } = await supabase
    .from("businesses")
    .update(kind === "logo" ? { logo_path: path } : { cover_path: path })
    .eq("id", business.id)
  if (updateError) return updateError.message

  // Хуучин файлыг арилгана (0016-ийн delete policy). Амжилтгүй болсон ч
  // шинэ зураг аль хэдийн холбогдсон тул алдаа гэж үзэхгүй.
  if (previous) await supabase.storage.from(BUCKET_PUBLIC).remove([previous])

  return null
}
