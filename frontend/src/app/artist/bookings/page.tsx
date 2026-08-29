import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarRange, Plus } from "lucide-react";
import { ArtistPageHeader, ArtistPanel, ArtistShell, ArtistStat } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { BookingList, StatusTabs } from "@/components/bookings/BookingList";
import { fetchPanelBookings } from "@/lib/bookings/queries";
import type { BookingStatus } from "@/lib/db-types";

export const metadata = { title: "Захиалгууд — Артистын админ" };

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export default async function ArtistBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  // Хаягаас ирсэн утгыг шууд итгэлгүй — зөвшөөрөгдсөн төлөв мөн эсэхийг шалгана.
  const active = STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : null;

  const { bookings, counts } = await fetchPanelBookings(active ?? undefined);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/bookings" {...ARTIST}>
      <ArtistPageHeader
        title="Захиалгууд"
        chip={`Хүлээгдэж буй ${counts.pending}`}
        actions={
          <Link
            href="/artist/bookings/new"
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="size-4" />
            Шинэ захиалга
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <ArtistStat label="Өнөөдөр" value={String(counts.today)} icon={CalendarCheck} />
          <ArtistStat label="Хүлээгдэж буй" value={String(counts.pending)} icon={CalendarClock} />
          <ArtistStat label="Нийт" value={String(counts.total)} icon={CalendarRange} />
        </div>

        <ArtistPanel>
          <div className="flex flex-col gap-4">
            <StatusTabs basePath="/artist/bookings" active={active} />
            <BookingList bookings={bookings} />
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
