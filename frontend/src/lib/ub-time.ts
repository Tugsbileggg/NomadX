/**
 * Улаанбаатарын цагийн тооцоо — панелийн захиалгын цагийн цөм.
 *
 * `app/src/lib/ub-time.ts`-ийн хос. Хоёр багц тусдаа npm project тул код
 * хуваалцаж чадахгүй — ЯГ ижил дүрэмтэй байх ёстой бөгөөд хоёуланд нь
 * тесттэй. Аль нэгийг өөрчилвөл нөгөөг нь мөн адил өөрчилнө.
 *
 * Монгол улс UTC+8, 2017-оос хойш зуны цаг хэрэглэдэггүй. Серверийн
 * цагийн бүсийг ашиглавал (Vercel нь UTC) цаг зөрөх тул тогтмол офсет.
 */

export const UB_OFFSET_MIN = 8 * 60;

/** Одоогийн мөчийг УБ-ийн ханан цагаар илэрхийлсэн Date. */
export function ubNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + (UB_OFFSET_MIN + now.getTimezoneOffset()) * 60_000);
}

/** УБ-ийн ханан цагийг бодит мөч рүү хөрвүүлнэ. */
export function ubToInstant(year: number, month: number, day: number, minutes: number): Date {
  return new Date(Date.UTC(year, month, day, 0, minutes) - UB_OFFSET_MIN * 60_000);
}

/** Огноог "YYYY-MM-DD" түлхүүр болгоно. */
export function dateKey(value: Date): string {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * `business_hours.weekday` индекс: 0 = Даваа … 6 = Ням.
 *
 * JS-ийн `getDay()` дээр 0 = Ням тул шилжүүлнэ.
 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** "09:30:00" эсвэл "09:30" → 570. Буруу утгад null. */
export function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/** 570 → "09:30" */
export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type DayHours = {
  open: string | null;
  close: string | null;
  isClosed: boolean;
};

export type SlotSpec = { step: number; capacity: number };

export type OwnerSlot = {
  /** ISO — маягтаар илгээх утга. */
  at: string;
  label: string;
  full: boolean;
};

/**
 * Нэг өдрийн боломжит цагууд.
 *
 * Цагийн нүд нь НЭЭХ ЦАГААС эхэлж тоологдоно — DB-ийн `validate_booking()`
 * яг ижил дүрэмтэй. Панелаас өнгөрсөн өдрийг зориудаар сонгож болох тул
 * (өчигдрийн ирэлтийг эргэн бүртгэх) өнгөрсөн цагийг энд шүүхгүй.
 */
export function buildOwnerSlots(
  year: number,
  monthIdx: number,
  day: number,
  hours: DayHours | null | undefined,
  spec: SlotSpec,
  taken: Map<number, number>,
): { closed: boolean; slots: OwnerSlot[] } {
  const open = hours?.open ? timeToMinutes(hours.open) : null;
  const close = hours?.close ? timeToMinutes(hours.close) : null;

  if (!hours || hours.isClosed || open == null || close == null || open >= close) {
    return { closed: Boolean(hours?.isClosed), slots: [] };
  }

  const slots: OwnerSlot[] = [];
  for (let minutes = open; minutes < close; minutes += spec.step) {
    const at = ubToInstant(year, monthIdx, day, minutes);
    slots.push({
      at: at.toISOString(),
      label: minutesToLabel(minutes),
      full: (taken.get(at.getTime()) ?? 0) >= spec.capacity,
    });
  }

  return { closed: false, slots };
}
