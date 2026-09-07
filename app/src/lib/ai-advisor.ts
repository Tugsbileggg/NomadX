import { distanceMeters } from "@/lib/distance"
import { fetchSearchBusinesses, type SearchBusiness } from "@/lib/search"
import { supabase } from "@/lib/supabase"

/**
 * `server/src/lib/gemini.ts`-тэй ЯГ ИЖИЛ байх ёстой утгууд — сервер дээр
 * validate хийгдсэн хариу тул энд зөвхөн харуулах Монгол шошго нэмнэ.
 */
export type SkinType = "oily" | "dry" | "combination" | "normal" | "unclear"
export type SkinConcern = "acne" | "large_pores" | "redness" | "dark_circles" | "fine_lines"
export type ConfidenceLevel = "low" | "moderate" | "high"

export type SkinAnalysis = {
  skinType: SkinType
  concerns: SkinConcern[]
  confidence: ConfidenceLevel
  summary: string
  recommendedCategories: string[]
}

export const SKIN_TYPE_LABEL: Record<SkinType, string> = {
  oily: "Тослог арьс",
  dry: "Хуурай арьс",
  combination: "Холимог арьс",
  normal: "Хэвийн арьс",
  unclear: "Тодорхойгүй",
}

export const CONCERN_LABEL: Record<SkinConcern, string> = {
  acne: "Батга, толбо",
  large_pores: "Том нүх сүв",
  redness: "Улайлт",
  dark_circles: "Нүдний доорх хар толбо",
  fine_lines: "Нарийн үрчлээс",
}

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  low: "бага итгэлцэлтэй",
  moderate: "дунд итгэлцэлтэй",
  high: "өндөр итгэлцэлтэй",
}

export type AnalyzeSkinResult =
  | { ok: true; data: SkinAnalysis }
  | { ok: false; error: string; retryAfter?: number }

/**
 * Зургийг server/-ийн `/ai/skin-analysis`-д илгээж дүн шинжилгээ авна.
 * API key нь зөвхөн серверт байдаг тул апп Gemini-тай шууд ярьдаггүй.
 */
export async function analyzeSkin(image: { base64: string; mime: string }): Promise<AnalyzeSkinResult> {
  const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL
  if (!serverUrl) {
    return { ok: false, error: "AI зөвлөгөөний сервер тохируулаагүй байна." }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false, error: "Нэвтэрч орно уу." }

  let response: Response
  try {
    response = await fetch(`${serverUrl}/ai/skin-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ imageBase64: image.base64, mime: image.mime }),
    })
  } catch {
    return { ok: false, error: "Сүлжээний алдаа гарлаа. Интернэтээ шалгаад дахин оролдоно уу." }
  }

  let json: { ok: boolean; data?: SkinAnalysis; error?: string; retryAfter?: number }
  try {
    json = await response.json()
  } catch {
    return { ok: false, error: "Серверийн хариу уншиж чадсангүй." }
  }

  if (!response.ok || !json.ok || !json.data) {
    return { ok: false, error: json.error ?? "Шинжилгээ хийж чадсангүй.", retryAfter: json.retryAfter }
  }

  return { ok: true, data: json.data }
}

/**
 * Санал болгосон ангилалд тохирох, зөвшөөрөгдсөн салон/артистуудыг
 * бодит DB-ээс жагсаана. Байршил өгвөл ойрхныг нь түрүүлнэ, тэгэхгүй бол
 * үнэлгээгээр эрэмбэлнэ. Хамгийн ихдээ 5-ыг буцаана.
 */
export async function fetchMatchingBusinesses(
  categories: string[],
  location?: { lat: number; lng: number } | null,
): Promise<SearchBusiness[]> {
  if (categories.length === 0) return []

  const all = await fetchSearchBusinesses()
  const matched = all.filter((b) => b.categories.some((c) => categories.includes(c)))

  const withDistance = matched.map((b) => ({
    b,
    distance:
      location && b.lat != null && b.lng != null
        ? distanceMeters(location, { lat: b.lat, lng: b.lng })
        : null,
  }))

  withDistance.sort((a, z) => {
    if (a.distance != null && z.distance != null) return a.distance - z.distance
    if (a.distance != null) return -1
    if (z.distance != null) return 1
    return (z.b.rating ?? -1) - (a.b.rating ?? -1)
  })

  return withDistance.slice(0, 5).map((x) => x.b)
}
