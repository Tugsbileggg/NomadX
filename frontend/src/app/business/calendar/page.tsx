import { ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";
import { cn } from "@/lib/cn";

export const metadata = { title: "Календар — Салоны админ" };

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
/** October 2023 grid, padded with the tail of September. */
const GRID = [
  ...[25, 26, 27, 28, 29, 30].map((d) => ({ day: d, muted: true })),
  ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1, muted: false })),
];
const TODAY = 10;
const BUSY = new Set([3, 5, 10, 12, 17, 19, 24, 26]);

const SLOTS = [
  { time: "09:00", customer: "Ариунаа Б.", service: "Сормуус суулгах", staff: "Сарантуяа" },
  { time: "11:00", customer: "—", service: "Сул цаг", staff: "" },
  { time: "12:30", customer: "Болормаа Д.", service: "Арьс цэвэрлэгээ", staff: "Уянга" },
  { time: "14:00", customer: "—", service: "Сул цаг", staff: "" },
  { time: "16:30", customer: "Дэлгэрмаа С.", service: "Үс засалт", staff: "Батболд" },
];

export default function BusinessCalendarPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/calendar"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Календарь"
        description="Нийт: 8 захиалга, 3 сул цаг"
        actions={
          <div className="flex gap-2">
            {["Өдөр", "Долоо хоног"].map((v, i) => (
              <button
                key={v}
                type="button"
                className={
                  i === 0
                    ? "rounded-full bg-primary px-4 py-2 text-xs font-medium text-white"
                    : "rounded-full border border-surface-variant bg-white px-4 py-2 text-xs font-medium text-body hover:bg-surface-tint"
                }
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              aria-label="Өмнөх сар"
              className="flex size-8 items-center justify-center rounded-full text-body hover:bg-surface-tint"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-ink">10-р сар 2023</span>
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
            {GRID.map((c, i) => (
              <button
                key={i}
                type="button"
                aria-current={c.day === TODAY && !c.muted ? "date" : undefined}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-lg text-xs",
                  c.muted && "text-muted/60",
                  !c.muted && "text-body hover:bg-surface-tint",
                  c.day === TODAY && !c.muted && "bg-primary font-semibold text-white",
                )}
              >
                {c.day}
                {!c.muted && BUSY.has(c.day) && c.day !== TODAY && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="2023.10.10, Мягмар" className="lg:col-span-2">
          <ul className="flex flex-col gap-3">
            {SLOTS.map((s) => {
              const free = s.customer === "—";
              return (
                <li
                  key={s.time}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4",
                    free
                      ? "border-dashed border-outline bg-surface-page"
                      : "border-surface-variant bg-white",
                  )}
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-primary">
                    {s.time}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {free ? "Сул цаг" : s.customer}
                    </span>
                    {!free && <span className="block text-xs text-muted">{s.service}</span>}
                  </span>
                  {!free && <span className="text-xs text-body">{s.staff}</span>}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </BusinessShell>
  );
}
