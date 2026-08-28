import { Repeat, UserPlus, Users } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel, StatCard } from "@/components/admin/kit";
import { CustomerTable, CustomerTabs } from "@/components/customers/CustomerTable";
import { fetchPanelCustomers, type CustomerFilter } from "@/lib/customers/queries";

export const metadata = { title: "Харилцагчид — Салоны админ" };

const FILTERS = ["new", "regular", "inactive"];

export default async function BusinessCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  // Хаягаас ирсэн утгыг шууд итгэлгүй.
  const active = (FILTERS.includes(filter ?? "") ? filter : null) as CustomerFilter;

  const { customers, stats } = await fetchPanelCustomers(active);

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/customers"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Харилцагчид"
        description="Захиалга өгсөн хүмүүсийн нэгдсэн бүртгэл."
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Нийт харилцагч" value={String(stats.total)} icon={Users} />
          <StatCard label="Шинэ энэ сар" value={String(stats.newThisMonth)} icon={UserPlus} />
          <StatCard
            label="Дахин захиалсан хувь"
            value={`${stats.returningPct}%`}
            icon={Repeat}
            hint="2-оос дээш удаа захиалсан харилцагчид"
          />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <CustomerTabs basePath="/business/customers" active={active} />
            <CustomerTable customers={customers} />
          </div>
        </Panel>
      </div>
    </BusinessShell>
  );
}
