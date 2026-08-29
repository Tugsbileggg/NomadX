import { Bot } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata = { title: "AI Ашиглалт — Супер админ" };

export default async function AiUsagePage() {
  const admin = await getCurrentAdmin();

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/ai-usage"
      title="AI Ашиглалт"
      description="Хиймэл оюуны онош/зөвлөгөөний ашиглалтын статистик."
    >
      <AdminComingSoon
        icon={Bot}
        title="AI онош/зөвлөгөө хараахан хийгдээгүй"
        description="Гар утасны аппын 'AI Зөвлөгөө' хэсэг одоогоор 'тун удахгүй' төлөвтэй тул ашиглалтын статистик алга байна."
      />
    </AdminShell>
  );
}
