import { Star } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { FilterTabs, Monogram } from "@/components/admin/kit";

export const metadata = { title: "Сэтгэгдлүүд — Артистын админ" };

const BREAKDOWN = [
  { stars: 5, count: 132 },
  { stars: 4, count: 16 },
  { stars: 3, count: 5 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

const TOTAL = BREAKDOWN.reduce((s, b) => s + b.count, 0);

const REVIEWS = [
  {
    name: "Сарнай Б.",
    meta: "2024.10.20 • Нүүрний арчилгаа",
    rating: 5,
    text: "Маш их таалагдлаа, үнэхээр тухтай орчин байна. Үйлчилгээ маш сайн байсан, дахин заавал ирнэ ээ. Баярлалаа!",
    reply: {
      author: "LUMINA",
      when: "2024.10.21",
      text: "Сарнай танд маш их баярлалаа. Бидний үйлчилгээ таалагдсанд баяртай байна. Дараа дахин уулзахыг тэсэн ядан хүлээж байна.",
    },
  },
  {
    name: "Болормаа Д.",
    meta: "2024.10.18 • Сонгодог сормуус суулгалт",
    rating: 4,
    text: "Ажил нь маш нямбай. Ганц зүйл гэвэл цаг арай урт болсон.",
  },
];

export default function ArtistReviewsPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/reviews" {...ARTIST}>
      <ArtistPageHeader title="Сэтгэгдлүүд" />

      <div className="grid gap-6 lg:grid-cols-3">
        <ArtistPanel>
          <div className="flex flex-col items-center">
            <p className="flex items-center gap-2 text-5xl leading-none font-semibold text-ink">
              4.9
              <Star className="size-7 fill-gold text-gold" />
            </p>
            <p className="mt-3 text-xs font-medium text-body">{TOTAL} сэтгэгдэл</p>
          </div>

          <ul className="mt-6 flex flex-col gap-2">
            {BREAKDOWN.map((b) => (
              <li key={b.stars} className="flex items-center gap-3">
                <span className="w-12 text-xs text-body">{b.stars} од</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tint">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(b.count / TOTAL) * 100}%` }}
                  />
                </span>
                <span className="w-8 text-right text-xs text-muted">{b.count}</span>
              </li>
            ))}
          </ul>
        </ArtistPanel>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <FilterTabs
            tabs={["Бүгд", "5 од", "4 од", "3 од ба доош", "Хариулаагүй"]}
            active="Бүгд"
          />

          {REVIEWS.map((r) => (
            <ArtistPanel key={r.name}>
              <div className="flex items-center gap-3">
                <Monogram name={r.name} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.meta}</p>
                </div>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating
                          ? "size-3.5 fill-gold text-gold"
                          : "size-3.5 text-surface-variant"
                      }
                    />
                  ))}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-body">{r.text}</p>

              {r.reply ? (
                <div className="mt-4 rounded-xl bg-surface-tint p-4">
                  <p className="text-xs font-medium text-ink">
                    {r.reply.author}
                    <span className="ml-2 font-normal text-muted">{r.reply.when}</span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-body">{r.reply.text}</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="mt-4 h-9 rounded-full border border-outline bg-white px-4 text-xs font-medium text-primary hover:bg-surface-tint"
                >
                  Хариулах
                </button>
              )}
            </ArtistPanel>
          ))}
        </div>
      </div>
    </ArtistShell>
  );
}
