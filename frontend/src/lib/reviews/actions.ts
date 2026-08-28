"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string } | null;

const MAX_REPLY = 1000;

/**
 * Сэтгэгдэлд хариу бичих / засах / устгах.
 *
 * `reply_to_review()` нь security definer — эзний эрхийг өөрөө шалгаад
 * зөвхөн reply/replied_at хоёрыг хөндөнө. RLS-ээр "эзэн мөрөө засаж
 * болно" гэж нээвэл тэр эзэн оноогоо ч өөрчилж чадах байсан.
 */
export async function replyToReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("review_id") ?? "");
  const body = String(formData.get("reply") ?? "").trim();

  if (!id) return { error: "Буруу хүсэлт." };
  if (body.length > MAX_REPLY) {
    return { error: `Хариу ${MAX_REPLY} тэмдэгтээс урт байж болохгүй.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reply_to_review", { rid: id, body });
  if (error) return { error: error.message };

  revalidatePath("/business/reviews");
  revalidatePath("/artist/reviews");
  return { success: body ? "Хариуг хадгаллаа." : "Хариуг устгалаа." };
}
