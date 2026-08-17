import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "./types.js"

export type Db = SupabaseClient<Database>

/**
 * Хэрэглэгчийн эрхээр ажиллах client — RLS хүчинтэй.
 * Хүсэлтээс ирсэн access token-ыг дамжуулна.
 */
export function userClient(accessToken: string): Db {
  return createClient<Database>(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Админ client — RLS-ийг тойрно. Зөвхөн итгэмжлэгдсэн серверийн ажилд
 * (cron, webhook, тайлан) ашиглана.
 */
export function serviceClient(): Db {
  return createClient<Database>(
    env("SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} тохируулаагүй байна (.env харна уу)`)
  return value
}
