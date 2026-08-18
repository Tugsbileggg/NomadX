#!/usr/bin/env node
/**
 * Businesses-ийн текст хаягийг OpenStreetMap Nominatim-аар бодит
 * lat/lng координат болгож дүүргэнэ (lat/lng хоосон мөрүүдэд л хийнэ).
 * Nominatim-ийн ашиглалтын дүрмээр секундэд 1 хүсэлтээс хэтрэхгүй.
 *
 *   cd server && node scripts/geocode-businesses.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    })
)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function geocodeQuery(query) {
  const q = encodeURIComponent(query)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { "User-Agent": "LUMINA-app/1.0 (contact: ganbat.tugsbileg@gmail.com)" },
  })
  if (!res.ok) return null
  const results = await res.json()
  if (!results.length) return null
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) }
}

/**
 * Бүтэн хаягаар оролдоод олдохгүй бол дүүргийн нэрээр (эхний таслал хүртэл)
 * дахин оролдоно — Nominatim нарийн хаяг ихэвчлэн олдоггүй тул дүүргийн
 * төв цэг ч гэсэн бодит, ойролцоо байршил өгнө.
 */
async function geocode(address) {
  const full = await geocodeQuery(`${address}, Улаанбаатар, Монгол`)
  if (full) return full

  await new Promise((r) => setTimeout(r, 1100))
  const district = address.split(",")[0].trim()
  return geocodeQuery(`${district}, Улаанбаатар, Монгол`)
}

async function main() {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, address, lat, lng")
    .not("address", "is", null)

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const todo = businesses.filter((b) => b.lat == null || b.lng == null)
  console.log(`${todo.length}/${businesses.length} бизнес geocode хийгдэх шаардлагатай.\n`)

  for (const b of todo) {
    const coords = await geocode(b.address)
    if (!coords) {
      console.log(`✗ ${b.name}: олдсонгүй ("${b.address}")`)
    } else {
      await supabase.from("businesses").update(coords).eq("id", b.id)
      console.log(`✓ ${b.name}: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)
    }
    // Nominatim: секундэд 1 хүсэлтээс хэтрэхгүй.
    await new Promise((r) => setTimeout(r, 1100))
  }

  console.log("\nДууслаа.")
}

main()
