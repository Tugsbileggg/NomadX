import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Одоо нэвтэрсэн (super_admin) хэрэглэгчийн нэр/и-мэйл — AdminShell-ийн толгойд. */
export async function getCurrentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { name: "Супер админ", email: "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return { name: profile?.full_name || "Супер админ", email: user.email ?? "" };
}

/** Хяналтын самбарын дээд статистикууд. */
export async function getPlatformCounts() {
  const supabase = await createClient();

  const [
    { count: customers },
    { count: artists },
    { count: salons },
    { count: pending },
    { count: approved },
    { count: rejected },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("type", "artist"),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("type", "salon"),
    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("bookings").select("id, scheduled_at, status"),
  ]);

  const todayKey = new Date().toDateString();
  const todayBookings = (bookings ?? []).filter(
    (b) => b.status !== "cancelled" && new Date(b.scheduled_at).toDateString() === todayKey,
  ).length;

  return {
    totalUsers: (customers ?? 0) + (artists ?? 0) + (salons ?? 0),
    totalArtists: artists ?? 0,
    totalSalons: salons ?? 0,
    todayBookings,
    pendingVerification: pending ?? 0,
    approvedBusinesses: approved ?? 0,
    rejectedBusinesses: rejected ?? 0,
  };
}

/** Бизнесүүдийн ангилалын тархалт (business_categories-ийн давтамжаар). */
export async function getCategoryBreakdown() {
  const supabase = await createClient();
  const { data } = await supabase.from("business_categories").select("category");

  const counts = new Map<string, number>();
  for (const c of data ?? []) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);

  const total = data?.length ?? 0;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, count]) => ({
      category,
      percent: total ? Math.round((count / total) * 100) : 0,
    }));
}

/** Захиалгын амжилттай/цуцлагдсан харьцаа. */
export async function getBookingSuccessRate() {
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("status");

  const total = data?.length ?? 0;
  const cancelled = (data ?? []).filter((b) => b.status === "cancelled").length;
  const successPercent = total ? Math.round(((total - cancelled) / total) * 100) : 0;

  return { total, cancelled, successPercent };
}

/** Хяналтын самбар дээрх "Баталгаажуулалт хүлээгдэж буй" жижиг жагсаалт. */
export async function getPendingVerifications(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, type, address, submitted_at")
    .in("status", ["submitted", "under_review"])
    .order("submitted_at", { ascending: true })
    .limit(limit);

  return data ?? [];
}

export type AdminUserRow = {
  id: string;
  fullName: string;
  phone: string | null;
  role: string;
  email: string;
  createdAt: string;
  bookingsCount: number;
  banned: boolean;
  emailConfirmed: boolean;
};

/**
 * profiles-ийг (RLS-ээр super_admin бүгдийг харна) auth.users-тэй
 * (и-мэйл, хориглосон эсэх) service role-оор нийлүүлнэ.
 */
export async function fetchAdminUsers(): Promise<{ rows: AdminUserRow[]; error?: string }> {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна." };

  const [{ data: profiles }, { data: bookings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("bookings").select("customer_id"),
  ]);

  const bookingCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookingCounts.set(b.customer_id, (bookingCounts.get(b.customer_id) ?? 0) + 1);
  }

  const authUsers = new Map<
    string,
    { email: string; banned: boolean; emailConfirmed: boolean }
  >();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return { rows: [], error: error.message };
    for (const u of data.users) {
      const bannedUntil = (u as { banned_until?: string }).banned_until;
      authUsers.set(u.id, {
        email: u.email ?? "",
        banned: !!bannedUntil && new Date(bannedUntil) > new Date(),
        emailConfirmed: !!u.email_confirmed_at,
      });
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name || "Нэргүй",
    phone: p.phone,
    role: p.role,
    email: authUsers.get(p.id)?.email ?? "",
    createdAt: p.created_at,
    bookingsCount: bookingCounts.get(p.id) ?? 0,
    banned: authUsers.get(p.id)?.banned ?? false,
    emailConfirmed: authUsers.get(p.id)?.emailConfirmed ?? false,
  }));

  return { rows };
}

export type AdminBusinessRow = {
  id: string;
  name: string;
  address: string | null;
  categories: string[];
  status: string;
  bookingsCount: number;
};

/** Салон эсвэл артист жагсаалт (Super Admin). */
export async function fetchAdminBusinesses(type: "salon" | "artist"): Promise<AdminBusinessRow[]> {
  const supabase = await createClient();

  const [{ data: businesses }, { data: categories }, { data: bookings }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, address, status")
      .eq("type", type)
      .order("created_at", { ascending: false }),
    supabase.from("business_categories").select("business_id, category"),
    supabase.from("bookings").select("business_id"),
  ]);

  const categoryMap = new Map<string, string[]>();
  for (const c of categories ?? []) {
    const list = categoryMap.get(c.business_id) ?? [];
    list.push(c.category);
    categoryMap.set(c.business_id, list);
  }

  const bookingCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookingCounts.set(b.business_id, (bookingCounts.get(b.business_id) ?? 0) + 1);
  }

  return (businesses ?? []).map((b) => ({
    id: b.id,
    name: b.name || "Нэргүй бүртгэл",
    address: b.address,
    categories: categoryMap.get(b.id) ?? [],
    status: b.status,
    bookingsCount: bookingCounts.get(b.id) ?? 0,
  }));
}

export type AdminBookingRow = {
  id: string;
  customerName: string;
  businessName: string;
  businessType: string;
  scheduledAt: string;
  status: string;
};

/** Платформ даяарх бүх захиалга (Super Admin). */
export async function fetchAdminBookings(): Promise<AdminBookingRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, scheduled_at, status, customer:profiles(full_name), business:businesses(name, type)",
    )
    .order("scheduled_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((b) => {
    const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer;
    const business = Array.isArray(b.business) ? b.business[0] : b.business;
    return {
      id: b.id,
      customerName: customer?.full_name || "Харилцагч",
      businessName: business?.name || "Устгагдсан бизнес",
      businessType: business?.type ?? "salon",
      scheduledAt: b.scheduled_at,
      status: b.status,
    };
  });
}
