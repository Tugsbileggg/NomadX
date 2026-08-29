import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Paintbrush,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { Donut, MeterRow, Panel, StatCard, Table, Td } from "@/components/admin/kit";
import {
  getBookingSuccessRate,
  getCategoryBreakdown,
  getCurrentAdmin,
  getPendingVerifications,
  getPlatformCounts,
} from "@/lib/admin/data";
import { ReviewActions } from "./verification/ReviewActions";

export const metadata = { title: "Ерөнхий мэдээлэл — Супер админ" };

export default async function SuperAdminDashboard() {
  const [admin, counts, categories, bookingStats, pending] = await Promise.all([
    getCurrentAdmin(),
    getPlatformCounts(),
    getCategoryBreakdown(),
    getBookingSuccessRate(),
    getPendingVerifications(),
  ]);

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin"
      title="Ерөнхий мэдээлэл"
      description="Платформын бодит хугацааны үзүүлэлтүүд."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хэрэглэгч" value={String(counts.totalUsers)} icon={Users} />
          <StatCard label="Нийт артист" value={String(counts.totalArtists)} icon={Paintbrush} />
          <StatCard label="Нийт салон" value={String(counts.totalSalons)} icon={Store} />
          <StatCard
            label="Өнөөдрийн захиалга"
            value={String(counts.todayBookings)}
            icon={CalendarCheck}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard
            label="Баталгаажсан бизнес"
            value={String(counts.approvedBusinesses)}
            icon={BadgeCheck}
          />
          <StatCard
            label="Баталгаажуулалт хүлээгдэж буй"
            value={String(counts.pendingVerification)}
            hint="Шалгах шаардлагатай шинэ бүртгэлүүд"
            icon={ClipboardList}
          />
          <StatCard
            label="Татгалзсан бизнес"
            value={String(counts.rejectedBusinesses)}
            icon={XCircle}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            title="Баталгаажуулалт хүлээгдэж буй"
            className="lg:col-span-2"
            action={
              <Link
                href="/admin/verification"
                className="text-xs font-medium text-primary hover:underline"
              >
                Бүгдийг харах ({counts.pendingVerification})
              </Link>
            }
          >
            {pending.length ? (
              <Table headers={["Нэр", "Төрөл", "Хүсэлт илгээсэн огноо", "Үйлдэл"]}>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <Td>
                      <span className="block text-sm font-medium text-ink">
                        {p.name ?? "Нэргүй бүртгэл"}
                      </span>
                      <span className="block text-xs text-muted">{p.address ?? "—"}</span>
                    </Td>
                    <Td>{p.type === "artist" ? "Артист" : "Салон"}</Td>
                    <Td>
                      {p.submitted_at ? new Date(p.submitted_at).toLocaleDateString("mn-MN") : "—"}
                    </Td>
                    <Td>
                      <ReviewActions businessId={p.id} />
                    </Td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="py-10 text-center text-sm text-muted">
                Одоогоор шалгах хүсэлт алга байна.
              </p>
            )}
          </Panel>

          <div className="flex flex-col gap-6">
            <Panel title="Ангилалын тархалт">
              {categories.length ? (
                <div className="flex flex-col gap-4">
                  {categories.map((c, i) => (
                    <MeterRow
                      key={c.category}
                      label={c.category}
                      percent={c.percent}
                      color={i === 0 ? "bg-primary" : i === 1 ? "bg-primary-light" : "bg-primary-accent"}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Одоогоор ангилалын өгөгдөл алга.</p>
              )}
            </Panel>

            <Panel title="Захиалга vs Цуцлалт">
              {bookingStats.total ? (
                <div className="flex items-center gap-6">
                  <Donut percent={bookingStats.successPercent} label="Амжилттай захиалга" />
                  <ul className="flex flex-col gap-2 text-sm text-body">
                    <li className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      Амжилттай ({bookingStats.successPercent}%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-danger" />
                      Цуцлагдсан ({100 - bookingStats.successPercent}%)
                    </li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted">Одоогоор захиалга алга.</p>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
