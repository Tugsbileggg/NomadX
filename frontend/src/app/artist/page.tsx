import { CalendarCheck, Heart, Star, Wallet } from "lucide-react";
import { ArtistPageHeader, ArtistPanel, ArtistShell, ArtistStat } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import {
  RecentReviews,
  StatusMix,
  TodoPanel,
  TrendChart,
} from "@/components/dashboard/DashboardPanels";
import { fetchDashboard } from "@/lib/dashboard/queries";

export const metadata = { title: "Ерөнхий тойм — Артистын админ" };

export default async function ArtistDashboardPage() {
  const { stats, trend, statusMix, recentReviews, todo } = await fetchDashboard();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist" {...ARTIST}>
      <ArtistPageHeader
        title="Ерөнхий тойм"
        chip={stats.rating != null ? `${stats.rating.toFixed(1)} / 5` : "Сэтгэгдэлгүй"}
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <ArtistStat
            label="Нэхэмжилсэн"
            value={stats.invoiced.toLocaleString("en-US")}
            suffix="₮"
            icon={Wallet}
          />
          <ArtistStat label="Нийт захиалга" value={String(stats.bookings)} icon={CalendarCheck} />
          <ArtistStat
            label="Дундаж үнэлгээ"
            value={stats.rating?.toFixed(1) ?? "—"}
            suffix={`/ ${stats.reviewCount} сэтгэгдэл`}
            icon={Star}
          />
          <ArtistStat
            label="Дахин ирсэн"
            value={String(stats.returningPct)}
            suffix="%"
            icon={Heart}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel title="Сүүлийн 7 хоногийн захиалга" className="lg:col-span-2">
            <TrendChart trend={trend} />
          </ArtistPanel>

          <ArtistPanel title="Сүүлийн сэтгэгдлүүд">
            <RecentReviews reviews={recentReviews} href="/artist/reviews" />
          </ArtistPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel title="Захиалгын төлөв" className="lg:col-span-2">
            <StatusMix mix={statusMix} />
          </ArtistPanel>

          <ArtistPanel title="Анхаарал шаардсан">
            <TodoPanel todo={todo} bookingsHref="/artist/bookings" reviewsHref="/artist/reviews" />
          </ArtistPanel>
        </div>
      </div>
    </ArtistShell>
  );
}
