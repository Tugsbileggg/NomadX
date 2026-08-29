import { createClient } from "@/lib/supabase/server";

/** Хугацааны сонголт — хаягийн `?range=` параметрээр ирнэ. */
export const RANGES = ["week", "month", "year"] as const;
export type Range = (typeof RANGES)[number];

export const RANGE_LABEL: Record<Range, string> = {
  week: "Долоо хоног",
  month: "Сар",
  year: "Жил",
};

const WEEKDAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const MONTHS = [
  "1 сар", "2 сар", "3 сар", "4 сар", "5 сар", "6 сар",
  "7 сар", "8 сар", "9 сар", "10 сар", "11 сар", "12 сар",
];

export type Analytics = {
  hasBusiness: boolean;
  range: Range;
  stats: {
    /** ⚠️ Туршилтын нэхэмжлэхийн нийлбэр — бодит төлбөр биш. */
    invoiced: number;
    bookings: number;
    completed: number;
    rating: number | null;
    reviewCount: number;
    customers: number;
    /** Хоёр ба түүнээс дээш удаа үйлчлүүлсэн харилцагчийн хувь. */
    returningPct: number;
  };
  /** Хугацааны хэсэг тус бүрийн нэхэмжилсэн дүн. */
  trend: { label: string; value: number }[];
  /** Гарагаар ачаалал — аль өдөр завгүй байдгийг харуулна. */
  weekdayLoad: { label: string; count: number; percent: number }[];
};

const EMPTY: Analytics = {
  hasBusiness: false,
  range: "month",
  stats: {
    invoiced: 0, bookings: 0, completed: 0,
    rating: null, reviewCount: 0, customers: 0, returningPct: 0,
  },
  trend: [],
  weekdayLoad: [],
};

/** Хаягаас ирсэн утгыг шууд итгэлгүй — жагсаалтад байгаа эсэхийг шалгана. */
export function parseRange(value?: string): Range {
  return RANGES.includes(value as Range) ? (value as Range) : "month";
}

/** Сонгосон хугацааны эхлэл болон графикийн хэсгүүд. */
function buildBuckets(range: Range) {
  const now = new Date();
  const buckets: { label: string; from: Date; to: Date }[] = [];

  if (range === "week") {
    // Сүүлийн 7 хоног, өдрөөр.
    for (let i = 6; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      buckets.push({ label: WEEKDAYS[(from.getDay() + 6) % 7].slice(0, 2), from, to });
    }
  } else if (range === "month") {
    // Сүүлийн 4 долоо хоног.
    for (let i = 3; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7 - 6);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      buckets.push({ label: `${4 - i}-р долоо`, from, to });
    }
  } else {
    // Сүүлийн 12 сар.
    for (let i = 11; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      buckets.push({ label: MONTHS[from.getMonth()], from, to });
    }
  }

  return buckets;
}

/**
 * Артистын панелийн "Мэдээлэл" хуудасны бүх тоо.
 *
 * Дизайнд байсан "Үйлчилгээний эрэлт"-ийг гаргах боломжгүй: захиалга нь
 * `service_id`-г заадаггүй (үйлчлүүлэгч хүслээ чөлөөтэй бичдэг урсгал).
 * Түүний оронд гарагаар ачаалал — хуваарь тохируулахад бодитоор
 * хэрэгтэй бөгөөд одоо байгаа өгөгдлөөс шууд тооцогдоно.
 */
export async function fetchAnalytics(range: Range): Promise<Analytics> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...EMPTY, range };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { ...EMPTY, range };

  const buckets = buildBuckets(range);
  const from = buckets[0].from;

  const [{ data: bookings }, { data: invoices }, { data: rating }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, customer_id, status, scheduled_at")
      .eq("business_id", business.id)
      .gte("scheduled_at", from.toISOString()),
    supabase
      .from("invoices")
      .select("amount, status, created_at")
      .eq("business_id", business.id)
      .gte("created_at", from.toISOString()),
    supabase
      .from("business_ratings")
      .select("rating, review_count")
      .eq("business_id", business.id)
      .maybeSingle(),
  ]);

  const rows = bookings ?? [];
  const active = rows.filter((b) => b.status !== "cancelled");

  // Цуцлагдсан нэхэмжлэх орлогод тооцогдохгүй.
  const paid = (invoices ?? []).filter((i) => i.status !== "cancelled");

  const perCustomer = new Map<string, number>();
  for (const b of active) {
    // Зочны захиалгад customer_id байхгүй (0019) — дахин ирэлт тооцох
    // таних тэмдэггүй тул хасна.
    if (b.status !== "completed" || !b.customer_id) continue;
    perCustomer.set(b.customer_id, (perCustomer.get(b.customer_id) ?? 0) + 1);
  }
  const returning = [...perCustomer.values()].filter((n) => n > 1).length;

  const trend = buckets.map((bucket) => ({
    label: bucket.label,
    value: paid
      .filter((i) => {
        const at = new Date(i.created_at);
        return at >= bucket.from && at < bucket.to;
      })
      .reduce((sum, i) => sum + i.amount, 0),
  }));

  const perWeekday = new Array(7).fill(0);
  for (const b of active) {
    // JS дээр 0 = Ням, харин хүснэгтэд Даваагаас эхэлж харуулна.
    perWeekday[(new Date(b.scheduled_at).getDay() + 6) % 7] += 1;
  }
  const busiest = Math.max(...perWeekday, 1);

  return {
    hasBusiness: true,
    range,
    stats: {
      invoiced: paid.reduce((sum, i) => sum + i.amount, 0),
      bookings: active.length,
      completed: active.filter((b) => b.status === "completed").length,
      rating: rating?.rating ?? null,
      reviewCount: rating?.review_count ?? 0,
      customers: perCustomer.size,
      returningPct: perCustomer.size ? Math.round((returning / perCustomer.size) * 100) : 0,
    },
    trend,
    weekdayLoad: WEEKDAYS.map((label, i) => ({
      label,
      count: perWeekday[i],
      percent: Math.round((perWeekday[i] / busiest) * 100),
    })),
  };
}
