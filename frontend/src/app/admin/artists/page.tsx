import Link from "next/link";
import { BadgeCheck, Clock, Paintbrush, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { Badge, Panel, StatCard, Table, Td, type Tone } from "@/components/admin/kit";
import { cn } from "@/lib/cn";
import { fetchAdminBusinesses, getCurrentAdmin, type AdminBusinessRow } from "@/lib/admin/data";

export const metadata = { title: "Артистуудын удирдлага — Супер админ" };

const BASE_PATH = "/admin/artists";

const STATUS_LABEL: Record<string, string> = {
  draft: "Ноорог",
  submitted: "Хүлээгдэж буй",
  under_review: "Хянагдаж буй",
  approved: "Баталгаажсан",
  rejected: "Татгалзсан",
  needs_info: "Мэдээлэл дутуу",
};
const STATUS_TONE: Record<string, Tone> = {
  draft: "neutral",
  submitted: "warning",
  under_review: "warning",
  approved: "success",
  rejected: "danger",
  needs_info: "warning",
};

const FILTERS = [
  { label: "Бүгд", value: "all" },
  { label: "Баталгаажсан", value: "approved" },
  { label: "Хүлээгдэж буй", value: "pending" },
  { label: "Татгалзсан", value: "rejected" },
] as const;

function matchesFilter(row: AdminBusinessRow, filter: string) {
  if (filter === "approved") return row.status === "approved";
  if (filter === "pending") return row.status === "submitted" || row.status === "under_review";
  if (filter === "rejected") return row.status === "rejected";
  return true;
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status ?? "all";

  const [admin, rows] = await Promise.all([getCurrentAdmin(), fetchAdminBusinesses("artist")]);

  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const pendingCount = rows.filter(
    (r) => r.status === "submitted" || r.status === "under_review",
  ).length;
  const rejectedCount = rows.filter((r) => r.status === "rejected").length;
  const filtered = rows.filter((r) => matchesFilter(r, filter));

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/artists"
      title="Артистуудын удирдлага"
      description="Хувиараа ажиллах мэргэжилтнүүдийн хяналт."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт артист" value={String(rows.length)} icon={Paintbrush} />
          <StatCard label="Баталгаажсан" value={String(approvedCount)} icon={BadgeCheck} />
          <StatCard label="Хүлээгдэж буй" value={String(pendingCount)} icon={Clock} />
          <StatCard label="Татгалзсан" value={String(rejectedCount)} icon={XCircle} />
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
              <p className="py-10 text-center text-sm text-muted">Артист олдсонгүй.</p>
            ) : (
              <Table headers={["Артист", "Мэргэжил / Байршил", "Захиалга", "Төлөв", "Үйлдэл"]}>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <Td>
                      <span className="block text-sm font-medium text-ink">{r.name}</span>
                      <span className="block text-xs text-muted">ID: {r.id.slice(0, 8)}</span>
                    </Td>
                    <Td>
                      <span className="block text-sm text-ink">
                        {r.categories.length ? r.categories.join(", ") : "—"}
                      </span>
                      <span className="block text-xs text-muted">{r.address ?? "—"}</span>
                    </Td>
                    <Td>{r.bookingsCount} захиалга</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Link
                        href="/admin/verification"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Дэлгэрэнгүй
                      </Link>
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
