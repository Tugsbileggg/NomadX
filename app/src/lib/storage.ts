import { supabase } from "@/lib/supabase"

/**
 * business-public bucket доторх замыг нийтэд харагдах URL болгоно.
 *
 * Бүтэн http(s) хаягийг хэвээр буцаана — demo seed нь галерейн зургаа
 * гадны URL-аар дүүргэдэг тул (бодит хэрэглээнд bucket доторх зам байна).
 */
export function publicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return supabase.storage.from("business-public").getPublicUrl(path).data.publicUrl
}
