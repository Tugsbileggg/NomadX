import Link from "next/link";
import { CalendarCheck, Repeat, Star, Wallet } from "lucide-react";

import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
  ArtistStat,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { LineChart } from "@/components/admin/LineChart";
import { MeterRow } from "@/components/admin/kit";
import { fetchAnalytics, parseRange, RANGES, RANGE_LABEL } from "@/lib/analytics/queries";
import { cn } from "@/lib/cn";

export const metadata = { title: "Мэдээлэл — Артистын админ" };

/** Y тэнхлэгийн 5 хуваарь — хамгийн их утгаас тэгш хуваана. */
function yTicks(max: number) {
  if (max <= 0) return ["0", "0", "0", "0", "0"];
  return Array.from({ length: 5 }, (_, i) => {
    const value = (max / 4) * (4 - i);
    return value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : value >= 1_000
        ? `${Math.round(value / 1_000)}K`
        : String(Math.round(value));
  });
}

export default async function ArtistAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: raw } = await searchParams;
  const range = parseRange(raw);
  const { hasBusiness, stats, trend, weekdayLoad } = await fetchAnalytics(range);

  const max = Math.max(...trend.map((t) => t.value), 0);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/analytics" {...ARTIST}>
      <ArtistPageHeader
        title="Мэдээлэл"
        actions={
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/artist/analytics?range=${r}`}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium transition-colors",
                  r === range
                    ? "bg-primary text-white"
                    : "border border-outline bg-white text-body hover:bg-surface-tint",
                )}
              >
                {RANGE_LABEL[r]}
              </Link>
            ))}
          </div>
        }
      />
      <p className="-mt-6 pb-8 text-sm text-body">
        Сонгосон хугацааны бодит үзүүлэлт. Бүх тоо таны захиалга, нэхэмжлэх,
        сэтгэгдлээс шууд тооцогдоно.
      </p>

      {!hasBusiness ? (
        <ArtistPanel>
          <p className="py-10 text-center text-sm text-muted">Бизнесийн бүртгэл олдсонгүй.</p>
        </ArtistPanel>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <ArtistStat
              label="Нэхэмжилсэн дүн"
              value={`${stats.invoiced.toLocaleString("en-US")}₮`}
              icon={Wallet}
            />
            <ArtistStat
              label="Захиалга"
              value={String(stats.bookings)}
              suffix={`/ ${stats.completed} дууссан`}
              icon={CalendarCheck}
            />
            <ArtistStat
              label="Дундаж үнэлгээ"
              value={stats.rating != null ? stats.rating.toFixed(1) : "—"}
              suffix={stats.reviewCount ? `/ ${stats.reviewCount} сэтгэгдэл` : undefined}
              icon={Star}
            />
            <ArtistStat
              label="Дахин ирсэн харилцагч"
              value={`${stats.returningPct}%`}
              suffix={`/ ${stats.customers} хүн`}
              icon={Repeat}
            />
          </div>

          <p className="-mt-2 text-xs text-muted">
            ⚠️ Нэхэмжлэх нь туршилтын бүртгэл — бодит төлбөр тооцоо хийгддэггүй.
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            <ArtistPanel title="Нэхэмжилсэн дүнгийн хандлага" className="lg:col-span-2">
              {max === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                  Энэ хугацаанд нэхэмжлэх үүсээгүй байна.
                </p>
              ) : (
                <LineChart
                  labels={trend.map((t) => t.label)}
                  yTicks={yTicks(max)}
                  series={[
                    {
                      label: "Нэхэмжилсэн",
                      color: "var(--color-primary)",
                      fill: "rgba(138,72,83,0.08)",
                      points: trend.map((t) => t.value),
                    },
                  ]}
                />
              )}
            </ArtistPanel>

            {/* Дизайнд "Үйлчилгээний эрэлт" байсан ч захиалга нь үйлчилгээг
                заадаггүй (үйлчлүүлэгч хүслээ чөлөөтэй бичдэг) тул гаргах
                боломжгүй. Гарагийн ачаалал нь хуваарь тохируулахад бодитоор
                хэрэгтэй бөгөөд одоо байгаа өгөгдлөөс тооцогдоно. */}
            <ArtistPanel title="Гарагийн ачаалал">
              {stats.bookings === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                  Энэ хугацаанд захиалга алга.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {weekdayLoad.map((d) => (
                    <MeterRow key={d.label} label={`${d.label} · ${d.count}`} percent={d.percent} />
                  ))}
                </div>
              )}
            </ArtistPanel>
          </div>
        </div>
      )}
    </ArtistShell>
  );
}
