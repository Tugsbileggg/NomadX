import { supabase } from "@/lib/supabase"
import type { NotificationKind } from "@/lib/db-types"

/**
 * Апп доторх мэдэгдэл.
 *
 * Мөрүүдийг DB-ийн триггерүүд үүсгэдэг (0020) — клиент зөвхөн уншиж,
 * уншсан болгож, устгана.
 */

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  body: string | null
  bookingId: string | null
  businessId: string | null
  isRead: boolean
  createdAt: string
}

/** Нэг удаад татах дээд тоо — хонхны жагсаалтад хангалттай. */
const PAGE_SIZE = 50

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, booking_id, business_id, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE)

  return (data ?? []).map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    bookingId: n.booking_id,
    businessId: n.business_id,
    isRead: n.read_at !== null,
    createdAt: n.created_at,
  }))
}

/** Хонхон дээрх тоо. RLS нь өөрийн мөрөөр хязгаарладаг тул шүүлт хэрэггүй. */
export async function fetchUnreadCount(): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)

  return count ?? 0
}

export async function markRead(id: string): Promise<void> {
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id)
}

export async function markAllRead(): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
}

export async function deleteNotification(id: string): Promise<void> {
  await supabase.from("notifications").delete().eq("id", id)
}

/* ------------------------------------------------------- шууд дамжуулалт */

type Listener = (n: AppNotification) => void
const listeners = new Set<Listener>()

/**
 * Шинэ мэдэгдэл ирэхэд дуудагдана. Салгах функц буцаана.
 *
 * Хэд хэдэн газар сонсож болно (дэлгэц дээрх самбар, хонхны тоолуур) —
 * тэд бүгд НЭГ Realtime сувгийг хуваалцана.
 */
export function onNotification(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/**
 * Өөрийн мэдэгдлийг Realtime-аар сонсоно.
 *
 * Зөвхөн НЭГ газраас дуудна (`InAppNotice`) — суваг тус бүр вэб сокет
 * эзэлдэг тул хэрэглэгч бүрд нэгээс илүү нээх нь илүүц.
 *
 * `filter` нь серверийн талд шүүнэ. RLS давхар хамгаална (0020-ийн
 * `notifications_select_own`) тул бусдын мөр энд хэзээ ч ирэхгүй.
 * Хүснэгт нь Realtime-ийн publication-д байх ёстой (0022).
 */
export function subscribeToNotifications(profileId: string): () => void {
  const channel = supabase
    .channel(`notifications:${profileId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `profile_id=eq.${profileId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string
          kind: NotificationKind
          title: string
          body: string | null
          booking_id: string | null
          business_id: string | null
          read_at: string | null
          created_at: string
        }

        const notification: AppNotification = {
          id: row.id,
          kind: row.kind,
          title: row.title,
          body: row.body,
          bookingId: row.booking_id,
          businessId: row.business_id,
          isRead: row.read_at !== null,
          createdAt: row.created_at,
        }

        for (const fn of listeners) fn(notification)
      },
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

/** Төрөл бүрийн дүрс — жагсаалтад хурдан ялгахад. */
export const NOTIFICATION_ICON: Record<NotificationKind, string> = {
  booking_created: "calendar-outline",
  booking_confirmed: "checkmark-circle-outline",
  booking_cancelled: "close-circle-outline",
  booking_completed: "sparkles-outline",
  invoice_issued: "receipt-outline",
  review_replied: "chatbubble-ellipses-outline",
  business_status: "shield-checkmark-outline",
}
