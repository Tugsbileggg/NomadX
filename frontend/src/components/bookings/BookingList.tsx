import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Phone, ReceiptText } from "lucide-react";

import { Badge, Monogram, type Tone } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveInvoice, setBookingStatus, setInvoiceStatus } from "@/lib/bookings/actions";
import type { BookingStatus, InvoiceStatus } from "@/lib/db-types";
import type { PanelBooking } from "@/lib/bookings/queries";
import { cn } from "@/lib/cn";

/** Захиалгын төлвийн шошго/өнгө — жагсаалт, календарь хоёуланд нь. */
export const STATUS_META: Record<BookingStatus, { label: string; tone: Tone }> = {
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

const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  issued: { label: "Илгээсэн", tone: "warning" },
  paid: { label: "Төлөгдсөн", tone: "success" },
  cancelled: { label: "Цуцлагдсан", tone: "danger" },
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
  const status = STATUS_META[booking.status];
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

      {booking.status === "completed" && <InvoiceBlock booking={booking} />}

      <StatusSteps
        bookingId={booking.id}
        status={booking.status}
        className="mt-5 border-t border-surface-tint pt-4"
      />
    </article>
  );
}

/**
 * Тухайн төлвөөс шилжих боломжтой үйлдлүүд. Шилжих зам байхгүй
 * (дууссан/цуцлагдсан) бол юу ч гаргахгүй.
 */
export function StatusSteps({
  bookingId,
  status,
  className,
}: {
  bookingId: string;
  status: BookingStatus;
  className?: string;
}) {
  const steps = NEXT_STEPS[status];
  if (!steps.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {steps.map((step) => (
        <ActionForm key={step.status} action={setBookingStatus} className="contents">
          <input type="hidden" name="booking_id" value={bookingId} />
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
  );
}

/**
 * ⚠️ Туршилтын нэхэмжлэх. Бодит төлбөр тооцоо хийгддэггүй — бизнес дүнгээ
 * бичиж үлдээхэд үйлчлүүлэгчийн аппад харагдана, төлөв нь гар аргаар л
 * өөрчлөгдөнө.
 */
function InvoiceBlock({ booking }: { booking: PanelBooking }) {
  const invoice = booking.invoice;

  return (
    <div className="mt-5 rounded-xl border border-dashed border-outline px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.6px] text-muted uppercase">
          <ReceiptText className="size-3.5" />
          Нэхэмжлэх
          <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] tracking-normal normal-case">
            туршилтын
          </span>
        </p>
        {invoice && <Badge tone={INVOICE_STATUS[invoice.status].tone}>
          {INVOICE_STATUS[invoice.status].label}
        </Badge>}
      </div>

      {invoice && (
        <p className="mt-3 text-2xl leading-8 font-semibold text-ink">
          {invoice.amount.toLocaleString("en-US")}₮
        </p>
      )}
      {invoice?.note && <p className="mt-1 text-sm text-body">{invoice.note}</p>}

      {/* ActionForm нь алдаа/амжилтын мэдэгдлээ эхний хүүхэд болгон гаргадаг
          тул баганаар өрж, талбаруудыг дотор нь мөр болгоно — эс тэгвэл
          мэдэгдэл нь оролтуудын хооронд шахагдана. */}
      <ActionForm action={saveInvoice} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="booking_id" value={booking.id} />
        <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">Дүн (₮)</span>
          <input
            type="number"
            name="amount"
            min={0}
            required
            defaultValue={invoice?.amount ?? ""}
            placeholder="0"
            className="h-10 w-40 rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary"
          />
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <span className="text-xs text-muted">Тайлбар (заавал биш)</span>
          <input
            type="text"
            name="note"
            defaultValue={invoice?.note ?? ""}
            placeholder="Хийгдсэн ажлын товч"
            className="h-10 w-full rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary"
          />
        </label>
        <SubmitButton
          className="h-10 rounded-full bg-primary px-5 text-xs font-medium text-white hover:bg-primary-dark"
          pendingLabel="Хадгалж байна..."
        >
          {invoice ? "Дүнг шинэчлэх" : "Нэхэмжлэх үүсгэх"}
        </SubmitButton>
        </div>
      </ActionForm>

      {invoice && invoice.status === "issued" && (
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionForm action={setInvoiceStatus} className="contents">
            <input type="hidden" name="invoice_id" value={invoice.id} />
            <input type="hidden" name="status" value="paid" />
            <SubmitButton className="h-9 rounded-full border border-surface-variant bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint">
              Төлөгдсөн гэж тэмдэглэх
            </SubmitButton>
          </ActionForm>
          <ActionForm action={setInvoiceStatus} className="contents">
            <input type="hidden" name="invoice_id" value={invoice.id} />
            <input type="hidden" name="status" value="cancelled" />
            <SubmitButton className="h-9 rounded-full border border-surface-variant bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint">
              Цуцлах
            </SubmitButton>
          </ActionForm>
        </div>
      )}
    </div>
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
