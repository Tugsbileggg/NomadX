import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { ScheduleEditor } from "@/components/schedule/ScheduleEditor";
import { fetchOwnerSchedule } from "@/lib/schedule/queries";

export const metadata = { title: "Хуваарь — Артистын админ" };

export default async function ArtistAvailabilityPage() {
  const schedule = await fetchOwnerSchedule();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/availability" {...ARTIST}>
      <ArtistPageHeader title="Хуваарь" />

      {schedule.hasBusiness ? (
        <ScheduleEditor schedule={schedule} />
      ) : (
        <p className="rounded-2xl border border-surface-variant bg-white p-6 text-sm text-body shadow-hairline">
          Бизнесийн бүртгэл олдсонгүй.
        </p>
      )}
    </ArtistShell>
  );
}
