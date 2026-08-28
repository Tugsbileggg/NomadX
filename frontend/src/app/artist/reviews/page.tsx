import { ArtistPageHeader, ArtistPanel, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import {
  ReviewList,
  ReviewSummaryPanel,
  ReviewTabs,
} from "@/components/reviews/ReviewList";
import { fetchPanelReviews, type ReviewFilter } from "@/lib/reviews/queries";

export const metadata = { title: "Сэтгэгдлүүд — Артистын админ" };

const FILTERS = ["5", "4", "low", "unanswered"];

export default async function ArtistReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = (FILTERS.includes(filter ?? "") ? filter : null) as ReviewFilter;

  const { reviews, summary } = await fetchPanelReviews(active);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/reviews" {...ARTIST}>
      <ArtistPageHeader
        title="Сэтгэгдлүүд"
        chip={summary.average != null ? `${summary.average.toFixed(1)} / 5` : "Сэтгэгдэлгүй"}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ArtistPanel className="lg:col-span-1">
          <ReviewSummaryPanel summary={summary} />
        </ArtistPanel>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <ReviewTabs basePath="/artist/reviews" active={active} />
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </ArtistShell>
  );
}
