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
  revalidatePath("/business/gallery");
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

/** Нэг удаад оруулах зургийн дээд тоо — олон файлыг зэрэг илгээхэд. */
const MAX_MEDIA_PER_UPLOAD = 8;

/**
 * Галерейд зураг нэмнэ. Олон файлыг нэг дор сонгож болно.
 *
 * Зам нь business id-аар эхлэх ёстой — `business-public` bucket-ийн бичих
 * эрх (0001-ийн `public_assets_write`) үүгээр шийдэгдэнэ.
 */
export async function uploadMedia(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };
  const { supabase, businessId } = owner;

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!files.length) return { error: "Зураг сонгоно уу." };
  if (files.length > MAX_MEDIA_PER_UPLOAD) {
    return { error: `Нэг удаад дээд тал нь ${MAX_MEDIA_PER_UPLOAD} зураг оруулна.` };
  }

  const oversized = files.find((f) => f.size > MAX_PHOTO_BYTES);
  if (oversized) return { error: `${oversized.name}: хэмжээ 5MB-аас хэтэрсэн байна.` };

  const notImage = files.find((f) => !f.type.startsWith("image/"));
  if (notImage) return { error: `${notImage.name}: зөвхөн зураг оруулна.` };

  const caption = String(formData.get("caption") ?? "").trim() || null;

  const { count } = await supabase
    .from("business_media")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  const rows = [];
  for (const [i, file] of files.entries()) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${businessId}/media-${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("business-public")
      .upload(path, file, { contentType: file.type || undefined });
    if (error) return { error: `${file.name}: ${error.message}` };

    rows.push({
      business_id: businessId,
      storage_path: path,
      // Тайлбарыг зөвхөн эхний зурагт — олон зурагт нэг тайлбар давтагдах нь утгагүй.
      caption: i === 0 ? caption : null,
      sort_order: (count ?? 0) + i,
    });
  }

  const { error } = await supabase.from("business_media").insert(rows);
  if (error) return { error: error.message };

  revalidateCatalog();
  return { success: `${rows.length} зураг нэмэгдлээ.` };
}

/**
 * Галерейн зургийг устгана.
 *
 * Мөрийг устгаад bucket доторх файлыг ч арилгана (0016-ийн delete policy).
 * Файлыг арилгаж чадаагүй ч мөр нь устсан бол хэрэглэгчид амжилттай гэж
 * харуулна — галерейд харагдахаа больсон нь гол зорилго, орхигдсон файл нь
 * нийтэд нээлттэй боловч хаяг нь хаана ч холбоогүй үлдэнэ.
 */
export async function deleteMedia(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await ownedBusiness();
  if ("error" in owner) return { error: owner.error };
  const { supabase, businessId } = owner;

  const id = String(formData.get("media_id") ?? "");
  if (!id) return { error: "Буруу хүсэлт." };

  const { data: row } = await supabase
    .from("business_media")
    .select("storage_path")
    .eq("id", id)
    .eq("business_id", businessId)
    .maybeSingle();

  const { error } = await supabase
    .from("business_media")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);
  if (error) return { error: error.message };

  // Seed-ийн бүтэн URL-ууд bucket-д байдаггүй тул зөвхөн дотоод замыг арилгана.
  if (row?.storage_path && !row.storage_path.startsWith("http")) {
    await supabase.storage.from("business-public").remove([row.storage_path]);
  }

  revalidateCatalog();
  return { success: "Зургийг устгалаа." };
}
