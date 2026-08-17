import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { cn } from "@/lib/cn";

export const metadata = { title: "Календарь — Артистын админ" };

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
/** October 2024 starts on a Tuesday, so the grid leads with one blank cell. */
const LEAD = 1;
const DAYS = 31;
const TODAY = 24;
const BOOKED = new Set([1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 19, 20, 21, 23, 26]);

const SLOTS = [
  { time: "10:00", client: "Сарангуа А.", service: "Хөмсөг хэлбэржүүлэлт" },
  { time: "12:00", client: "", service: "" },
  { time: "14:00", client: "Болормаа Б.", service: "Сонгодог сормуус суулгалт" },
  { time: "16:30", client: "Уянга Ц.", service: "Гель маникюр" },
];

export default function ArtistCalendarPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/calendar" {...ARTIST}>
      <ArtistPageHeader title="Календарь" chip="2024 оны 10 сар" />

      <div className="grid gap-6 lg:grid-cols-3">
        <ArtistPanel className="lg:col-span-1">
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              aria-label="Өмнөх сар"
              className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-ink">2024 оны 10 сар</span>
            <button
              type="button"
              aria-label="Дараах сар"
              className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-2 text-[11px] font-medium text-muted">
                {d}
              </span>
            ))}
            {Array.from({ length: LEAD }, (_, i) => (
              <span key={`lead-${i}`} />
            ))}
            {Array.from({ length: DAYS }, (_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  aria-current={day === TODAY ? "date" : undefined}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-lg text-xs text-body hover:bg-surface-tint",
                    day === TODAY && "bg-primary font-semibold text-white hover:bg-primary",
                  )}
                >
                  {day}
                  {BOOKED.has(day) && day !== TODAY && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </ArtistPanel>

        <ArtistPanel title="2024.10.24, Пүрэв" className="lg:col-span-2">
          <ul className="flex flex-col gap-3">
            {SLOTS.map((s) => {
              const free = !s.client;
              return (
                <li
                  key={s.time}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4",
                    free
                      ? "border-dashed border-outline bg-surface-page/60"
                      : "border-surface-tint bg-white",
                  )}
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-primary">
                    {s.time}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {free ? "Сул цаг" : s.client}
                    </span>
                    {!free && <span className="block text-xs text-muted">{s.service}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
