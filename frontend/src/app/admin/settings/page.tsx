import Link from "next/link";
import { Bell, Percent, ShieldCheck, Sliders } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";
import { Badge, Monogram, Panel, Table, Td } from "@/components/admin/kit";
import { fetchAdminUsers, getCurrentAdmin } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { RoleActions } from "./RoleActions";

export const metadata = { title: "Тохиргоо — Супер админ" };

const BASE_PATH = "/admin/settings";

const TABS = [
  { label: "Админ эрх", value: "admins" },
  { label: "Ерөнхий", value: "general" },
  { label: "Комисс", value: "commission" },
  { label: "Мэдэгдэл", value: "notifications" },
] as const;

const ROLE_LABEL: Record<string, string> = {
  customer: "Хэрэглэгч",
  salon: "Салон",
  artist: "Артист",
  super_admin: "Админ",
};

/** Админаас чөлөөлөхөд буцаах role — бизнестэй эсэхээс хамаарахгүй аюулгүй утга. */
const DEMOTED_ROLE = "customer";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.some((t) => t.value === tab) ? tab! : "admins";

  const [me, { rows, error }] = await Promise.all([getCurrentAdmin(), fetchAdminUsers()]);

  const admins = rows.filter((r) => r.role === "super_admin");
  const others = rows.filter((r) => r.role !== "super_admin");

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={me}
      active="/admin/settings"
      title="Тохиргоо"
      description="Админ эрх болон системийн тохиргоо."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`${BASE_PATH}?tab=${t.value}`}
              className={cn(
                "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
                t.value === active
                  ? "bg-primary text-white"
                  : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {active === "admins" && (
          <>
            <Panel title={`Одоогийн админууд (${admins.length})`}>
              {error ? (
                <p className="py-6 text-sm text-[#991b1b]">{error}</p>
              ) : (
                <Table headers={["Хэрэглэгч", "И-мэйл", "Эрх", ""]}>
                  {admins.map((u) => (
                    <tr key={u.id} className="border-b border-surface-tint last:border-0">
                      <Td>
                        <span className="flex items-center gap-3">
                          <Monogram name={u.fullName} />
                          <span className="font-medium text-ink">{u.fullName}</span>
                        </span>
                      </Td>
                      <Td>{u.email}</Td>
                      <Td>
                        <Badge tone="primary">{ROLE_LABEL[u.role]}</Badge>
                      </Td>
                      <Td>
                        {u.email === me.email ? (
                          <span className="text-xs text-muted">Та</span>
                        ) : (
                          <RoleActions
                            userId={u.id}
                            role={u.role}
                            previousRole={DEMOTED_ROLE}
                          />
                        )}
                      </Td>
                    </tr>
                  ))}
                </Table>
              )}
              <p className="mt-4 text-xs leading-4 text-muted">
                Админ эрх олгох цорын ганц зам энэ хуудас. Хэрэглэгч өөрөө өөрийн
                эрхийг өөрчлөх боломжгүй.
              </p>
            </Panel>

            <Panel title="Админ томилох">
              <Table headers={["Хэрэглэгч", "И-мэйл", "Эрх", ""]}>
                {others.map((u) => (
                  <tr key={u.id} className="border-b border-surface-tint last:border-0">
                    <Td>
                      <span className="flex items-center gap-3">
                        <Monogram name={u.fullName} />
                        <span className="font-medium text-ink">{u.fullName}</span>
                      </span>
                    </Td>
                    <Td>{u.email}</Td>
                    <Td>
                      <Badge tone="neutral">{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    </Td>
                    <Td>
                      <RoleActions userId={u.id} role={u.role} previousRole={DEMOTED_ROLE} />
                    </Td>
                  </tr>
                ))}
              </Table>
            </Panel>
          </>
        )}

        {active === "general" && (
          <AdminComingSoon
            icon={Sliders}
            title="Платформын ерөнхий тохиргоо"
            description="Платформын нэр, лого, холбоо барих мэдээллийг хадгалах хүснэгт схемд хараахан байхгүй. Одоогоор эдгээр нь код болон env хувьсагчаар тодорхойлогддог."
          />
        )}

        {active === "commission" && (
          <AdminComingSoon
            icon={Percent}
            title="Комисс тохиргоо"
            description="Комисс тооцоолол нь бодит төлбөр тооцоо дээр тулгуурлана. Одоогийн нэхэмжлэх нь зөвхөн туршилтын бүртгэл тул комиссын хувь хадгалах, тооцоолох схем нэмэгдээгүй байна."
          />
        )}

        {active === "notifications" && (
          <AdminComingSoon
            icon={Bell}
            title="Мэдэгдлийн тохиргоо"
            description="Push болон и-мэйл мэдэгдэл хараахан хийгдээгүй. Мэдэгдлийн загвар, суваг, хэрэглэгчийн сонголтыг хадгалах хүснэгт схемд байхгүй."
          />
        )}

        {active === "admins" && (
          <p className="flex items-start gap-2 rounded-2xl border border-surface-variant bg-white px-5 py-4 text-xs leading-5 text-body shadow-hairline">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Админаас чөлөөлөгдсөн хэрэглэгч «Хэрэглэгч» эрхтэй болно. Бизнесийн
            эзэн байсан бол «Салонууд» хуудаснаас эрхийг нь буцааж тааруулна уу.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
