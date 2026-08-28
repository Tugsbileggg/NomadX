import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Phone } from "lucide-react";

import { Badge, Monogram, type Tone } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { setBookingStatus } from "@/lib/bookings/actions";
import type { BookingStatus } from "@/lib/db-types";
import type { PanelBooking } from "@/lib/bookings/queries";
import { cn } from "@/lib/cn";

const STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  pending: { label: "Хүлээгдэж буй", tone: "warning" },
  confirmed: { label: "Баталгаажсан", tone: "success" },
  completed: { label: "Дууссан", tone: "neutral" },
  cancelled: { label: "Цуцлагдсан", tone: "danger" },
};

/** Товч бүр өөрийн маягттай — тухайн төлвөөс шилжих боломжтой нь л гарна. */
const NEXT_STEPS: Record<BookingStatus, { status: BookingStatus; label: string; primary?: boolean }[]> = {
  pending: [
    { status: "confirmed", label: "Баталгаажуулах", primary: true },
    { status: "cancelled", label: "Цуцлах" },
  ],
  confirmed: [
    { status: "completed", label: "Дууссан гэж тэмдэглэх", primary: true },
    { status: "cancelled", label: "Цуцлах" },
  ],
  completed: [],
  cancelled: [],
};

export const STATUS_TABS: { label: string; value: BookingStatus | null }[] = [
  { label: "Бүгд", value: null },
  { label: "Хүлээгдэж буй", value: "pending" },
  { label: "Баталгаажсан", value: "confirmed" },
  { label: "Дууссан", value: "completed" },
  { label: "Цуцлагдсан", value: "cancelled" },
];

/** Төлвөөр шүүх таб — FilterTabs-ийн хэлбэртэй ч жинхэнэ холбоос. */
export function StatusTabs({ basePath, active }: { basePath: string; active: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_TABS.map((t) => {
        const on = t.value === active;
        return (
          <Link
            key={t.label}
            href={t.value ? `${basePath}?status=${t.value}` : basePath}
            className={cn(
              "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
              on
                ? "bg-primary text-white"
                : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function BookingList({ bookings }: { bookings: PanelBooking[] }) {
  if (!bookings.length) {
    return (
      <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
        Энэ шүүлтэд тохирох захиалга алга.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: PanelBooking }) {
  const status = STATUS[booking.status];
  const steps = NEXT_STEPS[booking.status];
  const name = booking.customer?.name?.trim() || "Нэргүй хэрэглэгч";

  return (
    <article className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monogram name={name} />
          <div>
            <p className="text-sm font-medium text-ink">{name}</p>
            {booking.customer?.phone && (
              <a
                href={`tel:${booking.customer.phone}`}
                className="mt-0.5 flex items-center gap-1 text-xs text-body hover:text-primary"
              >
                <Phone className="size-3" />
                {booking.customer.phone}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-ink">
            <CalendarClock className="size-4 text-primary" />
            {formatWhen(booking.scheduledAt)}
          </span>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-surface-tint px-4 py-3">
        <p className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
          Хүсэлт
        </p>
        <p className="mt-1.5 text-sm leading-5 whitespace-pre-line text-ink">
          {booking.note?.trim() || "Тайлбар бичээгүй."}
        </p>
      </div>

      {booking.images.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
            Жишээ зураг
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {booking.images.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="relative size-24 overflow-hidden rounded-xl border border-surface-variant"
              >
                {/* Signed URL нь тухайн удаагийн хаяг тул next/image-ийн
                    оптимизацийг алгасна — эс тэгвэл кэш хугацаа нь зөрнө. */}
                <Image src={url} alt="" fill unoptimized className="object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-surface-tint pt-4">
          {steps.map((step) => (
            <ActionForm key={step.status} action={setBookingStatus} className="contents">
              <input type="hidden" name="booking_id" value={booking.id} />
              <input type="hidden" name="status" value={step.status} />
              <SubmitButton
                className={cn(
                  "h-9 rounded-full px-5 text-xs font-medium",
                  step.primary
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
                )}
              >
                {step.label}
              </SubmitButton>
            </ActionForm>
          ))}
        </div>
      )}
    </article>
  );
}

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
