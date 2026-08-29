import { createClient } from "@/lib/supabase/server";
import {
  buildOwnerSlots,
  dateKey,
  ubNow,
  ubToInstant,
  weekdayIndex,
  type OwnerSlot,
} from "@/lib/ub-time";

/**
 * Панелаас захиалга үүсгэхэд харуулах боломжит цагууд.
 *
 * `app/src/lib/slots.ts`-ийн хос — ижил дүрмээр (0014-ийн триггер) тооцно.
 * Ялгаа нь: эзэн өөрийн бизнесийн захиалгыг RLS-ээр шууд уншиж чаддаг тул
 * `booking_slot_load()` RPC хэрэггүй.
 *
 * Цагийн тооцоо нь `ub-time.ts` дотор цэвэр функцээр — тэнд туршигдана.
 */

export type { OwnerSlot };

export type OwnerDay = {
  hasBusiness: boolean;
  /** "YYYY-MM-DD" — сонгосон өдөр, УБ-ийн цагаар. */
  dateKey: string;
  closed: boolean;
  slots: OwnerSlot[];
};

/** Сонгосон өдрийн боломжит цагууд. Өдөр заагаагүй бол өнөөдөр. */
export async function fetchOwnerDaySlots(day?: string): Promise<OwnerDay> {
  const valid = day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : dateKey(ubNow());
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

  const [year, month, dayOfMonth] = valid.split("-").map(Number);
  const monthIdx = month - 1;

  const { data: hours } = await supabase
    .from("business_hours")
    .select("open_time, close_time, is_closed")
    .eq("weekday", weekdayIndex(new Date(year, monthIdx, dayOfMonth)))
    .eq("business_id", business.id)
    .maybeSingle();

  const from = ubToInstant(year, monthIdx, dayOfMonth, 0);
  const to = ubToInstant(year, monthIdx, dayOfMonth + 1, 0);

  const { data: booked } = await supabase
    .from("bookings")
    .select("scheduled_at")
    .eq("business_id", business.id)
    .neq("status", "cancelled")
    .gte("scheduled_at", from.toISOString())
    .lt("scheduled_at", to.toISOString());

  const taken = new Map<number, number>();
  for (const b of booked ?? []) {
    const key = new Date(b.scheduled_at).getTime();
    taken.set(key, (taken.get(key) ?? 0) + 1);
  }

  const { closed, slots } = buildOwnerSlots(
    year,
    monthIdx,
    dayOfMonth,
    hours && { open: hours.open_time, close: hours.close_time, isClosed: hours.is_closed },
    { step: business.slot_minutes ?? 60, capacity: business.slot_capacity ?? 1 },
    taken,
  );

  return { hasBusiness: true, dateKey: valid, closed, slots };
}
