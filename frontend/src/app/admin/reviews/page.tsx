import { MessageSquare } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata = { title: "Сэтгэгдлүүд удирдах — Супер админ" };

export default async function ReviewsPage() {
  const admin = await getCurrentAdmin();

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/reviews"
      title="Сэтгэгдлүүд удирдах"
      description="Хэрэглэгчдийн үлдээсэн сэтгэгдэл, үнэлгээний хяналт."
    >
      <AdminComingSoon
        icon={MessageSquare}
        title="Сэтгэгдлийн систем хараахан байхгүй"
        description="Платформ дээр одоогоор харилцагчаас сэтгэгдэл/үнэлгээ авах боломж бий болоогүй тул удирдах өгөгдөл алга байна."
      />
    </AdminShell>
  );
}
