import { supabase } from "@/lib/supabase"

/**
 * Захиалгын боломжит цагууд.
 *
 * Урьд нь цагийн жагсаалт нь 09:00–19:00 гэж кодод бичигдсэн байсан —
 * салон амарч байгаа өдөр, ажлын цагаас гадуур, бүр дүүрсэн цагийг ч
 * санал болгодог байв. Одоо `business_hours` болон `businesses`-ийн
 * `slot_minutes`/`slot_capacity`-аас үүсгээд, эзэлсэн цагуудыг
 * `booking_slot_load()`-оор хасна (0014 migration).
 */

/**
 * Монгол улс UTC+8, зуны цаг хэрэглэдэггүй (2017-оос).
 *
 * Төхөөрөмжийн цагийн бүсийг ашиглавал гадаадаас захиалахад цаг зөрж,
 * DB-ийн триггер (Asia/Ulaanbaatar-аар шалгадаг) татгалзана. Тиймээс
 * бүх тооцоог тогтмол офсетоор хийнэ.
 */
const UB_OFFSET_MIN = 8 * 60

/** Хэдэн өдрийн цагийг урьдчилан харуулах вэ. */
export const SLOT_DAYS = 7

export type Slot = {
  /** Бодит мөч — DB рүү энэ утгыг илгээнэ. */
  at: Date
  /** "09:30" — УБ-ийн цагаар. */
  label: string
  /** Багтаамж дүүрсэн эсэх. */
  full: boolean
}

export type SlotDay = {
  /** УБ-ийн цагаарх өдрийн эхлэл ("хуурамч" локал Date — зөвхөн шошгонд). */
  date: Date
  /** Тухайн өдөр амарч байгаа эсэх. */
  closed: boolean
  slots: Slot[]
}

/** Одоогийн мөчийг УБ-ийн ханан цагаар илэрхийлсэн Date. */
function ubNow(): Date {
  const now = new Date()
  return new Date(now.getTime() + (UB_OFFSET_MIN + now.getTimezoneOffset()) * 60_000)
}

/** УБ-ийн ханан цагийг бодит мөч рүү хөрвүүлнэ. */
function ubToInstant(year: number, month: number, day: number, minutes: number): Date {
  return new Date(Date.UTC(year, month, day, 0, minutes) - UB_OFFSET_MIN * 60_000)
}

/** "09:30:00" → 570 (шөнө дундаас хойших минут). */
function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/**
 * Тухайн бизнесийн дараагийн `SLOT_DAYS` өдрийн боломжит цагууд.
 *
 * Ажлын цагаа огт бүртгээгүй бизнест хоосон өдрүүд буцаана — 0014-ийн
 * триггер ийм тохиолдолд захиалгыг зөвшөөрдөг ч аль цагийг санал болгохоо
 * мэдэхгүй тул хуурамч цаг зохиохоос татгалзана.
 */
export async function fetchSlotDays(businessId: string): Promise<SlotDay[]> {
  const [{ data: business }, { data: hours }] = await Promise.all([
    supabase
      .from("businesses")
      .select("slot_minutes, slot_capacity")
      .eq("id", businessId)
      .maybeSingle(),
    supabase
      .from("business_hours")
      .select("weekday, open_time, close_time, is_closed")
      .eq("business_id", businessId),
  ])

  const step = business?.slot_minutes ?? 60
  const capacity = business?.slot_capacity ?? 1
  const byWeekday = new Map((hours ?? []).map((h) => [h.weekday, h]))

  const now = ubNow()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const from = ubToInstant(today.getFullYear(), today.getMonth(), today.getDate(), 0)
  const to = ubToInstant(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + SLOT_DAYS,
    0,
  )

  const { data: load } = await supabase.rpc("booking_slot_load", {
    bid: businessId,
    from_ts: from.toISOString(),
    to_ts: to.toISOString(),
  })

  // RPC нь timestamptz-ийг ISO мөрөөр буцаадаг ч форматын ялгаанаас
  // болж мөрөөр харьцуулах найдваргүй — эпох миллисекундээр түлхүүрлэнэ.
  const taken = new Map<number, number>(
    (load ?? []).map((row) => [new Date(row.slot).getTime(), row.taken]),
  )

  const days: SlotDay[] = []
  for (let offset = 0; offset < SLOT_DAYS; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
    // business_hours дээр 0 = Даваа, JS-ийн getDay() дээр 0 = Ням.
    const row = byWeekday.get((date.getDay() + 6) % 7)

    const open = row?.open_time ? timeToMinutes(row.open_time) : null
    const close = row?.close_time ? timeToMinutes(row.close_time) : null

    if (!row || row.is_closed || open == null || close == null || open >= close) {
      days.push({ date, closed: Boolean(row?.is_closed), slots: [] })
      continue
    }

    const slots: Slot[] = []
    for (let minutes = open; minutes < close; minutes += step) {
      // Өнгөрсөн цагийг санал болгохгүй.
      if (offset === 0 && minutes <= nowMinutes) continue

      const at = ubToInstant(date.getFullYear(), date.getMonth(), date.getDate(), minutes)
      slots.push({
        at,
        label: minutesToLabel(minutes),
        full: (taken.get(at.getTime()) ?? 0) >= capacity,
      })
    }

    days.push({ date, closed: false, slots })
  }

  return days
}
