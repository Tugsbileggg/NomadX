import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge, Panel } from "@/components/admin/kit";
import { STATUS_META, StatusSteps } from "@/components/bookings/BookingList";
import type { PanelBooking } from "@/lib/bookings/queries";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const WEEKDAY_FULL = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

/** Огноог "YYYY-MM-DD" түлхүүр болгоно — локал цагийн бүсээр. */
export function dateKey(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Хаягаас ирсэн "YYYY-MM" — буруу бол өнөөдрийн сар. */
function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year, monthIdx: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), monthIdx: now.getMonth() };
}

function monthParam(year: number, monthIdx: number) {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}

/** Даваагаар эхэлсэн, 7-гийн үржвэр урттай сарын нүднүүд. */
function buildGrid(year: number, monthIdx: number) {
  const firstWeekday = (new Date(year, monthIdx, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells: { date: Date; muted: boolean }[] = [];
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ date: new Date(year, monthIdx, 1 - i), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, monthIdx, d), muted: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      muted: true,
    });
  }
  return cells;
}

/** "14:00" — toLocaleTimeString("mn-MN") энэ орчинд найдваргүй тул гараар. */
function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Салон/артистын календарь — сарын сүлжээ, сонгосон өдрийн захиалгууд.
 *
 * Сар/өдрийн сонголт нь хаягийн параметрээр явна (`?month=&date=`) тул
 * server component хэвээр үлдэж, шинэчлэлт бүрд шинэ өгөгдөл татна.
 */
export function BookingCalendar({
  bookings,
  basePath,
  month,
  date,
}: {
  bookings: PanelBooking[];
  basePath: string;
  month?: string;
  date?: string;
}) {
  const { year, monthIdx } = parseMonth(month);
  const todayKey = dateKey(new Date());
  const selectedKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey;

  // Цуцлагдсан захиалга өдрийг "завгүй" болгохгүй.
  const busyDays = new Set(
    bookings.filter((b) => b.status !== "cancelled").map((b) => dateKey(b.scheduledAt)),
  );
  const dayBookings = bookings
    .filter((b) => dateKey(b.scheduledAt) === selectedKey)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const grid = buildGrid(year, monthIdx);
  const prev = monthIdx === 0 ? { year: year - 1, monthIdx: 11 } : { year, monthIdx: monthIdx - 1 };
  const next = monthIdx === 11 ? { year: year + 1, monthIdx: 0 } : { year, monthIdx: monthIdx + 1 };

  const selected = new Date(`${selectedKey}T00:00:00`);
  const selectedLabel = `${selected.getFullYear()} оны ${selected.getMonth() + 1} сарын ${selected.getDate()}, ${WEEKDAY_FULL[selected.getDay()]}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <div className="flex items-center justify-between pb-4">
          <Link
            href={`${basePath}?month=${monthParam(prev.year, prev.monthIdx)}&date=${selectedKey}`}
            aria-label="Өмнөх сар"
            className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="text-sm font-medium text-ink">
            {monthIdx + 1}-р сар {year}
          </span>
          <Link
            href={`${basePath}?month=${monthParam(next.year, next.monthIdx)}&date=${selectedKey}`}
            aria-label="Дараах сар"
            className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-2 text-[11px] font-medium text-muted">
              {d}
            </span>
          ))}
          {grid.map((c) => {
            const key = dateKey(c.date);
            const isToday = key === todayKey && !c.muted;
            const isSelected = key === selectedKey && !c.muted;
            return (
              <Link
                key={key}
                href={`${basePath}?month=${monthParam(year, monthIdx)}&date=${key}`}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-lg text-xs",
                  c.muted ? "text-muted/60" : "text-body hover:bg-surface-tint",
                  isToday && "bg-primary font-semibold text-white",
                  isSelected && !isToday && "font-semibold text-ink ring-2 ring-primary",
                )}
              >
                {c.date.getDate()}
                {!c.muted && busyDays.has(key) && !isToday && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </Panel>

      <Panel title={selectedLabel} className="lg:col-span-2">
        {dayBookings.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Энэ өдөр захиалга алга байна.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {dayBookings.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-surface-variant bg-white p-4"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="w-14 shrink-0 text-sm font-semibold text-primary">
                    {formatTime(b.scheduledAt)}
                  </span>
                  <div className="min-w-[160px] flex-1">
                    <p className="text-sm font-medium text-ink">
                      {b.customer?.name?.trim() || "Нэргүй хэрэглэгч"}
                    </p>
                    {b.customer?.phone && (
                      <a
                        href={`tel:${b.customer.phone}`}
                        className="text-xs text-muted hover:text-primary"
                      >
                        {b.customer.phone}
                      </a>
                    )}
                    {b.note?.trim() && (
                      <p className="mt-1 text-xs leading-4 whitespace-pre-line text-body">
                        {b.note}
                      </p>
                    )}
                  </div>
                  <Badge tone={STATUS_META[b.status].tone}>{STATUS_META[b.status].label}</Badge>
                </div>
                <StatusSteps bookingId={b.id} status={b.status} className="mt-3" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
