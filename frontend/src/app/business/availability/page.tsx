import { Copy } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";

export const metadata = { title: "Хуваарь тохиргоо — Салоны админ" };

const DAYS = [
  { label: "Даваа", open: "09:00", close: "18:00", off: false },
  { label: "Мягмар", open: "09:00", close: "18:00", off: false },
  { label: "Лхагва", open: "09:00", close: "18:00", off: false },
  { label: "Пүрэв", open: "09:00", close: "18:00", off: true },
  { label: "Баасан", open: "09:00", close: "20:00", off: false },
  { label: "Бямба", open: "10:00", close: "18:00", off: false },
  { label: "Ням", open: "10:00", close: "16:00", off: true },
];

export default function AvailabilityPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/availability"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Хуваарь тохиргоо"
        description="Таны бизнес нээлттэй байх цагийн хуваарийг энд тохируулна уу."
        actions={
          <div className="flex gap-3">
            <button
              type="button"
              className="h-10 rounded-full border border-surface-variant bg-white px-6 text-sm font-medium text-body hover:bg-surface-tint"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Хадгалах
            </button>
          </div>
        }
      />

      <Panel title="Долоо хоногийн үндсэн цаг">
        <ul className="flex flex-col divide-y divide-surface-tint">
          {DAYS.map((d) => (
            <li key={d.label} className="flex flex-wrap items-center gap-4 py-4">
              <span className="w-24 shrink-0 text-sm font-medium text-ink">{d.label}</span>

              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  defaultChecked={!d.off}
                  className="size-4 accent-[var(--color-primary)]"
                />
                Нээлттэй
              </label>

              {d.off ? (
                <span className="text-sm text-muted">Амарна</span>
              ) : (
                <span className="flex items-center gap-3">
                  <input
                    type="time"
                    defaultValue={d.open}
                    aria-label={`${d.label} нээх цаг`}
                    className="h-10 rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary"
                  />
                  <span className="text-body">-</span>
                  <input
                    type="time"
                    defaultValue={d.close}
                    aria-label={`${d.label} хаах цаг`}
                    className="h-10 rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary"
                  />
                </span>
              )}

              <button
                type="button"
                className="ml-auto flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Copy className="size-3.5" />
                Хуулах
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </BusinessShell>
  );
}
