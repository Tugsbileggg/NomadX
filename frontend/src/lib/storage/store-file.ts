import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BYTES = 5 * 1024 * 1024;
const PUBLIC_KINDS = new Set(["logo", "cover"]);

/**
 * Файлыг storage-д тавиад documents-д мөр нэмнэ, лого/ковер бол
 * businesses.logo_path/cover_path-ыг ч шинэчилнэ. Алдааны текст буцаана.
 */
export async function storeFile(
  supabase: SupabaseClient,
  businessId: string,
  file: FormDataEntryValue | null,
  kind: string,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) return `${file.name}: хэмжээ 5MB-аас хэтэрсэн байна.`;

  const bucket = PUBLIC_KINDS.has(kind) ? "business-public" : "business-docs";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${businessId}/${kind}-${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) return `${file.name}: ${error.message}`;

  // Нэг төрөлд нэг файл — хуучныг сольж бичнэ.
  await supabase.from("documents").delete().eq("business_id", businessId).eq("kind", kind);
  await supabase.from("documents").insert({
    business_id: businessId,
    kind,
    storage_path: path,
    mime: file.type || null,
    size_bytes: file.size,
  });

  if (kind === "logo" || kind === "cover") {
    await supabase
      .from("businesses")
      .update({ [`${kind}_path`]: path })
      .eq("id", businessId);
  }

  return null;
}

/** business-public bucket доторх замыг нийтэд харагдах URL болгоно. */
export function publicAssetUrl(supabase: SupabaseClient, path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from("business-public").getPublicUrl(path).data.publicUrl;
}
