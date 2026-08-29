import { CalendarCheck, CalendarClock, CalendarRange } from "lucide-react";
import { ArtistPageHeader, ArtistPanel, ArtistShell, ArtistStat } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { BookingsPanel } from "@/components/bookings/BookingsPanel";
import {
  computeBookingStats,
  fetchBusinessBookings,
  findOwnedBusiness,
  type BookingStatus,
} from "@/lib/bookings/data";

export const metadata = { title: "Захиалгууд — Артистын админ" };

const BASE_PATH = "/artist/bookings";

export default async function ArtistBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  const business = await findOwnedBusiness("artist");

  const bookings = business ? await fetchBusinessBookings(business.id) : [];
  const stats = computeBookingStats(bookings);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/bookings" {...ARTIST}>
      <ArtistPageHeader title="Захиалгууд" />

      <div className="flex flex-col gap-6">
        {!business ? (
          <ArtistPanel>
            <p className="text-sm text-body">Бизнесийн бүртгэл олдсонгүй.</p>
          </ArtistPanel>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-3">
              <ArtistStat label="Өнөөдрийн захиалга" value={String(stats.today)} icon={CalendarCheck} />
              <ArtistStat label="Хүлээгдэж буй" value={String(stats.pending)} icon={CalendarClock} />
              <ArtistStat
                label="Энэ сарын нийт захиалга"
                value={String(stats.thisMonth)}
                icon={CalendarRange}
              />
            </div>

            <ArtistPanel>
              <BookingsPanel
                basePath={BASE_PATH}
                bookings={bookings}
                status={(status as BookingStatus | undefined) ?? "all"}
                page={Number(page) || 1}
              />
            </ArtistPanel>
          </>
        )}
      </div>
    </ArtistShell>
  );
}
