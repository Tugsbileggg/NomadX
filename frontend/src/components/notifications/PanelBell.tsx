import Link from "next/link";
import { Bell } from "lucide-react";

import { fetchUnreadCount } from "@/lib/notifications/queries";

/**
 * Панелийн толгой дээрх хонх — уншаагүй мэдэгдлийн бодит тоотой.
 *
 * Урьд нь энэ товч юу ч хийдэггүй байсан бөгөөд артистын панел дээр
 * зохиомол улаан цэг үргэлж асаалттай байв.
 *
 * async server component — эцэг shell нь sync хэвээрээ үлдэнэ.
 */
export async function PanelBell({ href, className }: { href: string; className: string }) {
  const unread = await fetchUnreadCount();

  return (
    <Link href={href} aria-label={`Мэдэгдэл${unread ? ` (${unread} уншаагүй)` : ""}`} className={className}>
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
