import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { GalleryManager } from "@/components/catalog/GalleryManager";
import { fetchOwnerCatalog } from "@/lib/catalog/queries";

export const metadata = { title: "Галерей — Салоны админ" };

export default async function BusinessGalleryPage() {
  const { businessId, gallery } = await fetchOwnerCatalog();

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/gallery"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Галерей"
        description="Салоны орчин, хийсэн ажлын зургаа энд байршуулна."
      />

      <GalleryManager gallery={gallery} canEdit={businessId !== null} noun="Галерей" />
    </BusinessShell>
  );
}
