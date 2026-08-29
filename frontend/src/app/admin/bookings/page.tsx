import Link from "next/link";
import { CalendarDays, CalendarX, CalendarCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { Badge, Panel, StatCard, Table, Td, type Tone } from "@/components/admin/kit";
import { cn } from "@/lib/cn";
import { fetchAdminBookings, getCurrentAdmin, type AdminBookingRow } from "@/lib/admin/data";

export const metadata = { title: "Захиалгын удирдлага — Супер админ" };

const BASE_PATH = "/admin/bookings";

const STATUS_LABEL: Record<string, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};
const STATUS_TONE: Record<string, Tone> = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

const FILTERS = [
  { label: "Бүгд", value: "all" },
  { label: "Хүлээгдэж буй", value: "pending" },
  { label: "Баталгаажсан", value: "confirmed" },
  { label: "Дууссан", value: "completed" },
  { label: "Цуцлагдсан", value: "cancelled" },
] as const;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status ?? "all";

  const [admin, rows] = await Promise.all([getCurrentAdmin(), fetchAdminBookings()]);

  const todayKey = new Date().toDateString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const todayCount = rows.filter(
    (b) => b.status !== "cancelled" && new Date(b.scheduledAt).toDateString() === todayKey,
  ).length;
  const monthCount = rows.filter((b) => new Date(b.scheduledAt) >= monthStart).length;
  const cancelledPercent = rows.length
    ? Math.round((rows.filter((b) => b.status === "cancelled").length / rows.length) * 100)
    : 0;

  const filtered: AdminBookingRow[] =
    filter === "all" ? rows : rows.filter((b) => b.status === filter);

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/bookings"
      title="Захиалгын удирдлага"
      description="Платформ дээрх бүх захиалгын хяналт."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Өнөөдрийн захиалга" value={String(todayCount)} icon={CalendarCheck} />
          <StatCard label="Энэ сарын нийт" value={String(monthCount)} icon={CalendarDays} />
          <StatCard label="Цуцлагдсан хувь" value={`${cancelledPercent}%`} icon={CalendarX} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={f.value === "all" ? BASE_PATH : `${BASE_PATH}?status=${f.value}`}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
                    filter === f.value
                      ? "bg-primary text-white"
                      : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
                  )}
                >
                  {f.label}
                </Link>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">Захиалга алга байна.</p>
            ) : (
              <Table headers={["Харилцагч", "Салон / Артист", "Огноо & цаг", "Төлөв"]}>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <Td className="font-medium text-ink">{b.customerName}</Td>
                    <Td>
                      <span className="block text-sm text-ink">{b.businessName}</span>
                      <span className="block text-xs text-muted">
                        {b.businessType === "artist" ? "Артист" : "Салон"}
                      </span>
                    </Td>
                    <Td>
                      <span className="block text-sm text-ink">
                        {new Date(b.scheduledAt).toLocaleDateString("mn-MN")}
                      </span>
                      <span className="block text-xs text-muted">
                        {new Date(b.scheduledAt).toLocaleTimeString("mn-MN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={STATUS_TONE[b.status] ?? "neutral"}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
