import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { NewBookingForm } from "@/components/bookings/NewBookingForm";
import { fetchOwnerDaySlots } from "@/lib/bookings/slots";

export const metadata = { title: "Шинэ захиалга — Салоны админ" };

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = await fetchOwnerDaySlots(date);

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/bookings"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Шинэ захиалга"
        description="Утсаар залгасан, ирсэн газраасаа захиалсан үйлчлүүлэгчийг энд бүртгэнэ."
      />

      {day.hasBusiness ? (
        <NewBookingForm day={day} basePath="/business/bookings/new" />
      ) : (
        <p className="rounded-2xl border border-surface-variant bg-white p-6 text-sm text-body shadow-hairline">
          Бизнесийн бүртгэл олдсонгүй.
        </p>
      )}
    </BusinessShell>
  );
}
