import { BadgeCheck, Clock, FileCheck2, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import { Badge, Panel, StatCard, Table, Td } from "@/components/admin/kit";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "./ReviewActions";

export const metadata = { title: "Баталгаажуулалт — Супер админ" };

const STATUS_TONE = {
  submitted: { tone: "warning" as const, label: "Хүлээгдэж буй" },
  under_review: { tone: "primary" as const, label: "Хянагдаж буй" },
};

export default async function VerificationPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("businesses")
    .select("id, name, type, address, status, submitted_at, documents(kind)")
    .in("status", ["submitted", "under_review"])
    .order("submitted_at", { ascending: true });

  const [pending, approved, rejected] = await Promise.all([
    countBy(supabase, ["submitted", "under_review"]),
    countBy(supabase, ["approved"]),
    countBy(supabase, ["rejected"]),
  ]);

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/verification"
      title="Баталгаажуулалт"
      description="Шалгах шаардлагатай шинэ бүртгэлүүд."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Хүлээгдэж буй" value={String(pending)} icon={Clock} />
          <StatCard label="Зөвшөөрсөн" value={String(approved)} icon={BadgeCheck} />
          <StatCard label="Татгалзсан" value={String(rejected)} icon={XCircle} />
          <StatCard
            label="Нийт хүсэлт"
            value={String(pending + approved + rejected)}
            icon={FileCheck2}
          />
        </div>

        <Panel>
          {rows?.length ? (
            <Table
              headers={["Нэр", "Төрөл", "Хүсэлт илгээсэн огноо", "Баримт бичиг", "Үйлдэл"]}
            >
              {rows.map((r) => {
                const status = STATUS_TONE[r.status as keyof typeof STATUS_TONE];
                return (
                  <tr key={r.id}>
                    <Td>
                      <span className="block text-sm font-medium text-ink">
                        {r.name ?? "Нэргүй бүртгэл"}
                      </span>
                      <span className="block text-xs text-muted">{r.address ?? "—"}</span>
                    </Td>
                    <Td>{r.type === "artist" ? "Артист" : "Салон"}</Td>
                    <Td>
                      <span className="block">
                        {r.submitted_at
                          ? new Date(r.submitted_at).toLocaleDateString("mn-MN")
                          : "—"}
                      </span>
                      {status && (
                        <Badge tone={status.tone}>{status.label}</Badge>
                      )}
                    </Td>
                    <Td>{r.documents?.length ?? 0} файл</Td>
                    <Td>
                      <ReviewActions businessId={r.id} />
                    </Td>
                  </tr>
                );
              })}
            </Table>
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              Одоогоор шалгах хүсэлт алга байна.
            </p>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}

async function countBy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  statuses: string[],
) {
  const { count } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .in("status", statuses);
  return count ?? 0;
}
