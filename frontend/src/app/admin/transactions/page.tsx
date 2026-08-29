import { Banknote } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV } from "@/components/admin/super-nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata = { title: "Гүйлгээ ба Комисс — Супер админ" };

export default async function TransactionsPage() {
  const admin = await getCurrentAdmin();

  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={admin}
      active="/admin/transactions"
      title="Гүйлгээ ба Комисс"
      description="Захиалгын төлбөр, платформын комиссын хяналт."
    >
      <AdminComingSoon
        icon={Banknote}
        title="Төлбөрийн систем хараахан холбогдоогүй"
        description="Платформ дээр одоогоор бодит төлбөр тооцоо хийгддэггүй тул гүйлгээ, комиссын өгөгдөл алга байна."
      />
    </AdminShell>
  );
}
