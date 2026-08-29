import Link from "next/link";
import { Ban, UserCheck, UserPlus, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { Badge, Monogram, Panel, StatCard, Table, Td } from "@/components/admin/kit";
import { cn } from "@/lib/cn";
import { fetchAdminUsers, getCurrentAdmin, type AdminUserRow } from "@/lib/admin/data";
import { UserActions } from "./UserActions";

export const metadata = { title: "Хэрэглэгчийн удирдлага — Супер админ" };

const BASE_PATH = "/admin/users";
const ROLE_LABEL: Record<string, string> = {
  customer: "Хэрэглэгч",
  salon: "Салон",
  artist: "Артист",
  super_admin: "Админ",
};

const FILTERS = [
  { label: "Бүгд", value: "all" },
  { label: "Идэвхтэй", value: "active" },
  { label: "Хориглогдсон", value: "banned" },
  { label: "Баталгаажаагүй", value: "unconfirmed" },
] as const;

function matchesFilter(row: AdminUserRow, filter: string) {
  if (filter === "banned") return row.banned;
  if (filter === "unconfirmed") return !row.emailConfirmed;
  if (filter === "active") return !row.banned && row.emailConfirmed;
  return true;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status ?? "all";

  const [admin, { rows, error }] = await Promise.all([getCurrentAdmin(), fetchAdminUsers()]);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const newThisMonth = rows.filter((r) => new Date(r.createdAt) >= thisMonth).length;
  const activeCount = rows.filter((r) => !r.banned).length;
  const bannedCount = rows.filter((r) => r.banned).length;
  const filtered = rows.filter((r) => matchesFilter(r, filter));

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/users"
      title="Хэрэглэгчийн удирдлага"
      description="Платформын бодит хугацааны үзүүлэлтүүд."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хэрэглэгч" value={String(rows.length)} icon={Users} />
          <StatCard label="Шинэ бүртгэл (энэ сар)" value={String(newThisMonth)} icon={UserPlus} />
          <StatCard label="Идэвхтэй хэрэглэгч" value={String(activeCount)} icon={UserCheck} />
          <StatCard label="Хориглогдсон хэрэглэгчид" value={String(bannedCount)} icon={Ban} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            {error ? (
              <p className="rounded-xl bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</p>
            ) : (
              <>
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
                  <p className="py-10 text-center text-sm text-muted">Хэрэглэгч олдсонгүй.</p>
                ) : (
                  <Table
                    headers={[
                      "Хэрэглэгч",
                      "Холбоо барих",
                      "Бүртгүүлсэн",
                      "Захиалга",
                      "Төлөв",
                      "Үйлдэл",
                    ]}
                  >
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Monogram name={r.fullName} />
                            <span>
                              <span className="block text-sm font-medium text-ink">
                                {r.fullName}
                              </span>
                              <span className="block text-xs text-muted">
                                {ROLE_LABEL[r.role] ?? r.role}
                              </span>
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <span className="block text-sm text-ink">{r.phone ?? "—"}</span>
                          <span className="block text-xs text-muted">{r.email || "—"}</span>
                        </Td>
                        <Td>{new Date(r.createdAt).toLocaleDateString("mn-MN")}</Td>
                        <Td>{r.bookingsCount}</Td>
                        <Td>
                          <div className="flex flex-col items-start gap-1">
                            <Badge tone={r.banned ? "danger" : "success"}>
                              {r.banned ? "Хориглогдсон" : "Идэвхтэй"}
                            </Badge>
                            {!r.emailConfirmed && <Badge tone="warning">Баталгаажаагүй</Badge>}
                          </div>
                        </Td>
                        <Td>
                          <UserActions userId={r.id} banned={r.banned} />
                        </Td>
                      </tr>
                    ))}
                  </Table>
                )}
              </>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
