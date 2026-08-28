import { createClient } from "@/lib/supabase/server";

/** Энэ хугацаанд захиалгагүй бол "идэвхгүй" гэж үзнэ. */
const INACTIVE_DAYS = 90;

/** Хоёроос дээш захиалгатай бол "тогтмол". */
const REGULAR_MIN = 2;

export type PanelCustomer = {
  id: string;
  name: string;
  phone: string | null;
  bookings: number;
  completed: number;
  /** Цуцлагдаагүй нэхэмжлэхийн нийлбэр, төгрөгөөр. */
  invoiced: number;
  /** Хамгийн сүүлийн захиалгын огноо. */
  lastVisit: string;
  /** Тухайн үйлчлүүлэгчийн үлдээсэн оноо — байхгүй бол null. */
  rating: number | null;
  isNew: boolean;
  isRegular: boolean;
  isInactive: boolean;
};

export type CustomerStats = {
  total: number;
  newThisMonth: number;
  /** Дахин ирсэн хувь (2+ захиалгатай). */
  returningPct: number;
};

export type PanelCustomers = {
  customers: PanelCustomer[];
  stats: CustomerStats;
};

export type CustomerFilter = "new" | "regular" | "inactive" | null;

/**
 * Захиалгын түүхээс харилцагчийн жагсаалтыг гаргана.
 *
 * Тусдаа "customers" хүснэгт байхгүй — харилцагч гэдэг нь зүгээр л энэ
 * бизнест захиалга өгсөн хүн. Тоонуудыг JS дээр нэгтгэж байгаа нь одоогийн
 * хэмжээнд хангалттай; олон мянган захиалга болвол SQL view болгоно.
 */
export async function fetchPanelCustomers(filter: CustomerFilter): Promise<PanelCustomers> {
  const empty: PanelCustomers = {
    customers: [],
    stats: { total: 0, newThisMonth: 0, returningPct: 0 },
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, customer_id, status, scheduled_at")
    .eq("business_id", business.id);

  if (!bookings?.length) return empty;

  const customerIds = [...new Set(bookings.map((b) => b.customer_id))];

  const [{ data: profiles }, { data: invoices }, { data: reviews }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone").in("id", customerIds),
    supabase
      .from("invoices")
      .select("booking_id, amount, status")
      .in(
        "booking_id",
        bookings.map((b) => b.id),
      ),
    supabase
      .from("reviews")
      .select("author_id, rating")
      .eq("business_id", business.id)
      .in("author_id", customerIds),
  ]);

  const byProfile = new Map((profiles ?? []).map((p) => [p.id, p]));
  const byRating = new Map((reviews ?? []).map((r) => [r.author_id, r.rating]));

  // Нэхэмжлэхийг захиалгаар нь харилцагч руу буулгана.
  const bookingOwner = new Map(bookings.map((b) => [b.id, b.customer_id]));
  const invoicedBy = new Map<string, number>();
  for (const invoice of invoices ?? []) {
    if (invoice.status === "cancelled") continue;
    const owner = bookingOwner.get(invoice.booking_id);
    if (!owner) continue;
    invoicedBy.set(owner, (invoicedBy.get(owner) ?? 0) + invoice.amount);
  }

  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const all: PanelCustomer[] = customerIds.map((id) => {
    const mine = bookings.filter((b) => b.customer_id === id);
    const times = mine.map((b) => new Date(b.scheduled_at).getTime());
    const lastVisit = Math.max(...times);
    const firstVisit = Math.min(...times);
    const profile = byProfile.get(id);

    return {
      id,
      name: profile?.full_name?.trim() || "Нэргүй хэрэглэгч",
      phone: profile?.phone ?? null,
      bookings: mine.length,
      completed: mine.filter((b) => b.status === "completed").length,
      invoiced: invoicedBy.get(id) ?? 0,
      lastVisit: new Date(lastVisit).toISOString(),
      rating: byRating.get(id) ?? null,
      isNew: firstVisit >= monthStart.getTime(),
      isRegular: mine.length >= REGULAR_MIN,
      isInactive: now - lastVisit > INACTIVE_DAYS * 86_400_000,
    };
  });

  all.sort((a, b) => Date.parse(b.lastVisit) - Date.parse(a.lastVisit));

  const returning = all.filter((c) => c.isRegular).length;

  return {
    stats: {
      total: all.length,
      newThisMonth: all.filter((c) => c.isNew).length,
      returningPct: all.length ? Math.round((returning / all.length) * 100) : 0,
    },
    customers: all.filter((c) => {
      if (filter === "new") return c.isNew;
      if (filter === "regular") return c.isRegular;
      if (filter === "inactive") return c.isInactive;
      return true;
    }),
  };
}
