"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";

import { Monogram } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { replyToReview } from "@/lib/reviews/actions";
import type { PanelReview, ReviewSummary } from "@/lib/reviews/queries";
import { cn } from "@/lib/cn";

const TABS: { label: string; value: string | null }[] = [
  { label: "Бүгд", value: null },
  { label: "5 од", value: "5" },
  { label: "4 од", value: "4" },
  { label: "3 од болон доош", value: "low" },
  { label: "Хариулаагүй", value: "unanswered" },
];

export function ReviewTabs({ basePath, active }: { basePath: string; active: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const on = t.value === active;
        return (
          <Link
            key={t.label}
            href={t.value ? `${basePath}?filter=${t.value}` : basePath}
            className={cn(
              "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
              on
                ? "bg-primary text-white"
                : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

/** Дундаж оноо, нийт тоо, одны тархалт. */
export function ReviewSummaryPanel({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1">
        <p className="text-5xl leading-none font-semibold text-ink tabular-nums">
          {summary.average?.toFixed(1) ?? "—"}
          <span className="text-lg text-muted"> / 5</span>
        </p>
        <p className="mt-2 text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
          Нийт {summary.total} сэтгэгдэл
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {summary.breakdown.map((b) => (
          <li key={b.stars} className="flex items-center gap-3">
            <span className="flex w-6 items-center gap-1 text-xs text-body">
              {b.stars}
              <Star className="size-3 fill-gold text-gold" />
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tint">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: summary.total ? `${(b.count / summary.total) * 100}%` : "0%" }}
              />
            </span>
            <span className="w-10 text-right text-xs tabular-nums text-muted">{b.count}</span>
          </li>
        ))}
      </ul>

      {summary.unanswered > 0 && (
        <p className="rounded-xl bg-surface-tint px-4 py-3 text-sm text-body">
          <span className="font-medium text-ink">{summary.unanswered}</span> сэтгэгдэл
          хариулах хүлээж байна.
        </p>
      )}
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: PanelReview[] }) {
  if (!reviews.length) {
    return (
      <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
        Энэ шүүлтэд тохирох сэтгэгдэл алга.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PanelReview }) {
  const [editing, setEditing] = useState(false);

  // Хадгалсны дараа server component дахин зурагдаж шинэ `reply` ирдэг ч
  // `editing` нь клиент талын төлөв тул үлдэж, бичсэн хариу нь харагдахгүй
  // байдаг. Prop өөрчлөгдсөнийг мэдээд маягтыг хаана.
  const [lastReply, setLastReply] = useState(review.reply);
  if (lastReply !== review.reply) {
    setLastReply(review.reply);
    setEditing(false);
  }

  return (
    <article className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline">
      <div className="flex items-center gap-3">
        <Monogram name={review.authorName || "Хэрэглэгч"} />
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">
            {review.authorName || "Хэрэглэгч"}
            <span className="ml-2 text-xs font-normal text-muted">
              • {timeAgo(review.createdAt)}
            </span>
          </p>
          <Stars value={review.rating} />
        </div>
      </div>

      {review.body && <p className="mt-4 text-sm leading-6 text-body">{review.body}</p>}

      {review.reply && !editing && (
        <div className="mt-4 rounded-xl bg-surface-page p-4">
          <p className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
            Таны хариу{review.repliedAt && ` • ${timeAgo(review.repliedAt)}`}
          </p>
          <p className="mt-2 text-sm leading-6 text-body">{review.reply}</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Хариуг засах
          </button>
        </div>
      )}

      {!review.reply && !editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-4 h-9 rounded-full border border-outline bg-white px-4 text-xs font-medium text-primary hover:bg-surface-tint"
        >
          Хариулах
        </button>
      )}

      {editing && (
        <ActionForm action={replyToReview} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="review_id" value={review.id} />
          <textarea
            name="reply"
            rows={3}
            defaultValue={review.reply ?? ""}
            placeholder="Үйлчлүүлэгчид эелдэг, тодорхой хариу бичнэ үү."
            className="w-full rounded-xl bg-surface-tint px-4 py-3 text-sm leading-6 text-ink focus:outline-2 focus:outline-primary"
          />
          <div className="flex flex-wrap gap-3">
            <SubmitButton
              className="h-9 rounded-full bg-primary px-5 text-xs font-medium text-white hover:bg-primary-dark"
              pendingLabel="Хадгалж байна..."
            >
              Хариуг хадгалах
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-9 rounded-full border border-surface-variant bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint"
            >
              Болих
            </button>
            {review.reply && (
              <p className="self-center text-xs text-muted">
                Хоосон болгож хадгалвал хариу устана.
              </p>
            )}
          </div>
        </ActionForm>
      )}
    </article>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="mt-1 flex gap-0.5" aria-label={`${value} од`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < value ? "size-3 fill-gold text-gold" : "size-3 text-surface-variant"}
        />
      ))}
    </span>
  );
}

/** "3 хоногийн өмнө" — mn-MN locale энэ орчинд бүрэн дэмжигдэхгүй. */
function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "саяхан";
  if (minutes < 60) return `${minutes} минутын өмнө`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "өчигдөр";
  if (days < 7) return `${days} хоногийн өмнө`;
  if (days < 31) return `${Math.floor(days / 7)} долоо хоногийн өмнө`;
  if (days < 365) return `${Math.floor(days / 30)} сарын өмнө`;
  return `${Math.floor(days / 365)} жилийн өмнө`;
}
