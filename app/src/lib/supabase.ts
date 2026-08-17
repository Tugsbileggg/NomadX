import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import "react-native-url-polyfill/auto"

import type { Database } from "@/lib/db-types"

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL болон EXPO_PUBLIC_SUPABASE_ANON_KEY тохируулаагүй байна (.env харна уу)"
  )
}

/**
 * Веб дээр expo-router dev/build серверүүд route бүрийг Node орчинд SSR хийдэг тул
 * (window байхгүй) AsyncStorage шууд дуудвал "window is not defined" алдаагаар унана.
 * Тиймээс серверт хоосон no-op storage, клиент дээр жинхэнэ AsyncStorage ашиглана.
 */
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
}

/**
 * Гар утасны client — frontend-тэй ижил Supabase project руу холбогдоно.
 * Сешнийг AsyncStorage-д хадгална (веб дээр localStorage руу автоматаар унана).
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: typeof window === "undefined" ? noopStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Гар утсан дээр URL-аас сешн уншихгүй — deep link-ээр гардаг.
    detectSessionInUrl: false,
  },
})
