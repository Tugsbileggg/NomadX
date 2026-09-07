// Локал хөгжүүлэлтийн сервер — `npm run dev`. Production-д ашиглахгүй,
// тэнд `api/index.ts` (Vercel adapter) ажиллана.
import { serve } from "@hono/node-server"

import app from "./index.js"

const port = Number(process.env.PORT) || 3001

// "0.0.0.0" — гар утаснаас (Expo Go) тухайн машины LAN IP-ээр хандахад
// шаардлагатай. `localhost`-оор зөвхөн энэ компьютер дээрээс л хандана.
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`lumina-server → http://localhost:${info.port} (мөн LAN IP-ээр)`)
})
