import { createClient } from "@/lib/supabase/server";
import { publicAssetUrl } from "@/lib/storage/store-file";

export type CatalogService = {
  id: string;
  name: string;
  description: string | null;
  /** Төгрөгөөр, бүхэл тоо */
  price: number;
  durationMin: number;
  category: string | null;
  isActive: boolean;
};

export type CatalogStaff = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  isActive: boolean;
};

export type OwnerCatalog = {
  /** Бизнесийн бүртгэл олдоогүй бол null — маягтуудыг харуулах утгагүй. */
  businessId: string | null;
  services: CatalogService[];
  staff: CatalogStaff[];
};

/**
 * Нэвтэрсэн эзний үйлчилгээ болон ажилтнуудыг татна.
 *
 * Идэвхгүй болгосон мөрүүдийг ч оруулна — панел дээр эзэн өөрөө бүгдийг
 * хараад буцааж асаах боломжтой байх ёстой (аппад зөвхөн идэвхтэй нь очно).
 */
export async function fetchOwnerCatalog(): Promise<OwnerCatalog> {
  const empty: OwnerCatalog = { businessId: null, services: [], staff: [] };

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

  const [services, staff] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, price, duration_min, category, is_active")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("business_staff")
      .select("id, name, role, bio, photo_path, is_active")
      .eq("business_id", business.id)
      .order("sort_order"),
  ]);

  return {
    businessId: business.id,
    services: (services.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      durationMin: s.duration_min,
      category: s.category,
      isActive: s.is_active,
    })),
    staff: (staff.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      bio: m.bio,
      photoUrl: publicAssetUrl(supabase, m.photo_path),
      isActive: m.is_active,
    })),
  };
}
