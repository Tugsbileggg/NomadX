import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { NotificationList } from "@/components/notifications/NotificationList";
import { MarkAllRead } from "@/components/notifications/MarkAllRead";
import { fetchPanelNotifications } from "@/lib/notifications/queries";

export const metadata = { title: "Мэдэгдэл — Салоны админ" };

export default async function BusinessNotificationsPage() {
  const items = await fetchPanelNotifications();
  const unread = items.filter((n) => !n.isRead).length;

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
        title="Мэдэгдэл"
        description={unread ? `${unread} уншаагүй мэдэгдэл байна.` : "Бүх мэдэгдлийг уншсан."}
        actions={unread > 0 ? <MarkAllRead /> : undefined}
      />

      <NotificationList items={items} bookingsPath="/business/bookings" />
    </BusinessShell>
  );
}
