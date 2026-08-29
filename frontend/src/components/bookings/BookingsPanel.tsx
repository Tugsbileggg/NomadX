import Link from "next/link";
import { Badge, Monogram, Table, Td } from "@/components/admin/kit";
import { cn } from "@/lib/cn";
import {
  STATUS_FILTERS,
  STATUS_LABEL,
  STATUS_TONE,
  type BookingRow,
  type BookingStatus,
} from "@/lib/bookings/data";
import { BookingActions } from "./BookingActions";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("mn-MN", { month: "long", day: "numeric" }),
    time: d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function BookingsPanel({
  basePath,
  bookings,
  status,
  page,
}: {
  basePath: string;
  bookings: BookingRow[];
  status: BookingStatus | "all";
  page: number;
}) {
  const filtered = status === "all" ? bookings : bookings.filter((b) => b.status === status);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? basePath : `${basePath}?status=${f.value}`}
            className={cn(
              "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
              status === f.value
                ? "bg-primary text-white"
                : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {pageRows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Захиалга алга байна.</p>
      ) : (
        <Table headers={["Харилцагч", "Огноо/Цаг", "Тэмдэглэл", "Төлөв", "Үйлдэл"]}>
          {pageRows.map((b) => {
            const { date, time } = formatDate(b.scheduledAt);
            return (
              <tr key={b.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Monogram name={b.customerName} />
                    <span>
                      <span className="block text-sm font-medium text-ink">{b.customerName}</span>
                      {b.customerPhone && (
                        <span className="block text-xs text-muted">{b.customerPhone}</span>
                      )}
                    </span>
                  </div>
                </Td>
                <Td>
                  <span className="block text-sm text-ink">{date}</span>
                  <span className="block text-xs text-muted">{time}</span>
                </Td>
                <Td className="max-w-[220px] truncate">{b.note || "—"}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                </Td>
                <Td>
                  <BookingActions bookingId={b.id} status={b.status} basePath={basePath} />
                </Td>
              </tr>
            );
          })}
        </Table>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <p className="text-xs leading-4 text-body">
            Нийт {filtered.length}-с {start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)}{" "}
            харуулж байна
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`${basePath}?${new URLSearchParams({
                    ...(status !== "all" ? { status } : {}),
                    page: String(p),
                  }).toString()}`}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                    p === safePage
                      ? "bg-primary text-white"
                      : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
