import { Star } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { FilterTabs, Monogram, Panel } from "@/components/admin/kit";

export const metadata = { title: "Сэтгэгдлүүд — Салоны админ" };

const BREAKDOWN = [
  { stars: 5, count: 728 },
  { stars: 4, count: 85 },
  { stars: 3, count: 26 },
  { stars: 2, count: 9 },
  { stars: 1, count: 8 },
];

const TOTAL = BREAKDOWN.reduce((sum, b) => sum + b.count, 0);

const REVIEWS = [
  {
    name: "Анударь Г.",
    when: "Өчигдөр",
    rating: 5,
    text: "Үнэхээр сэтгэл ханамжтай байлаа. Сарантуяа мастер маш чадварлаг юм. Орчин нь цэвэрхэн, тухтай байсан. Дахин үйлчлүүлэх болно.",
    service: "Арьс цэвэрлэгээ",
    master: "Сарантуяа Б.",
    reply: {
      when: "Өнөөдөр, 09:23",
      text: "Баярлалаа Анударь аа. Таны урмын үгс бидэнд маш их урам зориг өглөө. Таныг дахин ирэхийг баяртайгаар хүлээж байх болно.",
    },
  },
  {
    name: "Батчимэг",
    when: "3 хоногийн өмнө",
    rating: 3,
    text: "Цагтаа орж чадсангүй 20 минут хүлээлгэсэн. Үйлчилгээ хэвийн ч гэсэн хүлээлгийн хугацаа урт байлаа.",
    service: "Үс засалт",
    master: "Батболд Г.",
  },
];

export default function BusinessReviewsPage() {
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
        description="Үйлчлүүлэгчдийн үнэлгээ болон сэтгэгдлийн нэгдсэн тайлан."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center gap-1">
            <p className="text-5xl leading-none font-semibold text-ink">
              4.8
              <span className="text-lg text-muted"> / 5</span>
            </p>
            <p className="mt-2 text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
              Нийт {TOTAL.toLocaleString("en-US")} сэтгэгдэл
            </p>
          </div>

          <ul className="mt-6 flex flex-col gap-2">
            {BREAKDOWN.map((b) => (
              <li key={b.stars} className="flex items-center gap-3">
                <span className="flex w-6 items-center gap-1 text-xs text-body">
                  {b.stars}
                  <Star className="size-3 fill-gold text-gold" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tint">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(b.count / TOTAL) * 100}%` }}
                  />
                </span>
                <span className="w-10 text-right text-xs text-muted">{b.count}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <FilterTabs
            tabs={["Бүгд", "5 од", "4 од", "3 од болон доош", "Хариулаагүй"]}
            active="Бүгд"
          />

          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline"
            >
              <div className="flex items-center gap-3">
                <Monogram name={r.name} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    {r.name}
                    <span className="ml-2 text-xs font-normal text-muted">• {r.when}</span>
                  </p>
                  <span className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating
                            ? "size-3 fill-gold text-gold"
                            : "size-3 text-surface-variant"
                        }
                      />
                    ))}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-body">{r.text}</p>

              <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                <span>Үйлчилгээ: {r.service}</span>
                <span>Мастер: {r.master}</span>
              </p>

              {r.reply ? (
                <div className="mt-4 rounded-xl bg-surface-page p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                      G
                    </span>
                    <span className="text-xs text-muted">{r.reply.when}</span>
                  </div>
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
            </article>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
