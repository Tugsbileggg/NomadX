/**
 * Хуваарийн төрөл болон тогтмолууд.
 *
 * `queries.ts` нь `next/headers`-ээс хамаардаг тул client component-оос
 * шууд импортлох боломжгүй (build үед бүхэл серверийн модуль браузерын
 * bundle руу татагдана). Хуваалцах утгуудыг энд тусад нь байрлуулав.
 */

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

/** Сонгож болох цагийн нүдний урт — server action-ы шалгалттай ижил. */
export const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120];
