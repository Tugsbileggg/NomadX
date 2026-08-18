import { supabase } from "@/lib/supabase"
import type { UserRole } from "@/lib/db-types"

export type MyProfile = {
  fullName: string
  phone: string | null
  role: UserRole
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) return null
  return { fullName: data.full_name, phone: data.phone, role: data.role }
}

export async function updateMyProfile(fullName: string, phone: string): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Нэвтрээгүй байна."

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim(), phone: phone.trim() || null })
    .eq("id", user.id)

  return error ? error.message : null
}
