// Supabase Realtime broadcast-ийг anon key-ээр шалгах (tx/rx тусдаа client)
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import ws from "ws"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const make = () =>
  createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    realtime: { transport: ws },
    auth: { persistSession: false },
  })

const room = process.env.ROOM || "UB-1024"
let got = 0

const rx = make().channel(`loc:${room}`)
rx.on("broadcast", { event: "loc" }, ({ payload }) => {
  got += 1
  console.log("RX", JSON.stringify(payload))
})

rx.subscribe(async (status) => {
  if (status !== "SUBSCRIBED") return console.log("rx:", status)
  console.log("rx: SUBSCRIBED")

  const tx = make().channel(`loc:${room}`)
  tx.subscribe(async (s) => {
    if (s !== "SUBSCRIBED") return console.log("tx:", s)
    console.log("tx: SUBSCRIBED")
    for (let i = 0; i < 3; i++) {
      await tx.send({
        type: "broadcast",
        event: "loc",
        payload: { lat: 47.9186 + i * 0.001, lon: 106.9176, acc: 12, t: Date.now() },
      })
      await new Promise((r) => setTimeout(r, 400))
    }
    setTimeout(() => {
      console.log(got >= 3 ? "✓ realtime OK" : `✗ зөвхөн ${got} мессеж ирлээ`)
      process.exit(got >= 3 ? 0 : 1)
    }, 2000)
  })
})

setTimeout(() => {
  console.log("✗ timeout")
  process.exit(1)
}, 25000)
