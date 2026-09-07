import { ApiError, GoogleGenAI, Type, createPartFromBase64, createUserContent } from "@google/genai"

/**
 * Гар утасны "Гоо сайхны зөвлөгөө" ангиллуудтай ЯГ ИЖИЛ байх ёстой —
 * `app/src/lib/artist-registration.ts`-ийн `ARTIST_CATEGORIES`. Санал
 * болгож буй ангилал бодит `business_categories.category`-той таарахгүй бол
 * ямар ч салон олдохгүй.
 */
export const SKIN_ADVISOR_CATEGORIES = [
  "Гоо сайхан",
  "Үсчин",
  "Хумс",
  "Спа, Массаж",
  "Арьс арчилгаа",
] as const

const SKIN_TYPES = ["oily", "dry", "combination", "normal", "unclear"] as const
const CONCERNS = ["acne", "large_pores", "redness", "dark_circles", "fine_lines"] as const
const CONFIDENCE_LEVELS = ["low", "moderate", "high"] as const

export type SkinType = (typeof SKIN_TYPES)[number]
export type SkinConcern = (typeof CONCERNS)[number]
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]

export type SkinAnalysis = {
  skinType: SkinType
  concerns: SkinConcern[]
  confidence: ConfidenceLevel
  summary: string
  recommendedCategories: (typeof SKIN_ADVISOR_CATEGORIES)[number][]
}

const PROMPT = `Чи гоо сайхны зөвлөх туслах. Хэрэглэгчийн илгээсэн нүүрний зургийг ЗӨВХӨН
чанарын ажиглалт хийж, гоо сайхны үйлчилгээ санал болгох зорилгоор харна.

ЧУХАЛ ХЯЗГААРЛАЛТ:
- Энэ бол ЭМНЭЛГИЙН ОНОШИЛГОО БИШ. Ямар ч эмнэлгийн нэр томьёо, оношийн
  дүгнэлт бүү өгөөрэй (жишээ нь "экзем", "розацеа" гэх мэт үг хэрэглэхгүй).
- Зурган дээр нүүр тодорхой харагдахгүй, гэрэлтүүлэг муу, эсвэл нүүр огт
  байхгүй бол ЗАЙЛШГҮЙ үнэнээр "unclear" гэж хариул — таамаглаж бүү зохио.
- summary талбарт 1-2 өгүүлбэрээр, эелдэг, монгол хэлээр, зөвхөн ерөнхий
  гоо сайхны ажиглалт бич (жишээ нь арьсны тослог/хуурай байдал, тод шинж).

Дараах JSON бүтцээр ХАРИУЛ:
- skinType: арьсны төрөл.
- concerns: ажиглагдсан зүйлсийн жагсаалт (хоосон байж болно).
- confidence: дүгнэлтийнхээ итгэлийн түвшин.
- summary: 1-2 өгүүлбэрийн товч, эелдэг тайлбар.
- recommendedCategories: дээрх ажиглалтад тохирох 1-3 ангилал, ЗӨВХӨН
  өгөгдсөн жагсаалтаас сонго.`

let client: GoogleGenAI | null = null

function genAI(): GoogleGenAI {
  if (client) return client
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY тохируулаагүй байна (.env харна уу)")
  client = new GoogleGenAI({ apiKey })
  return client
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skinType: { type: Type.STRING, enum: [...SKIN_TYPES] },
    concerns: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: [...CONCERNS] },
    },
    confidence: { type: Type.STRING, enum: [...CONFIDENCE_LEVELS] },
    summary: { type: Type.STRING },
    recommendedCategories: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: [...SKIN_ADVISOR_CATEGORIES] },
    },
  },
  propertyOrdering: ["skinType", "concerns", "confidence", "summary", "recommendedCategories"],
  required: ["skinType", "concerns", "confidence", "summary", "recommendedCategories"],
}

/**
 * Зургийг Gemini-д (vision, structured JSON output) илгээж дүн шинжилгээ
 * буцаана. Загварыг заавал `gemini-flash-latest`-ээр авав — тодорхой
 * хувилбар хатуу бичихгүй бол Google хуучирсан загварыг хааход апп
 * автоматаар шинэ Flash руу шилждэг.
 *
 * Google-ийн үнэгүй tier ачаалал ихсэх үед 503/429 буцаадаг нь түгээмэл
 * (транзиент) тул 2 удаа богино хүлээлттэй дахин оролдоно.
 */
export async function analyzeSkinImage(image: {
  base64: string
  mimeType: string
}): Promise<SkinAnalysis> {
  const RETRY_DELAYS_MS = [700, 1500]

  let lastError: unknown
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1])

    try {
      const response = await genAI().models.generateContent({
        model: "gemini-flash-latest",
        contents: [createUserContent([PROMPT, createPartFromBase64(image.base64, image.mimeType)])],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      })

      const text = response.text
      if (!text) throw new Error("Gemini хоосон хариу буцаалаа")

      return validate(JSON.parse(text))
    } catch (error) {
      lastError = error
      const retryable = error instanceof ApiError && (error.status === 503 || error.status === 429)
      if (!retryable) throw error
      console.warn(`[gemini] ${error.status} — дахин оролдож байна (${attempt + 1}/${RETRY_DELAYS_MS.length + 1})`)
    }
  }

  throw lastError
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Загвар schema дагасан ч зэрэгцээ давхар шалгав — гадны API-д итгэхгүй. */
function validate(value: unknown): SkinAnalysis {
  if (!value || typeof value !== "object") throw new Error("Gemini хариу буруу бүтэцтэй")
  const v = value as Record<string, unknown>

  const skinType = SKIN_TYPES.includes(v.skinType as SkinType) ? (v.skinType as SkinType) : "unclear"

  const concerns = Array.isArray(v.concerns)
    ? v.concerns.filter((c): c is SkinConcern => CONCERNS.includes(c as SkinConcern))
    : []

  const confidence = CONFIDENCE_LEVELS.includes(v.confidence as ConfidenceLevel)
    ? (v.confidence as ConfidenceLevel)
    : "low"

  const summary = typeof v.summary === "string" ? v.summary.trim().slice(0, 500) : ""

  const recommendedCategories = Array.isArray(v.recommendedCategories)
    ? v.recommendedCategories.filter((c): c is (typeof SKIN_ADVISOR_CATEGORIES)[number] =>
        (SKIN_ADVISOR_CATEGORIES as readonly string[]).includes(c as string),
      )
    : []

  return { skinType, concerns, confidence, summary, recommendedCategories }
}
