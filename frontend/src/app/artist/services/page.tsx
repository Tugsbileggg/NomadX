import { Clock, Plus, SlidersHorizontal } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { FilterTabs } from "@/components/admin/kit";

export const metadata = { title: "Үйлчилгээнүүд — Артистын админ" };

const SERVICES = [
  {
    category: "Хөмсөг",
    name: "Хөмсөг хэлбэржүүлэлт",
    body: "Таны царайн хэлбэрт тохируулан хөмсгийг хэлбэржүүлэх үйлчилгээ.",
    price: "45,000₮",
    duration: "45 мин",
  },
  {
    category: "Сормуус",
    name: "Сонгодог сормуус суулгалт",
    body: "Байгалийн сормуусаа удаан эдэлгээтэй сормуусаар өтгөрүүлнэ.",
    price: "65,000₮",
    duration: "60 мин",
  },
  {
    category: "Маникюр",
    name: "Гель маникюр",
    body: "Хумсны арьс арчилгаатай, удаан эдэлгээтэй гель будалт.",
    price: "55,000₮",
    duration: "90 мин",
  },
];

export default function ArtistServicesPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/services" {...ARTIST}>
      <ArtistPageHeader
        title="Үйлчилгээнүүд"
        actions={
          <>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full border border-outline bg-white px-4 text-xs font-medium text-body hover:bg-surface-tint"
            >
              <SlidersHorizontal className="size-3.5" />
              Шүүх
            </button>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Plus className="size-4" />
              Үйлчилгээ нэмэх
            </button>
          </>
        }
      />
      <p className="-mt-6 pb-8 text-sm text-body">Үзүүлдэг үйлчилгээгээ удирдана уу.</p>

      <div className="flex flex-col gap-6">
        <FilterTabs tabs={["Бүгд", "Хөмсөг", "Сормуус", "Маникюр"]} active="Бүгд" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s) => (
            <ArtistPanel key={s.name}>
              <span className="inline-flex rounded-full bg-surface-tint px-3 py-1 text-xs font-medium text-primary">
                {s.category}
              </span>
              <h2 className="mt-4 text-lg leading-6 font-medium text-ink">{s.name}</h2>
              <p className="mt-2 text-sm leading-5 text-body">{s.body}</p>
              <div className="mt-6 flex items-center justify-between border-t border-surface-tint pt-4">
                <span className="text-base leading-6 font-semibold text-primary">
                  {s.price}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-body">
                  <Clock className="size-3.5" />
                  {s.duration}
                </span>
              </div>
            </ArtistPanel>
          ))}
        </div>
      </div>
    </ArtistShell>
  );
}
