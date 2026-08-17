import { CalendarCheck, Download, Heart, Star, Wallet } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
  ArtistStat,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { LineChart } from "@/components/admin/LineChart";
import { MeterRow } from "@/components/admin/kit";

export const metadata = { title: "Мэдээлэл — Артистын админ" };

const RANGES = ["Долоо хоног", "Сар", "Жил", "Сонгох"];

export default function ArtistAnalyticsPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/analytics" {...ARTIST}>
      <ArtistPageHeader
        title="Мэдээлэл"
        actions={
          <>
            <div className="flex gap-2">
              {RANGES.map((r, i) => (
                <button
                  key={r}
                  type="button"
                  className={
                    i === 1
                      ? "rounded-full bg-primary px-4 py-2 text-xs font-medium text-white"
                      : "rounded-full border border-outline bg-white px-4 py-2 text-xs font-medium text-body hover:bg-surface-tint"
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full border border-outline bg-white px-4 text-xs font-medium text-body hover:bg-surface-tint"
            >
              <Download className="size-3.5" />
              Тайлан татах
            </button>
          </>
        }
      />
      <p className="-mt-6 pb-8 text-sm text-body">
        Бизнесийн өсөлт болон харилцагчийн хандлага.
      </p>

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <ArtistStat label="Нийт орлого" value="₮12.4M" delta="14.5%" icon={Wallet} />
          <ArtistStat label="Нийт захиалга" value="184" delta="5.2%" icon={CalendarCheck} />
          <ArtistStat label="Дундаж үнэлгээ" value="4.9" suffix="/ 5.0" icon={Star} />
          <ArtistStat label="Харилцагчийн хадгалалт" value="78%" delta="2.1%" icon={Heart} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel title="Орлогын хандлага" className="lg:col-span-2">
            <LineChart
              labels={["1-р долоо", "2-р долоо", "3-р долоо", "4-р долоо"]}
              yTicks={["4M", "3M", "2M", "1M", "0"]}
              series={[
                {
                  label: "Орлого",
                  color: "var(--color-primary)",
                  fill: "rgba(138,72,83,0.08)",
                  points: [1.8, 2.6, 2.2, 3.6],
                },
              ]}
            />
          </ArtistPanel>

          <ArtistPanel title="Үйлчилгээний эрэлт">
            <div className="flex flex-col gap-4">
              <MeterRow label="Хөмсөг" percent={42} />
              <MeterRow label="Сормуус" percent={31} color="bg-primary-light" />
              <MeterRow label="Маникюр" percent={18} color="bg-primary-accent" />
              <MeterRow label="Бусад" percent={9} color="bg-surface-variant" />
            </div>
          </ArtistPanel>
        </div>
      </div>
    </ArtistShell>
  );
}
