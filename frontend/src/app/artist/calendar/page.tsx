import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArtistPageHeader, ArtistPanel, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { Badge } from "@/components/admin/kit";
import { cn } from "@/lib/cn";
import { BookingActions } from "@/components/bookings/BookingActions";
import {
  STATUS_LABEL,
  STATUS_TONE,
  dateKey,
  fetchBusinessBookings,
  findOwnedBusiness,
  type BookingRow,
} from "@/lib/bookings/data";

export const metadata = { title: "Календарь — Артистын админ" };

const BASE_PATH = "/artist/calendar";
const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const WEEKDAY_FULL = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    return { year, monthIdx: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), monthIdx: now.getMonth() };
}

function monthParam(year: number, monthIdx: number) {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}

function buildGrid(year: number, monthIdx: number) {
  const firstWeekday = (new Date(year, monthIdx, 1).getDay() + 6) % 7; // Даваа = 0
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells: Array<{ date: Date; muted: boolean }> = [];
  for (let i = firstWeekday; i > 0; i--) cells.push({ date: new Date(year, monthIdx, 1 - i), muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, monthIdx, d), muted: false });
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
  }
  return cells;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
}

export default async function ArtistCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const { month, date } = await searchParams;
  const { year, monthIdx } = parseMonth(month);
  const business = await findOwnedBusiness("artist");
  const bookings: BookingRow[] = business ? await fetchBusinessBookings(business.id) : [];

  const todayKey = dateKey(new Date());
  const selectedKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey;

  const busyDays = new Set(
    bookings.filter((b) => b.status !== "cancelled").map((b) => dateKey(b.scheduledAt)),
  );
  const dayBookings = bookings
    .filter((b) => dateKey(b.scheduledAt) === selectedKey)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const grid = buildGrid(year, monthIdx);
  const prevMonth = monthIdx === 0 ? { year: year - 1, monthIdx: 11 } : { year, monthIdx: monthIdx - 1 };
  const nextMonth = monthIdx === 11 ? { year: year + 1, monthIdx: 0 } : { year, monthIdx: monthIdx + 1 };

  const selectedDate = new Date(`${selectedKey}T00:00:00`);
  const selectedLabel = `${selectedDate.getFullYear()} оны ${selectedDate.getMonth() + 1} сарын ${selectedDate.getDate()}, ${WEEKDAY_FULL[selectedDate.getDay()]}`;

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/calendar" {...ARTIST}>
      <ArtistPageHeader title="Календарь" chip={`${monthIdx + 1}-р сар ${year}`} />

      {!business ? (
        <ArtistPanel>
          <p className="text-sm text-body">Бизнесийн бүртгэл олдсонгүй.</p>
        </ArtistPanel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel className="lg:col-span-1">
            <div className="flex items-center justify-between pb-4">
              <Link
                href={`${BASE_PATH}?month=${monthParam(prevMonth.year, prevMonth.monthIdx)}&date=${selectedKey}`}
                aria-label="Өмнөх сар"
                className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <span className="text-sm font-medium text-ink">
                {monthIdx + 1}-р сар {year}
              </span>
              <Link
                href={`${BASE_PATH}?month=${monthParam(nextMonth.year, nextMonth.monthIdx)}&date=${selectedKey}`}
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
              {grid.map((c, i) => {
                const key = dateKey(c.date);
                const isToday = key === todayKey && !c.muted;
                const isSelected = key === selectedKey && !c.muted;
                return (
                  <Link
                    key={i}
                    href={`${BASE_PATH}?month=${monthParam(year, monthIdx)}&date=${key}`}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-lg text-xs",
                      c.muted && "text-muted/60",
                      !c.muted && "text-body hover:bg-surface-tint",
                      isToday && "bg-primary font-semibold text-white hover:bg-primary",
                      isSelected && !isToday && "ring-2 ring-primary font-semibold text-ink",
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
          </ArtistPanel>

          <ArtistPanel title={selectedLabel} className="lg:col-span-2">
            {dayBookings.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">Энэ өдөр захиалга алга байна.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {dayBookings.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-surface-tint bg-white p-4"
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-primary">
                      {formatTime(b.scheduledAt)}
                    </span>
                    <span className="min-w-[160px] flex-1">
                      <span className="block text-sm font-medium text-ink">{b.customerName}</span>
                      {b.customerPhone && (
                        <span className="block text-xs text-muted">{b.customerPhone}</span>
                      )}
                      {b.note && <span className="mt-1 block text-xs text-body">{b.note}</span>}
                    </span>
                    <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                    <BookingActions bookingId={b.id} status={b.status} basePath={BASE_PATH} />
                  </li>
                ))}
              </ul>
            )}
          </ArtistPanel>
        </div>
      )}
    </ArtistShell>
  );
}
