import { CalendarCheck, Heart, Star, Wallet } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel, StatCard } from "@/components/admin/kit";
import {
  RecentReviews,
  StatusMix,
  TodoPanel,
  TrendChart,
} from "@/components/dashboard/DashboardPanels";
import { fetchDashboard } from "@/lib/dashboard/queries";

export const metadata = { title: "Мэдээлэл — Салоны админ" };

export default async function BusinessDashboardPage() {
  const { stats, trend, statusMix, recentReviews, todo } = await fetchDashboard();

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
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Нэхэмжилсэн дүн"
            value={`${stats.invoiced.toLocaleString("en-US")}₮`}
            icon={Wallet}
            hint="Төлбөр тооцоо хараахан хийгдээгүй"
          />
          <StatCard label="Нийт захиалга" value={String(stats.bookings)} icon={CalendarCheck} />
          <StatCard
            label="Дундаж үнэлгээ"
            value={stats.rating?.toFixed(1) ?? "—"}
            icon={Star}
            hint={`${stats.reviewCount} сэтгэгдэл`}
          />
          <StatCard
            label="Дахин ирсэн"
            value={`${stats.returningPct}%`}
            icon={Heart}
            hint={`${stats.customers} харилцагчаас`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Сүүлийн 7 хоногийн захиалга" className="lg:col-span-2">
            <TrendChart trend={trend} />
          </Panel>

          <Panel title="Сүүлийн сэтгэгдлүүд">
            <RecentReviews reviews={recentReviews} href="/business/reviews" />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Захиалгын төлөв" className="lg:col-span-2">
            <StatusMix mix={statusMix} />
          </Panel>

          <Panel title="Анхаарал шаардсан">
            <TodoPanel
              todo={todo}
              bookingsHref="/business/bookings"
              reviewsHref="/business/reviews"
            />
          </Panel>
        </div>
      </div>
    </BusinessShell>
  );
}
