import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { ScheduleEditor } from "@/components/schedule/ScheduleEditor";
import { fetchOwnerSchedule } from "@/lib/schedule/queries";

export const metadata = { title: "Хуваарь тохиргоо — Салоны админ" };

export default async function AvailabilityPage() {
  const schedule = await fetchOwnerSchedule();

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/availability"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Хуваарь тохиргоо"
        description="Энд тохируулсан цаг үйлчлүүлэгчийн аппад шууд харагдаж, захиалга авах цагуудыг тодорхойлно."
      />

      {schedule.hasBusiness ? (
        <ScheduleEditor schedule={schedule} />
      ) : (
        <p className="rounded-2xl border border-surface-variant bg-white p-6 text-sm text-body shadow-hairline">
          Бизнесийн бүртгэл олдсонгүй.
        </p>
      )}
    </BusinessShell>
  );
}
