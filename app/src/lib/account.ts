import { supabase } from "@/lib/supabase"
import type { BusinessStatus, UserRole } from "@/lib/db-types"

/**
 * Нэвтэрсэн хэрэглэгчийн эрх болон бизнесийн төлөв.
 *
 * Апп нь одоог хүртэл role-ыг огт мэддэггүй байсан — нэвтэрсэн хүн бүр
 * харилцагчийн tab руу ордог байв. Артистууд аппаар бүртгүүлж, ажлаа
 * аппаас удирддаг болсноор энэ мэдээлэл чиглүүлэлтийн үндэс болно.
 */

export type Account = {
  role: UserRole
  /** Артист/салонд бизнесийн бүртгэл — үүсгээгүй бол null. */
  business: {
    id: string
    status: BusinessStatus
    /** Бүртгэлийн wizard хаана зогссоныг заана (1..5). */
    currentStep: number
    name: string | null
  } | null
}

/**
 * Профайл болон бизнесийг нэг дор татна.
 *
 * Хэрэглэгч байхгүй (гарсан) бол null. Профайл олдоогүй бол ч null —
 * `handle_new_user` триггер бүртгүүлэх үед мөр үүсгэдэг тул энэ нь зөвхөн
 * сүлжээний алдааны үед тохиолдоно, тэр үед чиглүүлэхгүй хүлээх нь зөв.
 */
export async function fetchAccount(): Promise<Account | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (!profile) return null

  // Харилцагчид бизнес байхгүй тул нэмэлт асуулга шаардлагагүй.
  if (profile.role === "customer") {
    return { role: profile.role, business: null }
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, status, current_step, name")
    .eq("owner_id", user.id)
    .maybeSingle()

  return {
    role: profile.role,
    business: business
      ? {
          id: business.id,
          status: business.status,
          currentStep: business.current_step,
          name: business.name,
        }
      : null,
  }
}
