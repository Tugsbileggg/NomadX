import { CalendarCheck, CalendarClock, CalendarRange } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { StatCard } from "@/components/admin/kit";
import { BookingsPanel } from "@/components/bookings/BookingsPanel";
import {
  computeBookingStats,
  fetchBusinessBookings,
  findOwnedBusiness,
  type BookingStatus,
} from "@/lib/bookings/data";

export const metadata = { title: "Захиалгууд — Салоны админ" };

const BASE_PATH = "/business/bookings";

export default async function BusinessBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  const business = await findOwnedBusiness("salon");

  const bookings = business ? await fetchBusinessBookings(business.id) : [];
  const stats = computeBookingStats(bookings);

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/bookings"
      ctaHref="/business/bookings/new"
    >
      <PageHeader title="Захиалгууд" description="Захиалгуудаа удирдаж, хянана уу." />

      <div className="flex flex-col gap-6">
        {!business ? (
          <p className="rounded-2xl border border-surface-variant bg-white p-6 text-sm text-body shadow-hairline">
            Бизнесийн бүртгэл олдсонгүй.
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-3">
              <StatCard
                label="Өнөөдрийн захиалга"
                value={String(stats.today)}
                icon={CalendarCheck}
              />
              <StatCard label="Хүлээгдэж буй" value={String(stats.pending)} icon={CalendarClock} />
              <StatCard
                label="Энэ сарын нийт захиалга"
                value={String(stats.thisMonth)}
                icon={CalendarRange}
              />
            </div>

            <div className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline">
              <BookingsPanel
                basePath={BASE_PATH}
                bookings={bookings}
                status={(status as BookingStatus | undefined) ?? "all"}
                page={Number(page) || 1}
              />
            </div>
          </>
        )}
      </div>
    </BusinessShell>
  );
}
