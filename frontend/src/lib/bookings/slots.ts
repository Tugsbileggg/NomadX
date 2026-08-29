import { createClient } from "@/lib/supabase/server";

/**
 * Панелаас захиалга үүсгэхэд харуулах боломжит цагууд.
 *
 * `app/src/lib/slots.ts`-ийн хос — ижил дүрмээр (0014-ийн триггер) тооцно.
 * Ялгаа нь: эзэн өөрийн бизнесийн захиалгыг RLS-ээр шууд уншиж чаддаг тул
 * `booking_slot_load()` RPC хэрэггүй.
 */

/** Монгол улс UTC+8, зуны цаг хэрэглэдэггүй — DB триггертэй ижил тогтмол. */
const UB_OFFSET_MIN = 8 * 60;

export type OwnerSlot = {
  /** ISO — маягтаар илгээх утга. */
  at: string;
  /** "09:30" — УБ-ийн цагаар. */
  label: string;
  full: boolean;
};

export type OwnerDay = {
  hasBusiness: boolean;
  /** "YYYY-MM-DD" — сонгосон өдөр, УБ-ийн цагаар. */
  dateKey: string;
  closed: boolean;
  slots: OwnerSlot[];
};

/** Одоогийн мөчийг УБ-ийн ханан цагаар илэрхийлсэн Date. */
function ubNow() {
  const now = new Date();
  return new Date(now.getTime() + (UB_OFFSET_MIN + now.getTimezoneOffset()) * 60_000);
}

function ubToInstant(year: number, month: number, day: number, minutes: number) {
  return new Date(Date.UTC(year, month, day, 0, minutes) - UB_OFFSET_MIN * 60_000);
}

function toKey(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function timeToMinutes(value: string) {
  const m = /^(\d{2}):(\d{2})/.exec(value);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function label(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * Сонгосон өдрийн боломжит цагууд. Өдөр заагаагүй бол өнөөдөр.
 *
 * Өнгөрсөн цагийг санал болгохгүй — гэхдээ панелаас өнгөрсөн өдрийг
 * зориудаар сонгож болно (жишээ нь өчигдрийн ирэлтийг эргэн бүртгэх).
 * Тэр тохиолдолд 0014-ийн триггер цагийн дүрмийг л шалгана.
 */
export async function fetchOwnerDaySlots(dateKey?: string): Promise<OwnerDay> {
  const now = ubNow();
  const valid = dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : toKey(now);
  const empty: OwnerDay = { hasBusiness: false, dateKey: valid, closed: false, slots: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slot_minutes, slot_capacity")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return empty;

  const [year, month, day] = valid.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const { data: hours } = await supabase
    .from("business_hours")
    .select("open_time, close_time, is_closed")
    // business_hours дээр 0 = Даваа, JS-ийн getDay() дээр 0 = Ням.
    .eq("weekday", (date.getDay() + 6) % 7)
    .eq("business_id", business.id)
    .maybeSingle();

  const open = hours?.open_time ? timeToMinutes(hours.open_time) : null;
  const close = hours?.close_time ? timeToMinutes(hours.close_time) : null;

  if (!hours || hours.is_closed || open == null || close == null || open >= close) {
    return { ...empty, hasBusiness: true, closed: Boolean(hours?.is_closed) };
  }

  const from = ubToInstant(year, month - 1, day, 0);
  const to = ubToInstant(year, month - 1, day + 1, 0);

  const { data: taken } = await supabase
    .from("bookings")
    .select("scheduled_at")
    .eq("business_id", business.id)
    .neq("status", "cancelled")
    .gte("scheduled_at", from.toISOString())
    .lt("scheduled_at", to.toISOString());

  const load = new Map<number, number>();
  for (const b of taken ?? []) {
    const key = new Date(b.scheduled_at).getTime();
    load.set(key, (load.get(key) ?? 0) + 1);
  }

  const step = business.slot_minutes ?? 60;
  const capacity = business.slot_capacity ?? 1;
  const slots: OwnerSlot[] = [];

  for (let minutes = open; minutes < close; minutes += step) {
    const at = ubToInstant(year, month - 1, day, minutes);
    slots.push({
      at: at.toISOString(),
      label: label(minutes),
      full: (load.get(at.getTime()) ?? 0) >= capacity,
    });
  }

  return { hasBusiness: true, dateKey: valid, closed: false, slots };
}
