/**
 * OpenStreetMap Nominatim-аар хаягийг координат болгоно.
 *
 * `frontend/src/lib/geocode.ts`-ийн хос — хоёр тал ижил хаягийг ижил
 * цэг рүү буулгах ёстой.
 *
 * ⚠️ Дүүргийн нэр рүү УНАХГҮЙ. Nominatim нь "Сүхбаатар дүүрэг" гэх мэт
 * асуулгад захиргааны полигоны ТӨВИЙГ буцаадаг — тэр цэг нь (1) тухайн
 * дүүргийн бүх бизнест ижил тул газрын зурагт бүгд нэг цэг дээр давхарлан
 * ордог, (2) дүүргүүд хөдөө хүртэл үргэлжилдэг тул ихэвчлэн хотоос гадуур
 * унадаг (Сүхбаатарынх хотоос 15 км хойд). Буруу цэгээс цэггүй нь дээр —
 * олдоогүй бол `null` буцаана.
 *
 * Үнэгүй сервис (1 хүсэлт/сек) тул алдаа/хугацаа хэтрэхэд мөн null буцаана:
 * профайл хадгалах үйлдэл geocoding-оос болж саатах ёсгүй.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null

  try {
    return await query(`${address}, Улаанбаатар, Монгол`)
  } catch {
    return null
  }
}

async function query(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
  // Nominatim нь User-Agent шаарддаг — үгүй бол 403 буцаана.
  const res = await fetch(url, { headers: { "User-Agent": "LUMINA-app/1.0" } })
  if (!res.ok) return null

  const results = (await res.json()) as { lat: string; lon: string }[]
  if (!results.length) return null
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) }
}
