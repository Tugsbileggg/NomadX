import { AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata = { title: "Гомдол ба Маргаан — Супер админ" };

export default async function ComplaintsPage() {
  const admin = await getCurrentAdmin();

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/complaints"
      title="Гомдол ба Маргаан"
      description="Хэрэглэгч, бизнесийн хооронд гарсан маргаан, гомдлын хяналт."
    >
      <AdminComingSoon
        icon={AlertTriangle}
        title="Гомдлын систем хараахан байхгүй"
        description="Платформ дээр одоогоор гомдол/мэдээлэх боломж бий болоогүй тул удирдах өгөгдөл алга байна."
      />
    </AdminShell>
  );
}
