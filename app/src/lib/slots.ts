import { supabase } from "@/lib/supabase"
import {
  buildDaySlots,
  ubNow,
  ubToInstant,
  weekdayIndex,
  type Slot,
} from "@/lib/ub-time"

/**
 * Захиалгын боломжит цагууд.
 *
 * Урьд нь цагийн жагсаалт нь 09:00–19:00 гэж кодод бичигдсэн байсан —
 * салон амарч байгаа өдөр, ажлын цагаас гадуур, бүр дүүрсэн цагийг ч
 * санал болгодог байв. Одоо `business_hours` болон `businesses`-ийн
 * `slot_minutes`/`slot_capacity`-аас үүсгээд, эзэлсэн цагуудыг
 * `booking_slot_load()`-оор хасна (0014 migration).
 *
 * Цагийн тооцоо нь `ub-time.ts` дотор цэвэр функцээр — тэнд туршигдана.
 */

export type { Slot }

/** Хэдэн өдрийн цагийг урьдчилан харуулах вэ. */
export const SLOT_DAYS = 7

export type SlotDay = {
  /** УБ-ийн цагаарх өдрийн эхлэл ("хуурамч" локал Date — зөвхөн шошгонд). */
  date: Date
  /** Тухайн өдөр амарч байгаа эсэх. */
  closed: boolean
  slots: Slot[]
}

/**
 * Тухайн бизнесийн дараагийн `SLOT_DAYS` өдрийн боломжит цагууд.
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

  const spec = {
    step: business?.slot_minutes ?? 60,
    capacity: business?.slot_capacity ?? 1,
  }
  const byWeekday = new Map(
    (hours ?? []).map((h) => [
      h.weekday,
      { open: h.open_time, close: h.close_time, isClosed: h.is_closed },
    ]),
  )

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
    const { closed, slots } = buildDaySlots(
      date,
      byWeekday.get(weekdayIndex(date)),
      spec,
      taken,
      // Өнгөрсөн цагийг зөвхөн өнөөдрийн хувьд шүүнэ.
      offset === 0 ? nowMinutes : null,
    )
    days.push({ date, closed, slots })
  }

  return days
}
