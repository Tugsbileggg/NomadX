"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeFile } from "@/lib/storage/store-file";
import { geocodeAddress } from "@/lib/geocode";

export type FormState = { error?: string; success?: string } | null;

/**
 * Баталгаажсан (approved) бизнес/артист өөрийн профайлаа засварлана.
 * Бүртгэлийн wizard-аас ялгаатай нь: алхам ахиулахгүй, redirect хийхгүй,
 * зөвхөн одоо байгаа мэдээллийг шинэчилнэ.
 */
export async function updateBusinessProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нэвтрээгүй байна." };

  const { data: business } = await supabase
    .from("businesses")
    .select("id, type, address")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return { error: "Бизнесийн бүртгэл олдсонгүй." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Нэрээ бөглөнө үү." };

  const address = String(formData.get("address") ?? "").trim() || null;
  // Хаяг өөрчлөгдсөн үед л дахин geocode хийнэ — Nominatim-ийг дэмий дуудахгүй.
  const coords = address && address !== business.address ? await geocodeAddress(address) : null;

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address,
      about: String(formData.get("about") ?? "").trim() || null,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
    .eq("id", business.id);
  if (error) return { error: error.message };

  const uploads: [FormDataEntryValue | null, "logo" | "cover"][] = [
    [formData.get("logo"), "logo"],
    [formData.get("cover"), "cover"],
  ];
  for (const [file, kind] of uploads) {
    const failed = await storeFile(supabase, business.id, file, kind);
    if (failed) return { error: failed };
  }

  revalidatePath(business.type === "artist" ? "/artist" : "/business", "layout");
  return { success: "Профайл амжилттай шинэчлэгдлээ." };
}
