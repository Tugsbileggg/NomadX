import { createClient } from "@/lib/supabase/server";

export type PanelReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  createdAt: string;
  reply: string | null;
  repliedAt: string | null;
};

export type ReviewSummary = {
  /** Сэтгэгдэл огт байхгүй бол null. */
  average: number | null;
  total: number;
  /** 5..1 од тус бүрийн тоо. */
  breakdown: { stars: number; count: number }[];
  unanswered: number;
};

export type PanelReviews = {
  reviews: PanelReview[];
  summary: ReviewSummary;
};

/** Хаягаас ирэх шүүлтүүд. */
export type ReviewFilter = "5" | "4" | "low" | "unanswered" | null;

/**
 * Эзний бизнест ирсэн сэтгэгдлүүд.
 *
 * Хураангуйг бүх мөрөөс тооцно (шүүлт нь зөвхөн жагсаалтад үйлчилнэ) —
 * "5 од" гэж шүүсэн үед дундаж оноо 5.0 болж хуурах ёсгүй.
 */
export async function fetchPanelReviews(filter: ReviewFilter): Promise<PanelReviews> {
  const empty: PanelReviews = {
    reviews: [],
    summary: { average: null, total: 0, breakdown: stars().map((s) => ({ stars: s, count: 0 })), unanswered: 0 },
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return empty;

  const { data: rows } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, created_at, reply, replied_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (!rows?.length) return empty;

  const summary: ReviewSummary = {
    average: Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length) * 10) / 10,
    total: rows.length,
    breakdown: stars().map((s) => ({ stars: s, count: rows.filter((r) => r.rating === s).length })),
    unanswered: rows.filter((r) => !r.reply).length,
  };

  const visible = rows.filter((r) => {
    if (filter === "5") return r.rating === 5;
    if (filter === "4") return r.rating === 4;
    if (filter === "low") return r.rating <= 3;
    if (filter === "unanswered") return !r.reply;
    return true;
  });

  return {
    summary,
    reviews: visible.map((r) => ({
      id: r.id,
      authorName: r.author_name,
      rating: r.rating,
      body: r.body,
      createdAt: r.created_at,
      reply: r.reply,
      repliedAt: r.replied_at,
    })),
  };
}

function stars() {
  return [5, 4, 3, 2, 1];
}
