import { createClient } from "@/lib/supabase/server";
import type { NotificationKind } from "@/lib/db-types";

/**
 * Панелийн мэдэгдэл.
 *
 * Мөрүүдийг DB-ийн триггерүүд үүсгэдэг (0020) — бизнесийн эзэнд шинэ
 * захиалга ирэх, бүртгэлийн шийдвэр гарах үед. RLS нь `profile_id`-гаар
 * хязгаарладаг тул энд нэмэлт шүүлт хэрэггүй.
 */

export type PanelNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  bookingId: string | null;
  isRead: boolean;
  createdAt: string;
};

const PAGE_SIZE = 50;

export async function fetchPanelNotifications(): Promise<PanelNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, booking_id, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  return (data ?? []).map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    bookingId: n.booking_id,
    isRead: n.read_at !== null,
    createdAt: n.created_at,
  }));
}

/** Хонхон дээрх тоо. Нэвтрээгүй үед 0. */
export async function fetchUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return count ?? 0;
}
