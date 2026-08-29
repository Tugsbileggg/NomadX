"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string } | null;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Хуваарийг харуулдаг замууд — цаг өөрчлөгдвөл захиалгын дүрэм ч өөрчлөгдөнө. */
const PATHS = ["/business/availability", "/artist/availability"];

/**
 * Долоо хоногийн ажлын цаг болон цагийн нүдний тохиргоог хадгална.
 *
 * `business_hours` нь (business_id, weekday) түлхүүртэй тул upsert-ээр
 * 7 мөрийг нэг дор бичнэ — устгаад дахин оруулбал алдаа гарсан үед
 * хуваарь бүрмөсөн алга болох эрсдэлтэй.
 */
export async function saveSchedule(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { error: "Бизнесийн бүртгэл олдсонгүй." };

  const slotMinutes = Number(formData.get("slot_minutes"));
  const slotCapacity = Number(formData.get("slot_capacity"));

  if (![15, 30, 45, 60, 90, 120].includes(slotMinutes)) {
    return { error: "Цагийн нүдний уртыг жагсаалтаас сонгоно уу." };
  }
  if (!Number.isInteger(slotCapacity) || slotCapacity < 1 || slotCapacity > 50) {
    return { error: "Зэрэг үйлчлэх тоо 1-50 хооронд байна." };
  }

  const rows = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const isClosed = formData.get(`closed_${weekday}`) === "on";
    const open = String(formData.get(`open_${weekday}`) ?? "");
    const close = String(formData.get(`close_${weekday}`) ?? "");

    if (isClosed) {
      // Амарч байгаа өдрийн цагийг хадгалж үлдээнэ — дараа нээхэд дахин
      // бөглөх шаардлагагүй болно.
      rows.push({
        business_id: business.id,
        weekday,
        open_time: TIME_RE.test(open) ? open : null,
        close_time: TIME_RE.test(close) ? close : null,
        is_closed: true,
      });
      continue;
    }

    if (!TIME_RE.test(open) || !TIME_RE.test(close)) {
      return { error: `${weekday + 1} дэх өдрийн цагийг бүрэн оруулна уу.` };
    }
    if (open >= close) {
      return { error: `${weekday + 1} дэх өдрийн хаах цаг нээх цагаас хойш байна.` };
    }

    rows.push({
      business_id: business.id,
      weekday,
      open_time: open,
      close_time: close,
      is_closed: false,
    });
  }

  const { error: hoursError } = await supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "business_id,weekday" });
  if (hoursError) return { error: hoursError.message };

  const { error: bizError } = await supabase
    .from("businesses")
    .update({ slot_minutes: slotMinutes, slot_capacity: slotCapacity })
    .eq("id", business.id);
  if (bizError) return { error: bizError.message };

  for (const path of PATHS) revalidatePath(path);
  return { success: "Хуваарийг хадгаллаа." };
}
