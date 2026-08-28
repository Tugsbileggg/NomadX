import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";
import {
  ReviewList,
  ReviewSummaryPanel,
  ReviewTabs,
} from "@/components/reviews/ReviewList";
import { fetchPanelReviews, type ReviewFilter } from "@/lib/reviews/queries";

export const metadata = { title: "Сэтгэгдлүүд — Салоны админ" };

const FILTERS = ["5", "4", "low", "unanswered"];

export default async function BusinessReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  // Хаягаас ирсэн утгыг шууд итгэлгүй.
  const active = (FILTERS.includes(filter ?? "") ? filter : null) as ReviewFilter;

  const { reviews, summary } = await fetchPanelReviews(active);

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/reviews"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Сэтгэгдлүүд"
        description="Үйлчлүүлэгчдийн үнэлгээ. Хариу бичвэл аппын профайл дээр сэтгэгдлийн доор харагдана."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <ReviewSummaryPanel summary={summary} />
        </Panel>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <ReviewTabs basePath="/business/reviews" active={active} />
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </BusinessShell>
  );
}
