import { supabase } from "@/lib/supabase"

/** business-public bucket доторх замыг нийтэд харагдах URL болгоно. */
export function publicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return supabase.storage.from("business-public").getPublicUrl(path).data.publicUrl
}
