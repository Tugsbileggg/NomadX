import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service role client — зөвхөн Super Admin-ийн server action-уудад
 * ашиглана (жишээ нь: auth.users-ээс и-мэйл унших, хэрэглэгч хориглох).
 * RLS-ийг тойрч гардаг тул client component руу ХЭЗЭЭ Ч дамжуулахгүй.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
