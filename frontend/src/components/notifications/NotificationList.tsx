import Link from "next/link";
import {
  BadgeCheck,
  CalendarPlus,
  CheckCircle2,
  MessageSquare,
  ReceiptText,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Panel } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { deleteNotification, markNotificationRead } from "@/lib/notifications/actions";
import type { PanelNotification } from "@/lib/notifications/queries";
import type { NotificationKind } from "@/lib/db-types";
import { cn } from "@/lib/cn";

const ICON: Record<NotificationKind, LucideIcon> = {
  booking_created: CalendarPlus,
  booking_confirmed: CheckCircle2,
  booking_cancelled: XCircle,
  booking_completed: Sparkles,
  invoice_issued: ReceiptText,
  review_replied: MessageSquare,
  business_status: BadgeCheck,
};

const MONTHS = [
  "1 сар", "2 сар", "3 сар", "4 сар", "5 сар", "6 сар",
  "7 сар", "8 сар", "9 сар", "10 сар", "11 сар", "12 сар",
];

/** "10 сар 24 · 14:00" — mn-MN locale энэ орчинд бүрэн дэмжигдэхгүй. */
function formatWhen(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${MONTHS[d.getMonth()]} ${d.getDate()} · ${hh}:${mm}`;
}

export function NotificationList({
  items,
  bookingsPath,
}: {
  items: PanelNotification[];
  /** Захиалгын мэдэгдлээс очих зам — панел тус бүр өөр. */
  bookingsPath: string;
}) {
  if (!items.length) {
    return (
      <Panel>
        <p className="py-12 text-center text-sm text-muted">
          Мэдэгдэл алга. Шинэ захиалга ирэх, бүртгэлийн шийдвэр гарах үед энд харагдана.
        </p>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((n) => {
        const Icon = ICON[n.kind];
        return (
          <article
            key={n.id}
            className={cn(
              "flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-hairline",
              n.isRead ? "border-surface-variant" : "border-primary/40",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-tint">
              <Icon className="size-5 text-primary" strokeWidth={1.8} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                {n.title}
                {!n.isRead && <span className="size-2 rounded-full bg-primary" />}
              </p>
              {n.body && <p className="mt-0.5 text-sm text-body">{n.body}</p>}
              <p className="mt-1 text-xs text-muted">{formatWhen(n.createdAt)}</p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                {n.bookingId && (
                  <Link href={bookingsPath} className="text-xs font-medium text-primary hover:underline">
                    Захиалгыг харах
                  </Link>
                )}
                {!n.isRead && (
                  <ActionForm action={markNotificationRead} className="contents">
                    <input type="hidden" name="notification_id" value={n.id} />
                    <SubmitButton className="text-xs font-medium text-body hover:underline">
                      Уншсан болгох
                    </SubmitButton>
                  </ActionForm>
                )}
                <ActionForm action={deleteNotification} className="contents">
                  <input type="hidden" name="notification_id" value={n.id} />
                  <SubmitButton className="text-xs font-medium text-[#991b1b] hover:underline">
                    Устгах
                  </SubmitButton>
                </ActionForm>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
