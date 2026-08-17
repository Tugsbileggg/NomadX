import { Search, UserPlus } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { FilterTabs, Monogram, Panel } from "@/components/admin/kit";

export const metadata = { title: "Шинэ захиалга нэмэх — Салоны админ" };

const SERVICES = [
  { name: "Эмэгтэй үс засалт", duration: "60 мин", price: "₮55,000" },
  { name: "Үс будалт (Бүтэн)", duration: "120 мин", price: "₮120,000" },
  { name: "Толгой массаж", duration: "30 мин", price: "₮25,000" },
  { name: "Эрэгтэй үс засалт", duration: "45 мин", price: "₮35,000" },
];

const STAFF = ["Сарантуяа Б.", "Батболд Г.", "Уянга М."];
const TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export default function NewBookingPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/bookings"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Шинэ захиалга нэмэх"
        description="Цаг авах мэдээллийг доорх талбарт оруулна уу."
      />

      <div className="flex max-w-[880px] flex-col gap-6">
        <Step n={1} title="Харилцагч сонгох">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-[280px] flex-1">
              <span className="sr-only">Харилцагч хайх</span>
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
              <input
                placeholder="Харилцагчийн нэр эсвэл утасны дугаараар хайх"
                className="h-12 w-full rounded-xl bg-surface-tint pr-4 pl-11 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-primary"
              />
            </label>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-xl border border-outline bg-white px-5 text-xs font-semibold tracking-[0.6px] text-primary uppercase hover:bg-surface-tint"
            >
              <UserPlus className="size-4" />
              Шинэ харилцагч нэмэх
            </button>
          </div>
        </Step>

        <Step n={2} title="Үйлчилгээ сонгох">
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Үсчин", "Маникюр", "Спа", "Нүүр будалт"]}
              active="Үсчин"
            />
            <ul className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <li key={s.name}>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-variant bg-white p-4 has-checked:border-primary has-checked:bg-surface-tint">
                    <input type="radio" name="service" className="sr-only" />
                    <span>
                      <span className="block text-sm font-medium text-ink">{s.name}</span>
                      <span className="block text-xs text-muted">{s.duration}</span>
                    </span>
                    <span className="text-sm font-semibold text-primary">{s.price}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </Step>

        <Step n={3} title="Ажилтан сонгох">
          <ul className="flex flex-wrap gap-3">
            {STAFF.map((s) => (
              <li key={s}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-variant bg-white px-4 py-3 has-checked:border-primary has-checked:bg-surface-tint">
                  <input type="radio" name="staff" className="sr-only" />
                  <Monogram name={s} />
                  <span className="text-sm font-medium text-ink">{s}</span>
                </label>
              </li>
            ))}
          </ul>
        </Step>

        <Step n={4} title="Огноо ба цаг сонгох">
          <div className="flex flex-col gap-4">
            <input
              type="date"
              defaultValue="2023-10-15"
              aria-label="Огноо"
              className="h-12 w-full max-w-[240px] rounded-xl bg-surface-tint px-4 text-sm text-ink focus:outline-2 focus:outline-primary"
            />
            <ul className="flex flex-wrap gap-3">
              {TIMES.map((t) => (
                <li key={t}>
                  <label className="cursor-pointer rounded-full border border-surface-variant bg-white px-5 py-2.5 text-sm text-body has-checked:border-primary has-checked:bg-primary has-checked:text-white">
                    <input type="radio" name="time" className="sr-only" />
                    {t}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </Step>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="h-12 rounded-full border border-surface-variant bg-white px-6 text-sm font-medium text-body hover:bg-surface-tint"
          >
            Цуцлах
          </button>
          <button
            type="submit"
            className="h-12 rounded-full bg-primary px-8 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Захиалга үүсгэх
          </button>
        </div>
      </div>
    </BusinessShell>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-3 text-lg leading-6 font-medium text-ink">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {n}
          </span>
          {title}
        </h2>
        {children}
      </div>
    </Panel>
  );
}
