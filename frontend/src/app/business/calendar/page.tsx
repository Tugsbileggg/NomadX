import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { fetchPanelBookings } from "@/lib/bookings/queries";

export const metadata = { title: "Календар — Салоны админ" };

export default async function BusinessCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const { month, date } = await searchParams;
  const { bookings, counts } = await fetchPanelBookings();

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
        description={`Нийт ${counts.total} захиалга · өнөөдөр ${counts.today}`}
      />

      <BookingCalendar
        bookings={bookings}
        basePath="/business/calendar"
        month={month}
        date={date}
      />
    </BusinessShell>
  );
}
