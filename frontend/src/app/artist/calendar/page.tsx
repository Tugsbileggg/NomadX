import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { fetchPanelBookings } from "@/lib/bookings/queries";

export const metadata = { title: "Календарь — Артистын админ" };

export default async function ArtistCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>;
}) {
  const { month, date } = await searchParams;
  const { bookings, counts } = await fetchPanelBookings();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/calendar" {...ARTIST}>
      <ArtistPageHeader title="Календарь" chip={`Өнөөдөр ${counts.today}`} />

      <BookingCalendar
        bookings={bookings}
        basePath="/artist/calendar"
        month={month}
        date={date}
      />
    </ArtistShell>
  );
}
