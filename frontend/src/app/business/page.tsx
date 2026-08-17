import { CalendarCheck, Download, Heart, Star, Wallet } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { LineChart } from "@/components/admin/LineChart";
import { MeterRow, Monogram, Panel, StatCard } from "@/components/admin/kit";

export const metadata = { title: "Мэдээлэл — Салоны админ" };

const DAYS = ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"];

const REVIEWS = [
  {
    name: "Золзаяа",
    rating: 5,
    text: "Үнэхээр сайхан байлаа, орчин нь их тайвшруулах юм.",
  },
  {
    name: "Гэрлээ",
    rating: 4,
    text: "Массаж сайн байсан ч цаг бага зэрэг хоцорч эхэлсэн.",
  },
];

const DEMAND = [
  { label: "Үс засалт", percent: 85 },
  { label: "Маникюр", percent: 65 },
  { label: "Массаж", percent: 45 },
  { label: "Нүүр будалт", percent: 30 },
  { label: "Педикюр", percent: 20 },
];

const STAFF = [
  { name: "Анударь", count: "42 үйлчилгээ" },
  { name: "Болдмаа", count: "38 үйлчилгээ" },
  { name: "Цэцэгээ", count: "25 үйлчилгээ" },
];

const RANGES = ["Энэ долоо хоног", "Энэ сар", "Энэ жил", "Сонгох"];

export default function BusinessAnalyticsPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Мэдээлэл"
        description="Таны салоны үйл ажиллагааны ерөнхий тойм."
        actions={
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap gap-2">
              {RANGES.map((r, i) => (
                <button
                  key={r}
                  type="button"
                  className={
                    i === 0
                      ? "rounded-full bg-primary px-4 py-2 text-xs font-medium text-white"
                      : "rounded-full px-4 py-2 text-xs font-medium text-body hover:bg-surface-tint"
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-full border border-surface-variant bg-white px-4 text-xs font-medium text-body hover:bg-surface-tint"
            >
              <Download className="size-3.5" />
              Тайлан татах
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт орлого" value="₮ 14.5M" delta="+12%" icon={Wallet} />
          <StatCard label="Нийт захиалга" value="342" delta="+5.4%" icon={CalendarCheck} />
          <StatCard label="Дундаж үнэлгээ" value="4.8" hint="/ 5.0" icon={Star} />
          <StatCard label="Харилцагчийн хадгалалт" value="72%" hint="-2%" icon={Heart} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Орлого ба Захиалгын хандлага" className="lg:col-span-2">
            <LineChart
              labels={DAYS}
              yTicks={["20M", "15M", "10M", "5M", "0"]}
              series={[
                {
                  label: "Орлого",
                  color: "var(--color-primary)",
                  fill: "rgba(138,72,83,0.08)",
                  points: [3, 4, 9, 8.5, 14, 13, 18.5],
                },
                {
                  label: "Захиалга",
                  color: "var(--color-outline)",
                  points: [4, 8, 8, 12, 11.5, 16, 15],
                },
              ]}
            />
          </Panel>

          <Panel title="Сүүлийн сэтгэгдлүүд">
            <ul className="flex flex-col gap-4">
              {REVIEWS.map((r) => (
                <li key={r.name} className="rounded-xl border border-surface-tint p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">{r.name}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating
                              ? "size-3 fill-gold text-gold"
                              : "size-3 text-surface-variant"
                          }
                        />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-body">{r.text}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Үйлчилгээний эрэлт" className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              {DEMAND.map((d, i) => (
                <MeterRow
                  key={d.label}
                  label={d.label}
                  percent={d.percent}
                  color={
                    ["bg-primary", "bg-primary-light", "bg-primary-accent", "bg-outline", "bg-surface-variant"][i]
                  }
                />
              ))}
            </div>
          </Panel>

          <Panel title="Ажилтны үзүүлэлт">
            <ul className="flex flex-col gap-3">
              {STAFF.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <Monogram name={s.name} />
                  <span className="flex-1 text-sm font-medium text-ink">{s.name}</span>
                  <span className="text-xs text-muted">{s.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </BusinessShell>
  );
}
