import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { BarChart, MeterRow } from "@/components/admin/kit";
import type { Dashboard } from "@/lib/dashboard/queries";

/** Сүүлийн 7 хоногийн захиалгын тоо. */
export function TrendChart({ trend }: { trend: Dashboard["trend"] }) {
  const total = trend.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        Сүүлийн 7 хоногт захиалга бүртгэгдээгүй байна.
      </p>
    );
  }

  return <BarChart data={trend.map((d) => ({ label: d.label, value: d.value }))} />;
}

export function StatusMix({ mix }: { mix: Dashboard["statusMix"] }) {
  const shades = ["bg-warning", "bg-primary", "bg-primary-light", "bg-surface-variant"];

  return (
    <div className="flex flex-col gap-4">
      {mix.map((s, i) => (
        <MeterRow key={s.label} label={`${s.label} · ${s.count}`} percent={s.percent} color={shades[i]} />
      ))}
    </div>
  );
}

export function RecentReviews({
  reviews,
  href,
}: {
  reviews: Dashboard["recentReviews"];
  href: string;
}) {
  if (!reviews.length) {
    return <p className="py-8 text-center text-sm text-muted">Одоогоор сэтгэгдэл алга.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border border-surface-tint p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">{r.authorName || "Хэрэглэгч"}</span>
            <span className="flex gap-0.5" aria-label={`${r.rating} од`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={
                    i < r.rating ? "size-3 fill-gold text-gold" : "size-3 text-surface-variant"
                  }
                />
              ))}
            </span>
          </div>
          {r.body && <p className="mt-2 text-xs leading-5 text-body">{r.body}</p>}
        </li>
      ))}
      <li>
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          Бүх сэтгэгдлийг харах
        </Link>
      </li>
    </ul>
  );
}

/**
 * Анхаарал шаардсан зүйлс. Дизайнд байсан "Үйлчилгээний эрэлт",
 * "Ажилтны үзүүлэлт" хоёрыг захиалга нь үйлчилгээ/ажилтныг заадаггүй тул
 * тооцох боломжгүй — оронд нь эзний хийх ёстой ажлыг гаргав.
 */
export function TodoPanel({
  todo,
  bookingsHref,
  reviewsHref,
}: {
  todo: Dashboard["todo"];
  bookingsHref: string;
  reviewsHref: string;
}) {
  const items = [
    {
      count: todo.pendingBookings,
      label: "захиалга баталгаажуулах хүлээж байна",
      href: `${bookingsHref}?status=pending`,
    },
    {
      count: todo.missingInvoices,
      label: "дууссан захиалгад нэхэмжлэх үүсгээгүй",
      href: `${bookingsHref}?status=completed`,
    },
    {
      count: todo.unansweredReviews,
      label: "сэтгэгдэл хариулаагүй",
      href: `${reviewsHref}?filter=unanswered`,
    },
  ].filter((i) => i.count > 0);

  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Бүх зүйл цэгцтэй байна. Хүлээгдэж буй ажил алга.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex items-center gap-3 rounded-xl bg-surface-tint px-4 py-3 transition-colors hover:bg-surface-variant"
          >
            <span className="text-lg leading-6 font-semibold tabular-nums text-primary">
              {item.count}
            </span>
            <span className="flex-1 text-sm leading-5 text-body">{item.label}</span>
            <ArrowRight className="size-4 shrink-0 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
