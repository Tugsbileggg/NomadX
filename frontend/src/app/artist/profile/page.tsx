import { Camera, MapPin, Pencil, Plus, Star } from "lucide-react";
import { ArtistPanel, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";

export const metadata = { title: "Миний профайл — Артистын админ" };

const SERVICES = [
  { name: "Үс тайралт", price: "₮35,000", duration: "60 мин" },
  { name: "Хөмсөг хэлбэржүүлэх", price: "₮20,000", duration: "30 мин" },
  { name: "Үдшийн гоёл будалт", price: "₮80,000", duration: "90 мин" },
];

export default function ArtistProfilePage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/profile" {...ARTIST}>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <p className="text-sm text-body">Ингэж хэрэглэгчид харагдана</p>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Pencil className="size-4" />
          Профайл засах
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-soft backdrop-blur-xl">
          <div className="relative h-44 bg-linear-to-r from-primary-container to-primary-accent">
            <button
              type="button"
              className="absolute right-4 bottom-4 flex h-9 items-center gap-2 rounded-full bg-white/80 px-4 text-xs font-medium text-primary hover:bg-white"
            >
              <Camera className="size-3.5" />
              Ковер зураг солих
            </button>
          </div>

          <div className="relative px-8 pt-14 pb-8">
            <span className="absolute -top-10 left-8 flex size-20 items-center justify-center rounded-full border-4 border-white bg-primary-container text-xl font-semibold text-primary-dark">
              С
            </span>

            <h1 className="text-2xl leading-8 font-semibold text-ink">Сарантуяа Б.</h1>
            <p className="mt-1 text-sm text-body">Үсчин · Хөмсөг</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-body">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-gold text-gold" />
                <span className="font-medium text-ink">4.8</span>
                <span className="text-muted">(120 сэтгэгдэл)</span>
              </span>
              <span className="text-muted">•</span>
              <span>5 жил туршлагатай</span>
              <span className="text-muted">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                Улаанбаатар хот
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel title="Миний тухай" className="lg:col-span-2">
            <p className="text-sm leading-6 text-body">
              Гоо сайхны салбарт 5 дахь жилдээ ажиллаж байна. Үс засалт, будалт болон хөмсөг
              хэлбэржүүлэх чиглэлээр мэргэшсэн. Үйлчлүүлэгч бүрийнхээ онцлогт тохирсон дахин
              давтагдашгүй дүр төрхийг бүтээхийг зорьдог. Олон улсын сургалт, мастер классуудад
              тогтмол хамрагдаж ур чадвараа байнга дээшлүүлдэг.
            </p>
          </ArtistPanel>

          <ArtistPanel title="Үйлчилгээ">
            <ul className="flex flex-col gap-3">
              {SERVICES.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-surface-tint bg-white p-4"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{s.name}</span>
                    <span className="block text-xs text-muted">{s.duration}</span>
                  </span>
                  <span className="text-sm font-semibold text-primary">{s.price}</span>
                </li>
              ))}
            </ul>
          </ArtistPanel>
        </div>

        <ArtistPanel
          title="Портфолио"
          action={
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Бүгдийг харах
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-linear-to-br from-surface-tint to-primary-container"
              />
            ))}
            <button
              type="button"
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 text-xs font-medium text-primary hover:border-primary"
            >
              <Plus className="size-5" />
              Зураг нэмэх
            </button>
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
