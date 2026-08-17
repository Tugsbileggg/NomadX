#!/usr/bin/env node
/**
 * Утасгүйгээр туршихад зориулсан хуурамч "алхагч".
 * Сүхбаатарын талбайгаас баруун хойш алхаж буй мэт цэгүүдийг
 * Supabase Realtime-аар илгээнэ.
 *
 *   cd server && node scripts/fake-walk.mjs [ӨРӨӨНИЙ_КОД]
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

const room = (process.argv[2] || "UB-1024").toUpperCase()
const steps = Number(process.argv[3] || 40)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false },
})

const channel = supabase.channel(`loc:${room}`)

channel.subscribe(async (status) => {
  if (status !== "SUBSCRIBED") return
  console.log(`→ loc:${room} руу ${steps} цэг илгээнэ`)

  let lat = 47.9186
  let lon = 106.9176

  for (let i = 0; i < steps; i++) {
    lat += 0.00022 + Math.random() * 0.00008
    lon += 0.00030 + Math.random() * 0.00010

    const payload = {
      lat,
      lon,
      acc: 8 + Math.round(Math.random() * 12),
      spd: 1.2 + Math.random() * 0.6,
      t: Date.now(),
    }
    await channel.send({ type: "broadcast", event: "loc", payload })
    console.log(`${i + 1}/${steps}`, payload.lat.toFixed(5), payload.lon.toFixed(5))
    await new Promise((r) => setTimeout(r, 1500))
  }

  console.log("дууслаа")
  process.exit(0)
})
