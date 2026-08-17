import { Plus, Star } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Badge, FilterTabs, Monogram } from "@/components/admin/kit";

export const metadata = { title: "Ажилтнууд — Салоны админ" };

const STAFF = [
  {
    name: "Сарантуяа Б.",
    role: "Ахлах Үсчин",
    rating: "4.9",
    monthly: "124",
    status: "Идэвхтэй",
    active: true,
  },
  {
    name: "Батболд Г.",
    role: "Үсчин",
    rating: "4.7",
    monthly: "89",
    status: "Амарч байгаа",
    active: false,
  },
  {
    name: "Уянга М.",
    role: "Маникюрч",
    rating: "5.0",
    monthly: "156",
    status: "Идэвхтэй",
    active: true,
  },
];

export default function BusinessEmployeesPage() {
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
        description="Нийт 12 ажилтан бүртгэлтэй байна."
        actions={
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="size-4" />
            Ажилтан нэмэх
          </button>
        }
      />

      <div className="flex flex-col gap-6">
        <FilterTabs tabs={["Бүгд", "Үсчин", "Маникюрч", "Гоо сайханч"]} active="Бүгд" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {STAFF.map((s) => (
            <article
              key={s.name}
              className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline"
            >
              <div className="flex items-center gap-4">
                <Monogram name={s.name} />
                <div>
                  <h2 className="text-base leading-6 font-medium text-ink">{s.name}</h2>
                  <p className="text-xs text-muted">{s.role}</p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-tint pt-4">
                <div>
                  <dt className="text-xs text-muted">Үнэлгээ</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-ink">
                    <Star className="size-3.5 fill-gold text-gold" />
                    {s.rating}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Энэ сард</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{s.monthly}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-center justify-between">
                <Badge tone={s.active ? "success" : "warning"}>{s.status}</Badge>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Дэлгэрэнгүй
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
