import { CalendarCheck, CalendarClock, CalendarRange } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel, StatCard } from "@/components/admin/kit";
import { BookingList, StatusTabs } from "@/components/bookings/BookingList";
import { fetchPanelBookings } from "@/lib/bookings/queries";
import type { BookingStatus } from "@/lib/db-types";

export const metadata = { title: "Захиалгууд — Салоны админ" };

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export default async function BusinessBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  // Хаягаас ирсэн утгыг шууд итгэлгүй — зөвшөөрөгдсөн төлөв мөн эсэхийг шалгана.
  const active = STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : null;

  const { bookings, counts } = await fetchPanelBookings(active ?? undefined);

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
        title="Захиалгууд"
        description="Үйлчлүүлэгчийн хүсэлтийг хараад баталгаажуулна уу."
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Өнөөдрийн захиалга" value={String(counts.today)} icon={CalendarCheck} />
          <StatCard label="Хүлээгдэж буй" value={String(counts.pending)} icon={CalendarClock} />
          <StatCard label="Нийт захиалга" value={String(counts.total)} icon={CalendarRange} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <StatusTabs basePath="/business/bookings" active={active} />
            <BookingList bookings={bookings} />
          </div>
        </Panel>
      </div>
    </BusinessShell>
  );
}
