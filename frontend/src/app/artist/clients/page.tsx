import { Download, Repeat, Star, UserPlus, Users } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
  ArtistStat,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { FilterTabs, Monogram, Pagination, Table, Td } from "@/components/admin/kit";

export const metadata = { title: "Харилцагчид — Артистын админ" };

const ROWS = [
  {
    name: "Сарангуа А.",
    phone: "9911-2233",
    bookings: "14",
    spend: "₮1,680,000",
    last: "2024.05.20",
    rating: "4.9",
  },
  {
    name: "Болормаа Б.",
    phone: "8899-4455",
    bookings: "9",
    spend: "₮940,000",
    last: "2024.05.18",
    rating: "5.0",
  },
  {
    name: "Уянга Ц.",
    phone: "9500-1188",
    bookings: "4",
    spend: "₮420,000",
    last: "2024.04.29",
    rating: "4.6",
  },
];

export default function ArtistClientsPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/clients" {...ARTIST}>
      <ArtistPageHeader
        title="Харилцагчид"
        actions={
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full border border-outline bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint"
          >
            <Download className="size-3.5" />
            Экспортлох
          </button>
        }
      />
      <p className="-mt-6 pb-8 text-sm text-body">
        Тантай үйлчлүүлсэн бүх үйлчлүүлэгчдийн дэлгэрэнгүй мэдээлэл.
      </p>

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <ArtistStat label="Нийт харилцагч" value="1,248" delta="12%" icon={Users} />
          <ArtistStat label="Шинэ энэ сар" value="42" delta="5%" icon={UserPlus} />
          <ArtistStat label="Дахин захиалсан хувь" value="68%" delta="2%" icon={Repeat} />
        </div>

        <ArtistPanel>
          <div className="flex flex-col gap-4">
            <FilterTabs tabs={["Бүгд", "Шинэ", "Тогтмол", "Идэвхгүй"]} active="Бүгд" />

            <Table
              headers={[
                "Харилцагч",
                "Утас",
                "Нийт захиалга",
                "Нийт зарцуулалт",
                "Сүүлийн ирсэн",
                "Үнэлгээ",
                "Үйлдэл",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.name}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.name} />
                      <span className="text-sm font-medium text-ink">{r.name}</span>
                    </div>
                  </Td>
                  <Td>{r.phone}</Td>
                  <Td>{r.bookings}</Td>
                  <Td className="font-medium text-ink">{r.spend}</Td>
                  <Td>{r.last}</Td>
                  <Td>
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-gold text-gold" />
                      {r.rating}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Дэлгэрэнгүй
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>

            <Pagination summary="Нийт 1,248-аас 1-10 харуулж байна" />
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
