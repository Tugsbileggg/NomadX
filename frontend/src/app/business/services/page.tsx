import { Clock, Pencil, Plus } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { FilterTabs } from "@/components/admin/kit";

export const metadata = { title: "Үйлчилгээнүүд — Салоны админ" };

const SERVICES = [
  {
    name: "Эрэгтэй үс засалт",
    price: "35,000₮",
    body: "Мэргэжлийн үсчний зөвлөгөө, угаалт, тайралт, хэлбэржүүлэлт багтсан.",
    duration: "45 мин",
  },
  {
    name: "Гельэн хумс будалт",
    price: "45,000₮",
    body: "Хумсны хэлбэр засах, cuticule цэвэрлэх, 1-2 өнгийн гель будалт.",
    duration: "60 мин",
  },
  {
    name: "Бүтэн биеийн алжаал тайлах",
    price: "120,000₮",
    body: "Халуун чулуун болон тосон иллэг хосолсон гүн алжаал тайлах дээд зэрэглэлийн үйлчилгээ.",
    duration: "90 мин",
  },
];

export default function BusinessServicesPage() {
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
        description="Нийт 24 үйлчилгээ бүртгэлтэй байна."
        actions={
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="size-4" />
            Үйлчилгээ нэмэх
          </button>
        }
      />

      <div className="flex flex-col gap-6">
        <FilterTabs
          tabs={["Бүгд", "Үсчин", "Маникюр", "Спа", "Нүүр будалт", "Багц"]}
          active="Бүгд"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.name}
              className="flex flex-col rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg leading-6 font-medium text-ink">{s.name}</h2>
                <span className="shrink-0 text-base leading-6 font-semibold text-primary">
                  {s.price}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-5 text-body">{s.body}</p>
              <div className="mt-6 flex items-center justify-between border-t border-surface-tint pt-4">
                <span className="flex items-center gap-1.5 text-xs text-body">
                  <Clock className="size-3.5" />
                  {s.duration}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Pencil className="size-3.5" />
                  Засах
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
