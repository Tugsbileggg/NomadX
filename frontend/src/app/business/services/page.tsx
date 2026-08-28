import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";
import { ServiceManager } from "@/components/catalog/ServiceManager";
import { fetchOwnerCatalog } from "@/lib/catalog/queries";

export const metadata = { title: "Үйлчилгээнүүд — Салоны админ" };

export default async function BusinessServicesPage() {
  const { businessId, services } = await fetchOwnerCatalog();

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/services"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Үйлчилгээнүүд"
        description="Үнийн цэсээ энд удирдана. Захиалга нь эдгээрээс сонгодоггүй — үйлчлүүлэгч хүслээ өөрөө бичдэг."
      />

      <Panel>
        <ServiceManager services={services} canEdit={businessId !== null} />
      </Panel>
    </BusinessShell>
  );
}
