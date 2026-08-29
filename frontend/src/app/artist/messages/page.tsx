import { MessageSquare } from "lucide-react";

import { ArtistPageHeader, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { AdminComingSoon } from "@/components/admin/ComingSoon";

export const metadata = { title: "Мессеж — Артистын админ" };

/**
 * Чат хараахан хийгдээгүй.
 *
 * Урьд нь энэ хуудас зохиомол харилцан яриа (нэр, мессеж, цаг) харуулдаг
 * байсан — байхгүй боломжийг байгаа мэт харуулах нь буруу тул шударга
 * төлөвөөр орлуулав. Хийхийн тулд `messages` хүснэгт, RLS, realtime
 * захиалга, аппын талд чат дэлгэц нэмэх шаардлагатай.
 */
export default function ArtistMessagesPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/messages" {...ARTIST}>
      <ArtistPageHeader title="Мессеж" />

      <AdminComingSoon
        icon={MessageSquare}
        title="Шууд харилцах"
        description="Үйлчлүүлэгчтэй чатаар харилцах боломж хараахан хийгдээгүй — өгөгдлийн санд мессежийн хүснэгт байхгүй. Одоогоор үйлчлүүлэгч захиалгын тайлбарт хүслээ бичиж, та сэтгэгдэлд нь хариу үлдээж харилцана."
      />
    </ArtistShell>
  );
}
