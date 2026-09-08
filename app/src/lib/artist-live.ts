import { CFG, channelName, type Fix } from "@/lib/live-location"
import { supabase } from "@/lib/supabase"

/**
 * Артистууд бүгд НЭГ суваг дээр цацна.
 *
 * Артист тус бүрд суваг нээвэл хэрэглэгч хайлтын дэлгэц нээх бүрдээ
 * олон арван сувагт нэгдэх шаардлагатай болно. Нэг суваг дээр id-гаар
 * ялгавал хэрэглэгч нэг л удаа нэгдээд бүгдийг хүлээж авна.
 */
export const ARTISTS_ROOM = "ARTISTS"

/** Байршилд эзнийг нь хавсаргана — газрын зураг дээрх салонтой холбоно. */
export type ArtistFix = Fix & {
  /** бизнесийн id — `SearchBusiness.id`-тэй тааруулна */
  id: string
}

/**
 * Артистуудын амьд байршлыг сонсоно.
 *
 * Артист бүрийн хамгийн сүүлийн байрлалыг id-аар хадгална. `CFG.STALE`
 * хугацаанд дуугүй болсныг жагсаалтаас хасна — апп хаагдсан, сүлжээ
 * тасарсан үед газрын зураг дээр хөдөлгөөнгүй хуучин цэг үлдэхээс
 * сэргийлнэ. Хэн ч дуугарахгүй байсан ч хуучрал ажиллах ёстой тул
 * зөвхөн мессеж ирэхэд биш, тогтмол давтамжаар ч шалгана.
 *
 * Буцаасан функцийг дуудаж сувгийг хаана.
 */
export function subscribeToArtists(onChange: (fixes: ArtistFix[]) => void) {
  // Хуучралыг `fix.t`-ээр биш, ӨӨРИЙН хүлээж авсан цагаар хэмжинэ.
  // `fix.t`-г илгээгчийн төхөөрөмж тавьдаг тул хоёр утасны цаг зөрвөл
  // артист эрт алга болох, эсвэл хөдөлгөөнгүй хэт удаан үлдэх эрсдэлтэй.
  const latest = new Map<string, { fix: ArtistFix; at: number }>()

  const emit = () => {
    const cutoff = Date.now() - CFG.STALE
    let dropped = false
    for (const [id, entry] of latest) {
      if (entry.at < cutoff) {
        latest.delete(id)
        dropped = true
      }
    }
    if (latest.size > 0 || dropped) onChange([...latest.values()].map((e) => e.fix))
  }

  const channel = supabase.channel(channelName(ARTISTS_ROOM))

  channel.on("broadcast", { event: "loc" }, ({ payload }) => {
    const fix = payload as ArtistFix
    // Танихгүй хэлбэрийн мессежээр газрын зураг эвдэхгүй.
    if (!fix?.id || typeof fix.lat !== "number" || typeof fix.lon !== "number") return
    latest.set(fix.id, { fix, at: Date.now() })
    emit()
  })

  channel.subscribe()

  const timer = setInterval(emit, CFG.STALE / 2)

  return () => {
    clearInterval(timer)
    void supabase.removeChannel(channel)
  }
}
