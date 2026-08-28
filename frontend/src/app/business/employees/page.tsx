import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";
import { StaffManager } from "@/components/catalog/StaffManager";
import { fetchOwnerCatalog } from "@/lib/catalog/queries";

export const metadata = { title: "Ажилтнууд — Салоны админ" };

export default async function BusinessEmployeesPage() {
  const { businessId, staff } = await fetchOwnerCatalog();

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/employees"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Ажилтнууд"
        description="Мастеруудаа энд бүртгэнэ. Аппын профайл дээр харагдана."
      />

      <Panel>
        <StaffManager staff={staff} canEdit={businessId !== null} />
      </Panel>
    </BusinessShell>
  );
}
