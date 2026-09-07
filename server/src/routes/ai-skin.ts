import { Hono } from "hono"

import { serviceClient } from "../db/client.js"
import { analyzeSkinImage } from "../lib/gemini.js"

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"])
// ~5MB эх зураг ≈ base64-аар ~6.7MB (base64 нь 4/3 хэмжээтэй).
const MAX_BASE64_CHARS = 7_000_000

// Google AI Studio-гийн үнэгүй tier-ийн хязгаараас хэтрэхгүйн тулд
// хэрэглэгч тутамд минутанд нэг л хүсэлт зөвшөөрнө. Serverless орчинд
// in-memory Map cold start болгонд алдагддаг тул `ai_skin_scans` хүснэгтээс
// хамгийн сүүлийн бичлэгийг шалгаж, DB дээр тулгуурлав.
const RATE_LIMIT_SECONDS = 60

export const aiSkinRoute = new Hono()

aiSkinRoute.post("/skin-analysis", async (c) => {
  const authHeader = c.req.header("authorization") ?? c.req.header("Authorization")
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!accessToken) return c.json({ ok: false, error: "Нэвтэрч орно уу." }, 401)

  const db = serviceClient()
  const { data: userData, error: userError } = await db.auth.getUser(accessToken)
  if (userError || !userData.user) {
    return c.json({ ok: false, error: "Нэвтрэлт хүчингүй байна." }, 401)
  }
  const customerId = userData.user.id

  const { data: lastScan } = await db
    .from("ai_skin_scans")
    .select("created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lastScan) {
    const elapsedMs = Date.now() - new Date(lastScan.created_at).getTime()
    if (elapsedMs < RATE_LIMIT_SECONDS * 1000) {
      const retryAfter = Math.ceil((RATE_LIMIT_SECONDS * 1000 - elapsedMs) / 1000)
      return c.json(
        { ok: false, error: `Түр хүлээгээд дахин оролдоно уу (${retryAfter}с).`, retryAfter },
        429,
      )
    }
  }

  let body: { imageBase64?: unknown; mime?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false, error: "Хүсэлтийн бүтэц буруу байна." }, 400)
  }

  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : null
  const mime = typeof body.mime === "string" ? body.mime : null

  if (!imageBase64 || !mime) {
    return c.json({ ok: false, error: "Зураг дутуу байна." }, 400)
  }
  if (!ALLOWED_MIME.has(mime)) {
    return c.json({ ok: false, error: "Зургийн формат дэмжигдэхгүй байна (jpg/png/webp)." }, 400)
  }
  if (imageBase64.length > MAX_BASE64_CHARS) {
    return c.json({ ok: false, error: "Зургийн хэмжээ хэт том байна (≤5MB)." }, 400)
  }

  let analysis
  try {
    analysis = await analyzeSkinImage({ base64: imageBase64, mimeType: mime })
  } catch (error) {
    console.error("[ai-skin] Gemini дуудлага амжилтгүй:", (error as Error).message)
    return c.json({ ok: false, error: "Шинжилгээ хийж чадсангүй. Дахин оролдоно уу." }, 502)
  }

  // Зургийг ХЭЗЭЭ Ч хадгалахгүй — зөвхөн текст үр дүнг бичнэ. Бичихэд
  // алдаа гарсан ч хэрэглэгчид үр дүнг барих ёстой тул блоклохгүй.
  const { error: insertError } = await db.from("ai_skin_scans").insert({
    customer_id: customerId,
    skin_type: analysis.skinType,
    concerns: analysis.concerns,
    confidence: analysis.confidence,
    summary: analysis.summary,
    recommended_categories: analysis.recommendedCategories,
  })
  if (insertError) console.error("[ai-skin] Түүх хадгалахад алдаа:", insertError.message)

  return c.json({ ok: true, data: analysis })
})
