import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** /admin/* — зөвхөн super_admin role-той хэрэглэгч л орно. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin") redirect("/login");

  return <>{children}</>;
}
