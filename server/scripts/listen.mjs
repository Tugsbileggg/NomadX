#!/usr/bin/env node
/**
 * Өрөөнд ирж буй байршлын дохиог терминал дээр хэвлэнэ.
 *   node scripts/listen.mjs [ӨРӨӨ] [СЕКУНД]
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import ws from "ws"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const room = (process.argv[2] || "UB-1024").toUpperCase()
const seconds = Number(process.argv[3] || 60)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false },
})

let n = 0
let prev = null

const meters = (a, b) => {
  const R = 6371000, rad = (x) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

supabase
  .channel(`loc:${room}`)
  .on("broadcast", { event: "loc" }, ({ payload }) => {
    n += 1
    const moved = prev ? `  +${meters(prev, payload).toFixed(1)}м` : ""
    const time = new Date(payload.t).toLocaleTimeString("mn-MN")
    console.log(`#${String(n).padStart(3)} ${time}  ${payload.lat.toFixed(6)}, ${payload.lon.toFixed(6)}  ±${Math.round(payload.acc)}м${moved}`)
    prev = payload
  })
  .subscribe((s) => console.log(`loc:${room} → ${s}${s === "SUBSCRIBED" ? "  (дохио хүлээж байна…)" : ""}`))

setTimeout(() => {
  console.log(n ? `\n✓ нийт ${n} цэг ирлээ` : "\n✗ дохио ирсэнгүй")
  process.exit(0)
}, seconds * 1000)
