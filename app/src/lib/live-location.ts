import { supabase } from "@/lib/supabase"

/**
 * Амьд байршлын протокол — утас (илгээгч) ба вэб (хүлээн авагч) хоёрын
 * хооронд Supabase Realtime broadcast-аар дамжина. DB хүснэгт шаардахгүй.
 *
 * Суваг нэр: `loc:<өрөөний код>` · event: `loc`
 */

export type Fix = {
  /** өргөрөг */
  lat: number
  /** уртраг */
  lon: number
  /** нарийвчлал, метр */
  acc: number | null
  /** хурд, м/с */
  spd: number | null
  /** unix ms */
  t: number
}

export const CFG = {
  /** хоёр илгээлтийн хамгийн богино зай (мс) — POC: 2000, production: 3000 */
  MIN_INTERVAL: 2000,
  /** үүнээс бага хөдөлгөөнийг GPS чичиргээ гэж үзнэ (м) — POC: 5, production: 15 */
  MIN_DIST: 5,
  /** хөдлөөгүй ч "амьд байна" гэж мэдэгдэх давтамж (мс) */
  HEARTBEAT: 15000,
  /** хүлээн авагч тал дохио тасарсан гэж үзэх хугацаа (мс) */
  STALE: 20000,
}

export function channelName(room: string) {
  return `loc:${room.trim().toUpperCase()}`
}

/** Хоёр цэгийн хоорондох зай, метрээр (haversine). */
export function metersBetween(a: Fix, b: Fix) {
  const R = 6371000
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Илгээх шаардлагатай эсэх: хангалттай хугацаа өнгөрсөн БА хангалттай зөрсөн,
 * эсвэл heartbeat-ийн хугацаа болсон.
 */
export function shouldSend(last: Fix | null, next: Fix) {
  if (!last) return true
  const dt = next.t - last.t
  const dd = metersBetween(last, next)
  return (dt >= CFG.MIN_INTERVAL && dd >= CFG.MIN_DIST) || dt >= CFG.HEARTBEAT
}

/** Өрөөнд нэгдэж, байршил илгээх суваг нээнэ. */
export function createPublisher(room: string) {
  const channel = supabase.channel(channelName(room))
  let ready = false

  const joined = new Promise<void>((resolve, reject) => {
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        ready = true
        resolve()
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(new Error(`Realtime холбогдож чадсангүй: ${status}`))
      }
    })
  })

  return {
    joined,
    get ready() {
      return ready
    },
    async send(fix: Fix) {
      await joined
      await channel.send({ type: "broadcast", event: "loc", payload: fix })
    },
    async close() {
      await supabase.removeChannel(channel)
    },
  }
}
