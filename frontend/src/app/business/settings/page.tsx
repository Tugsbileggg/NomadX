import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";

export const metadata = { title: "Тохиргоо — Салоны админ" };

const TABS = [
  "Профайл",
  "Баталгаажуулалт",
  "Банк/Төлбөр",
  "Мэдэгдэл",
  "Аюулгүй байдал",
  "Гэрээ",
];

export default function BusinessSettingsPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/settings"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Тохиргоо"
        description="Байгууллагын мэдээлэл болон системийн тохиргоо удирдах хэсэг."
        actions={
          <button
            type="submit"
            className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Хадгалах
          </button>
        }
      />

      <div className="flex flex-col gap-6">
        <nav className="flex flex-wrap gap-6 border-b border-surface-variant">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                i === 0
                  ? "border-b-2 border-primary pb-3 text-sm font-medium text-primary"
                  : "pb-3 text-sm font-medium text-body hover:text-primary"
              }
            >
              {t}
            </button>
          ))}
        </nav>

        <Panel title="Профайл">
          <div className="grid max-w-[720px] gap-6 sm:grid-cols-2">
            <Field label="Бизнесийн нэр" defaultValue="LUMINA Wellness Spa" />
            <Field label="Утасны дугаар" type="tel" defaultValue="9911-2233" />
            <Field label="Хаяг" defaultValue="Улаанбаатар, Монгол" />
            <Field label="И-мэйл хаяг" type="email" defaultValue="contact@luminaspa.mn" />

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs leading-4 font-medium text-body">Танилцуулга</span>
              <textarea
                rows={4}
                defaultValue="Дээд зэрэглэлийн гоо сайхан, алжаал тайлах үйлчилгээ."
                className="w-full rounded-lg bg-surface-tint p-4 text-sm text-ink focus:outline-2 focus:outline-primary"
              />
            </label>
          </div>
        </Panel>
      </div>
    </BusinessShell>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <input
        className="h-11 w-full rounded-lg bg-surface-tint px-4 text-sm text-ink focus:outline-2 focus:outline-primary"
        {...props}
      />
    </label>
  );
}
