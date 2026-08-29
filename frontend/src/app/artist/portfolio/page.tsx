import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { GalleryManager } from "@/components/catalog/GalleryManager";
import { fetchOwnerCatalog } from "@/lib/catalog/queries";

export const metadata = { title: "Бүтээлүүд — Артистын админ" };

export default async function ArtistPortfolioPage() {
  const { businessId, gallery } = await fetchOwnerCatalog();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/portfolio" {...ARTIST}>
      <ArtistPageHeader title="Бүтээлүүд" chip={`${gallery.length} зураг`} />

      <GalleryManager gallery={gallery} canEdit={businessId !== null} noun="Бүтээлүүд" />
    </ArtistShell>
  );
}
