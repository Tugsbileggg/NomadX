import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/db-types";

/** Графикт харуулах хоногийн тоо. */
const TREND_DAYS = 7;

const WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

export type Dashboard = {
  hasBusiness: boolean;
  stats: {
    /** Цуцлагдаагүй нэхэмжлэхийн нийлбэр, төгрөгөөр. */
    invoiced: number;
    bookings: number;
    rating: number | null;
    reviewCount: number;
    customers: number;
    returningPct: number;
  };
  /** Сүүлийн 7 хоногийн захиалгын тоо. */
  trend: { label: string; value: number }[];
  statusMix: { label: string; count: number; percent: number }[];
  recentReviews: { id: string; authorName: string; rating: number; body: string | null }[];
  /** Эзний анхаарал шаардсан зүйлс. */
  todo: {
    pendingBookings: number;
    unansweredReviews: number;
    /** Дууссан ч нэхэмжлэх үүсгээгүй захиалга. */
    missingInvoices: number;
  };
};

const EMPTY: Dashboard = {
  hasBusiness: false,
  stats: { invoiced: 0, bookings: 0, rating: null, reviewCount: 0, customers: 0, returningPct: 0 },
  trend: [],
  statusMix: [],
  recentReviews: [],
  todo: { pendingBookings: 0, unansweredReviews: 0, missingInvoices: 0 },
};

/**
 * Хяналтын самбарын бүх тоог нэг дуудлагаар.
 *
 * Дизайнд байсан "Үйлчилгээний эрэлт", "Ажилтны үзүүлэлт" хоёрыг гаргах
 * боломжгүй: захиалга нь `service_id`, `staff_id` аль алийг нь заадаггүй
 * (үйлчлүүлэгч хүслээ чөлөөтэй бичдэг урсгал). Тэдгээрийн оронд бодитоор
 * тооцогдох захиалгын төлвийн харьцаа болон анхаарал шаардсан зүйлсийг
 * харуулна.
 */
export async function fetchDashboard(): Promise<Dashboard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return EMPTY;

  const [{ data: bookings }, { data: reviews }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, customer_id, status, scheduled_at")
      .eq("business_id", business.id),
    supabase
      .from("reviews")
      .select("id, author_name, rating, body, reply, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = bookings ?? [];

  const { data: invoices } = rows.length
    ? await supabase
        .from("invoices")
        .select("booking_id, amount, status")
        .in(
          "booking_id",
          rows.map((b) => b.id),
        )
    : { data: [] };

  const live = (invoices ?? []).filter((i) => i.status !== "cancelled");
  const invoiced = live.reduce((sum, i) => sum + i.amount, 0);

  // Нэхэмжлэхтэй захиалгуудыг тэмдэглээд дутууг нь тоолно.
  const invoicedBookings = new Set((invoices ?? []).map((i) => i.booking_id));

  const byCustomer = new Map<string, number>();
  // Зочны захиалгад customer_id байхгүй (0019) — давтан ирэлт тооцогдохгүй.
  for (const b of rows) {
    if (!b.customer_id) continue;
    byCustomer.set(b.customer_id, (byCustomer.get(b.customer_id) ?? 0) + 1);
  }
  const returning = [...byCustomer.values()].filter((n) => n >= 2).length;

  const ratings = (reviews ?? []).map((r) => r.rating);

  return {
    hasBusiness: true,
    stats: {
      invoiced,
      bookings: rows.length,
      rating: ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null,
      reviewCount: ratings.length,
      customers: byCustomer.size,
      returningPct: byCustomer.size ? Math.round((returning / byCustomer.size) * 100) : 0,
    },
    trend: buildTrend(rows),
    statusMix: buildStatusMix(rows),
    recentReviews: (reviews ?? []).slice(0, 3).map((r) => ({
      id: r.id,
      authorName: r.author_name,
      rating: r.rating,
      body: r.body,
    })),
    todo: {
      pendingBookings: rows.filter((b) => b.status === "pending").length,
      unansweredReviews: (reviews ?? []).filter((r) => !r.reply).length,
      missingInvoices: rows.filter(
        (b) => b.status === "completed" && !invoicedBookings.has(b.id),
      ).length,
    },
  };
}

/** Өнөөдрөөр төгссөн сүүлийн 7 хоногийн захиалгын тоо. */
function buildTrend(rows: { scheduled_at: string }[]) {
  const days: { label: string; value: number }[] = [];

  for (let back = TREND_DAYS - 1; back >= 0; back--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - back);

    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    days.push({
      label: WEEKDAYS[day.getDay()],
      value: rows.filter((r) => {
        const t = Date.parse(r.scheduled_at);
        return t >= day.getTime() && t < next.getTime();
      }).length,
    });
  }

  return days;
}

function buildStatusMix(rows: { status: BookingStatus }[]) {
  const order: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

  return order.map((status) => {
    const count = rows.filter((r) => r.status === status).length;
    return {
      label: STATUS_LABEL[status],
      count,
      percent: rows.length ? Math.round((count / rows.length) * 100) : 0,
    };
  });
}
