"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string } | null;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Үйлчилгээ, ажилтан хоёулаа хоёр панелд харагдана. */
function revalidateCatalog() {
  revalidatePath("/business/services");
  revalidatePath("/business/employees");
  revalidatePath("/artist/services");
}

/** Нэвтэрсэн хэрэглэгчийн бизнесийг олно — бүх үйлдэл үүгээр эхэлнэ. */
async function ownedBusiness() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." } as const;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { error: "Бизнесийн бүртгэл олдсонгүй." } as const;

  return { supabase, businessId: business.id } as const;
}

/**
 * Үйлчилгээ нэмэх/засах. `service_id` ирвэл засна, эс бөгөөс шинээр нэмнэ.
 *
 * Бичих эрхийг RLS-ийн `owns_business()` шалгана — энд зөвхөн утгуудыг
 * шалгаад дамжуулна.
 */
export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };
  const { supabase, businessId } = owner;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Үйлчилгээний нэрийг бөглөнө үү." };

  const price = Number(formData.get("price") ?? 0);
  const durationMin = Number(formData.get("duration_min") ?? 0);
  if (!Number.isFinite(price) || price < 0) return { error: "Үнэ буруу байна." };
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { error: "Үргэлжлэх хугацааг минутаар оруулна уу." };
  }

  const fields = {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    price: Math.round(price),
    duration_min: Math.round(durationMin),
    category: String(formData.get("category") ?? "").trim() || null,
    is_active: formData.get("is_active") !== null,
  };

  const id = String(formData.get("service_id") ?? "");

  if (id) {
    const { error } = await supabase
      .from("services")
      .update(fields)
      .eq("id", id)
      .eq("business_id", businessId);
    if (error) return { error: error.message };
  } else {
    // Шинэ мөрийг жагсаалтын төгсгөлд тавина.
    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    const { error } = await supabase
      .from("services")
      .insert({ ...fields, business_id: businessId, sort_order: count ?? 0 });
    if (error) return { error: error.message };
  }

  revalidateCatalog();
  return { success: id ? "Үйлчилгээг шинэчиллээ." : "Үйлчилгээ нэмэгдлээ." };
}

export async function deleteService(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };

  const id = String(formData.get("service_id") ?? "");
  if (!id) return { error: "Буруу хүсэлт." };

  const { error } = await owner.supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("business_id", owner.businessId);
  if (error) return { error: error.message };

  revalidateCatalog();
  return { success: "Үйлчилгээг устгалаа." };
}

/** Ажилтан нэмэх/засах. Зураг сонговол business-public bucket руу тавина. */
export async function saveStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };
  const { supabase, businessId } = owner;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ажилтны нэрийг бөглөнө үү." };

  const fields: Record<string, unknown> = {
    name,
    role: String(formData.get("role") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    is_active: formData.get("is_active") !== null,
  };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) return { error: "Зургийн хэмжээ 5MB-аас хэтэрсэн байна." };

    // Зам нь business id-аар эхлэх ёстой — storage-ийн бичих эрх үүгээр
    // шийдэгдэнэ (0001-ийн public_assets_write).
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${businessId}/staff-${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("business-public")
      .upload(path, photo, { contentType: photo.type || undefined });
    if (error) return { error: `Зураг: ${error.message}` };

    fields.photo_path = path;
  }

  const id = String(formData.get("staff_id") ?? "");

  if (id) {
    const { error } = await supabase
      .from("business_staff")
      .update(fields)
      .eq("id", id)
      .eq("business_id", businessId);
    if (error) return { error: error.message };
  } else {
    const { count } = await supabase
      .from("business_staff")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    const { error } = await supabase
      .from("business_staff")
      .insert({ ...fields, business_id: businessId, sort_order: count ?? 0 });
    if (error) return { error: error.message };
  }

  revalidateCatalog();
  return { success: id ? "Ажилтны мэдээллийг шинэчиллээ." : "Ажилтан нэмэгдлээ." };
}

export async function deleteStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };

  const id = String(formData.get("staff_id") ?? "");
  if (!id) return { error: "Буруу хүсэлт." };

  const { error } = await owner.supabase
    .from("business_staff")
    .delete()
    .eq("id", id)
    .eq("business_id", owner.businessId);
  if (error) return { error: error.message };

  revalidateCatalog();
  return { success: "Ажилтныг устгалаа." };
}
