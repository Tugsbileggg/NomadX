#!/usr/bin/env node
/**
 * Тест артистуудыг "амьд яваа" мэт болгож газрын зурагт харуулна.
 *
 * Амьд байршил нь артистын апп нээлттэй байхыг шаарддаг тул ганцаараа
 * туршихад нөгөө талыг нь хараад суух хүн байхгүй. Энэ скрипт нь
 * зөвшөөрөгдсөн артист бүрийн өмнөөс `loc:ARTISTS` суваг руу байршил
 * цацаж, үйлчлүүлэгчийн хайлтын газрын зураг дээр ногоон цагирагтай
 * цэгүүд хөдөлж байгааг харуулна.
 *
 *   cd server && npm run sim:artists
 *
 * Ctrl+C хүртэл үргэлжилнэ. Зогсоомогц `CFG.STALE` (20с) дотор цэгүүд
 * газрын зургаас өөрөө арилна — хуурамч өгөгдөл DB-д огт үлдэхгүй,
 * зөвхөн Realtime-аар л дамждаг.
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import ws from "ws"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    })
)

// app/src/lib/artist-live.ts-тэй ижил байх ЁСТОЙ.
const ROOM = "ARTISTS"
const CHANNEL = `loc:${ROOM}`

/** Цацалтын давтамж — CFG.HEARTBEAT (15с) хэтрэвэл цэг хуучирч алга болно. */
const TICK_MS = 3000
/** Нэг алхмын урт, ойролцоогоор метрээр. */
const STEP_M = 12
/** Суурь цэгээсээ хэт холдвол салонтойгоо холбоо тасарна. */
const MAX_DRIFT_M = 300

const M_PER_DEG_LAT = 111_320

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false },
})

const { data: artists, error } = await supabase
  .from("businesses")
  .select("id, name, lat, lng")
  .eq("type", "artist")
  .eq("status", "approved")
  .not("lat", "is", null)

if (error) {
  console.error("Артистуудыг татаж чадсангүй:", error.message)
  process.exit(1)
}
if (!artists.length) {
  console.error("Координаттай, зөвшөөрөгдсөн артист олдсонгүй.")
  process.exit(1)
}

// Артист бүр өөрийн салоныхоо эргэн тойронд санамсаргүй чиглэлд алхана.
const walkers = artists.map((a) => ({
  id: a.id,
  name: a.name,
  baseLat: a.lat,
  baseLng: a.lng,
  lat: a.lat,
  lng: a.lng,
  heading: Math.random() * Math.PI * 2,
}))

const channel = supabase.channel(CHANNEL)

channel.subscribe(async (status) => {
  if (status !== "SUBSCRIBED") {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.error("Realtime холбогдож чадсангүй:", status)
      process.exit(1)
    }
    return
  }

  console.log(`→ ${CHANNEL} руу ${walkers.length} артистын байршил цацаж байна`)
  for (const w of walkers) console.log(`   · ${w.name}`)
  console.log("   (зогсоох: Ctrl+C)\n")

  setInterval(tick, TICK_MS)
  await tick()
})

async function tick() {
  for (const w of walkers) {
    // Чиглэлээ бага зэрэг мушгина — шулуун биш, хүн шиг эргэлдэж алхана.
    w.heading += (Math.random() - 0.5) * 0.8

    const dLat = (STEP_M * Math.cos(w.heading)) / M_PER_DEG_LAT
    const dLng =
      (STEP_M * Math.sin(w.heading)) / (M_PER_DEG_LAT * Math.cos((w.lat * Math.PI) / 180))

    w.lat += dLat
    w.lng += dLng

    // Хэт холдвол суурь цэг рүүгээ эргүүлнэ.
    if (metersBetween(w, { lat: w.baseLat, lng: w.baseLng }) > MAX_DRIFT_M) {
      w.heading = Math.atan2(w.baseLng - w.lng, w.baseLat - w.lat)
    }

    await channel.send({
      type: "broadcast",
      event: "loc",
      // artist-live.ts-ийн `ArtistFix`-тэй ижил бүтэц.
      payload: {
        id: w.id,
        lat: w.lat,
        lon: w.lng,
        acc: 8 + Math.round(Math.random() * 12),
        spd: 1.2 + Math.random() * 0.6,
        t: Date.now(),
      },
    })
  }

  const at = new Date().toLocaleTimeString("en-GB")
  console.log(`${at}  ${walkers.length} цэг илгээв`)
}

function metersBetween(a, b) {
  const R = 6_371_000
  const rad = (x) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
