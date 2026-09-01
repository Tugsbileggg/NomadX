import { createClient } from "@/lib/supabase/server";
import {
  BUCKET_BOOKING_REFS,
  type BookingStatus,
  type InvoiceStatus,
} from "@/lib/db-types";

/** Signed URL-ийн хугацаа (сек) — хуудас нэг харахад хангалттай. */
const SIGNED_URL_TTL = 60 * 60;

export type PanelBooking = {
  id: string;
  status: BookingStatus;
  scheduledAt: string;
  /** Үйлчлүүлэгчийн бичсэн тайлбар — юу хийлгэхийг заана. */
  note: string | null;
  createdAt: string;
  /** Бүртгэлтэй хэрэглэгч, эсвэл панелаас бүртгэсэн зочин (0019). */
  customer: { name: string; phone: string | null; isGuest: boolean } | null;
  /** Жишээ зургууд — bucket хувийн тул signed URL. */
  images: string[];
  /** ⚠️ Туршилтын нэхэмжлэх. Үүсээгүй бол null. */
  invoice: { id: string; amount: number; note: string | null; status: InvoiceStatus } | null;
};

export type BookingCounts = {
  total: number;
  today: number;
  pending: number;
};

export type PanelBookings = {
  bookings: PanelBooking[];
  counts: BookingCounts;
};

/**
 * Нэвтэрсэн эзний бизнес рүү ирсэн захиалгуудыг татна.
 *
 * RLS нь аль хэдийн бизнесийн эзнээр хязгаарладаг (0006) тул энд
 * business_id-гаар шүүх нь зөвхөн тодорхой байхын тулд. Үйлчлүүлэгчийн
 * профайл 0010-ийн дүрмээр, зураг 0009-ийн дүрмээр уншигдана.
 */
export async function fetchPanelBookings(status?: BookingStatus): Promise<PanelBookings> {
  const empty: PanelBookings = { bookings: [], counts: { total: 0, today: 0, pending: 0 } };

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

  let query = supabase
    .from("bookings")
    .select("id, status, scheduled_at, note, created_at, customer_id, guest_name, guest_phone")
    .eq("business_id", business.id)
    // Хамгийн сүүлд ИРСЭН нь дээрээ — аппын artist-bookings.ts-тэй ижил.
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: rows } = await query;
  if (!rows?.length) return { ...empty, counts: await countBookings(business.id) };

  // Зочны захиалгад customer_id байхгүй — профайл татах хэрэггүй.
  const customerIds = [...new Set(rows.map((r) => r.customer_id).filter((id) => id !== null))];
  const { data: profiles } = customerIds.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", customerIds)
    : { data: [] };

  const byCustomer = new Map((profiles ?? []).map((p) => [p.id, p]));

  const { data: images } = await supabase
    .from("booking_images")
    .select("booking_id, storage_path")
    .in(
      "booking_id",
      rows.map((r) => r.id),
    )
    .order("sort_order");

  const signed = await signPaths(supabase, (images ?? []).map((i) => i.storage_path));

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, booking_id, amount, note, status")
    .in(
      "booking_id",
      rows.map((r) => r.id),
    );

  const byInvoice = new Map((invoices ?? []).map((i) => [i.booking_id, i]));

  const byBooking = new Map<string, string[]>();
  for (const image of images ?? []) {
    const url = signed.get(image.storage_path);
    if (!url) continue;
    byBooking.set(image.booking_id, [...(byBooking.get(image.booking_id) ?? []), url]);
  }

  return {
    counts: await countBookings(business.id),
    bookings: rows.map((r) => {
      const p = r.customer_id ? byCustomer.get(r.customer_id) : null;
      return {
        id: r.id,
        status: r.status,
        scheduledAt: r.scheduled_at,
        note: r.note,
        createdAt: r.created_at,
        customer: p
          ? { name: p.full_name, phone: p.phone, isGuest: false }
          : r.guest_name
            ? { name: r.guest_name, phone: r.guest_phone, isGuest: true }
            : null,
        images: byBooking.get(r.id) ?? [],
        invoice: byInvoice.get(r.id) ?? null,
      };
    }),
  };
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function signPaths(supabase: ServerClient, paths: string[]) {
  const map = new Map<string, string>();
  if (!paths.length) return map;

  const { data } = await supabase.storage
    .from(BUCKET_BOOKING_REFS)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  for (const item of data ?? []) {
    // Аль нэг зам алдаа өгвөл signedUrl нь null ирдэг.
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}

async function countBookings(businessId: string): Promise<BookingCounts> {
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const base = () =>
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("business_id", businessId);

  const [total, today, pending] = await Promise.all([
    base(),
    base().gte("scheduled_at", startOfDay.toISOString()).lt("scheduled_at", endOfDay.toISOString()),
    base().eq("status", "pending"),
  ]);

  return {
    total: total.count ?? 0,
    today: today.count ?? 0,
    pending: pending.count ?? 0,
  };
}
