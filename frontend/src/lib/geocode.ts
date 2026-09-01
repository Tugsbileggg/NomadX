/**
 * OpenStreetMap Nominatim-аар хаягийг бодит lat/lng координат болгоно.
 * Үнэгүй сервис тул алдаа/хугацаа хэтрэхэд зүгээр null буцааж, дуудсан тал
 * үндсэн хадгалалтыг үргэлжлүүлдэг байх ёстой (geocoding саатах ёсгүй).
 *
 * ⚠️ Дүүргийн нэр рүү УНАХГҮЙ. Nominatim нь "Сүхбаатар дүүрэг" гэх мэт
 * асуулгад захиргааны полигоны ТӨВИЙГ буцаадаг — тэр цэг нь (1) тухайн
 * дүүргийн бүх бизнест ижил тул газрын зурагт бүгд нэг цэг дээр давхарлан
 * ордог, (2) дүүргүүд хөдөө хүртэл үргэлжилдэг тул ихэвчлэн хотоос гадуур
 * унадаг (Сүхбаатарынх хотоос 15 км хойд). Буруу цэгээс цэггүй нь дээр.
 *
 * `app/src/lib/geocode.ts`-ийн хос — хоёр тал ижил байх ёстой.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null;

  try {
    return await query(`${address}, Улаанбаатар, Монгол`);
  } catch {
    return null;
  }
}

async function query(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "LUMINA-app/1.0" } });
  if (!res.ok) return null;
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (!results.length) return null;
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}
