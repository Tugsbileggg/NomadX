import { createClient } from "@/lib/supabase/server";

/** 0 = Даваа … 6 = Ням — `business_hours.weekday`-тэй ижил дараалал. */
export const WEEKDAY_LABELS = [
  "Даваа",
  "Мягмар",
  "Лхагва",
  "Пүрэв",
  "Баасан",
  "Бямба",
  "Ням",
];

export type DayHours = {
  weekday: number;
  /** "09:00" — бүртгээгүй бол null. */
  open: string | null;
  close: string | null;
  isClosed: boolean;
};

export type OwnerSchedule = {
  hasBusiness: boolean;
  /** Долоо хоногийн 7 өдөр, Даваагаас эхэлж, дутууг нь нөхсөн. */
  days: DayHours[];
  slotMinutes: number;
  slotCapacity: number;
};

const DEFAULT_SCHEDULE: OwnerSchedule = {
  hasBusiness: false,
  days: Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    open: null,
    close: null,
    isClosed: false,
  })),
  slotMinutes: 60,
  slotCapacity: 1,
};

/** "09:00:00" → "09:00" (input[type=time]-ийн хүлээж буй хэлбэр). */
function toInputTime(value: string | null) {
  return value ? value.slice(0, 5) : null;
}

/** Нэвтэрсэн эзний ажлын цаг болон цагийн нүдний тохиргоо. */
export async function fetchOwnerSchedule(): Promise<OwnerSchedule> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_SCHEDULE;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slot_minutes, slot_capacity")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return DEFAULT_SCHEDULE;

  const { data: hours } = await supabase
    .from("business_hours")
    .select("weekday, open_time, close_time, is_closed")
    .eq("business_id", business.id);

  const byWeekday = new Map((hours ?? []).map((h) => [h.weekday, h]));

  return {
    hasBusiness: true,
    days: DEFAULT_SCHEDULE.days.map(({ weekday }) => {
      const row = byWeekday.get(weekday);
      return {
        weekday,
        open: toInputTime(row?.open_time ?? null),
        close: toInputTime(row?.close_time ?? null),
        isClosed: row?.is_closed ?? false,
      };
    }),
    slotMinutes: business.slot_minutes ?? 60,
    slotCapacity: business.slot_capacity ?? 1,
  };
}
