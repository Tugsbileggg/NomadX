/**
 * Улаанбаатарын цагийн тооцоо — захиалгын цагийн жагсаалтын цөм.
 *
 * Төхөөрөмжийн цагийн бүсийг ашиглавал гадаадаас захиалахад цаг зөрж,
 * DB-ийн триггер (`validate_booking`, Asia/Ulaanbaatar-аар шалгадаг)
 * татгалзана. Тиймээс бүх тооцоог тогтмол офсетоор хийнэ.
 *
 * Монгол улс UTC+8, 2017-оос хойш зуны цаг хэрэглэдэггүй.
 *
 * Эдгээр функцууд нь цэвэр (сүлжээ, төлөвгүй) — `slots.test.ts` шууд турших
 * боломжтой байхын тулд `slots.ts`-ээс тусад нь гаргав.
 */

export const UB_OFFSET_MIN = 8 * 60

/** Одоогийн мөчийг УБ-ийн ханан цагаар илэрхийлсэн Date. */
export function ubNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + (UB_OFFSET_MIN + now.getTimezoneOffset()) * 60_000)
}

/** УБ-ийн ханан цагийг бодит мөч рүү хөрвүүлнэ. */
export function ubToInstant(year: number, month: number, day: number, minutes: number): Date {
  return new Date(Date.UTC(year, month, day, 0, minutes) - UB_OFFSET_MIN * 60_000)
}

/**
 * `business_hours.weekday` индекс: 0 = Даваа … 6 = Ням.
 *
 * JS-ийн `getDay()` дээр 0 = Ням тул шилжүүлнэ. Энэ хоёрыг андуурах нь
 * бүх өдрийг нэгээр зөрүүлдэг тул тусад нь функц болгов.
 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** "09:30:00" эсвэл "09:30" → 570 (шөнө дундаас хойших минут). */
export function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null

  return hours * 60 + minutes
}

/** 570 → "09:30" */
export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export type DayHours = {
  open: string | null
  close: string | null
  isClosed: boolean
}

export type SlotSpec = {
  /** Нэг нүдний урт, минутаар. */
  step: number
  /** Нэг цагт зэрэг үйлчлэх тоо. */
  capacity: number
}

export type Slot = {
  at: Date
  label: string
  full: boolean
}

/**
 * Нэг өдрийн боломжит цагууд.
 *
 * Цагийн нүд нь НЭЭХ ЦАГААС эхэлж тоологдоно (шөнө дундаас биш) — DB-ийн
 * `validate_booking()` яг ижил дүрэмтэй. 09:30-д нээдэг, 60 минутын
 * алхамтай бизнесийн цагууд нь 09:30, 10:30 … байна.
 *
 * @param taken эпох миллисекунд → тухайн цагт авсан захиалгын тоо
 * @param nowMinutes өнөөдрийн хувьд шүүх босго (өнгөрсөн цагийг гаргахгүй);
 *                   бусад өдөрт `null`
 */
export function buildDaySlots(
  date: Date,
  hours: DayHours | undefined,
  spec: SlotSpec,
  taken: Map<number, number>,
  nowMinutes: number | null,
): { closed: boolean; slots: Slot[] } {
  const open = hours?.open ? timeToMinutes(hours.open) : null
  const close = hours?.close ? timeToMinutes(hours.close) : null

  // Ажлын цагаа бүртгээгүй бизнест хуурамч цаг зохиохгүй — хоосон буцаана.
  if (!hours || hours.isClosed || open == null || close == null || open >= close) {
    return { closed: Boolean(hours?.isClosed), slots: [] }
  }

  const slots: Slot[] = []
  for (let minutes = open; minutes < close; minutes += spec.step) {
    if (nowMinutes != null && minutes <= nowMinutes) continue

    const at = ubToInstant(date.getFullYear(), date.getMonth(), date.getDate(), minutes)
    slots.push({
      at,
      label: minutesToLabel(minutes),
      full: (taken.get(at.getTime()) ?? 0) >= spec.capacity,
    })
  }

  return { closed: false, slots }
}
