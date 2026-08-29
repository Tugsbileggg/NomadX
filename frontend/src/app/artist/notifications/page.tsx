import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { NotificationList } from "@/components/notifications/NotificationList";
import { MarkAllRead } from "@/components/notifications/MarkAllRead";
import { fetchPanelNotifications } from "@/lib/notifications/queries";

export const metadata = { title: "Мэдэгдэл — Артистын админ" };

export default async function ArtistNotificationsPage() {
  const items = await fetchPanelNotifications();
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist" {...ARTIST}>
      <ArtistPageHeader
        title="Мэдэгдэл"
        chip={unread ? `${unread} уншаагүй` : undefined}
        actions={unread > 0 ? <MarkAllRead /> : undefined}
      />

      <NotificationList items={items} bookingsPath="/artist/bookings" />
    </ArtistShell>
  );
}
