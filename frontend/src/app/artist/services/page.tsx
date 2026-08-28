import { ArtistPageHeader, ArtistPanel, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { ServiceManager } from "@/components/catalog/ServiceManager";
import { fetchOwnerCatalog } from "@/lib/catalog/queries";

export const metadata = { title: "Үйлчилгээнүүд — Артистын админ" };

export default async function ArtistServicesPage() {
  const { businessId, services } = await fetchOwnerCatalog();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/services" {...ARTIST}>
      <ArtistPageHeader title="Үйлчилгээнүүд" chip={`${services.length} үйлчилгээ`} />

      <ArtistPanel>
        <ServiceManager services={services} canEdit={businessId !== null} />
      </ArtistPanel>
    </ArtistShell>
  );
}
