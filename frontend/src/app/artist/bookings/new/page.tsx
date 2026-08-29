import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { NewBookingForm } from "@/components/bookings/NewBookingForm";
import { fetchOwnerDaySlots } from "@/lib/bookings/slots";

export const metadata = { title: "Шинэ захиалга — Артистын админ" };

export default async function ArtistNewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = await fetchOwnerDaySlots(date);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/bookings" {...ARTIST}>
      <ArtistPageHeader title="Шинэ захиалга" />

      {day.hasBusiness ? (
        <NewBookingForm day={day} basePath="/artist/bookings/new" />
      ) : (
        <p className="rounded-2xl border border-surface-variant bg-white p-6 text-sm text-body shadow-hairline">
          Бизнесийн бүртгэл олдсонгүй.
        </p>
      )}
    </ArtistShell>
  );
}
