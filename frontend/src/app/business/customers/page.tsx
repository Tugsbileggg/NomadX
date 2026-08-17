import { Repeat, Star, UserPlus, Users } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import {
  FilterTabs,
  Monogram,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
} from "@/components/admin/kit";

export const metadata = { title: "Харилцагчид — Салоны админ" };

const ROWS = [
  {
    name: "Амина Э.",
    phone: "9911-2233",
    bookings: "12",
    spend: "₮1,450,000",
    last: "2023.10.15",
    rating: "4.8",
  },
  {
    name: "Болормаа Д.",
    phone: "8899-4455",
    bookings: "7",
    spend: "₮820,000",
    last: "2023.10.11",
    rating: "5.0",
  },
  {
    name: "Golden Nomin",
    phone: "9500-1188",
    bookings: "3",
    spend: "₮310,000",
    last: "2023.09.28",
    rating: "4.3",
  },
];

export default function BusinessCustomersPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/customers"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Харилцагчид"
        description="Тогтмол үйлчлүүлэгчдийн нэгдсэн бүртгэл."
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Нийт харилцагч" value="1,248" icon={Users} />
          <StatCard label="Шинэ энэ сар" value="84" icon={UserPlus} />
          <StatCard label="Дахин захиалсан хувь" value="68%" icon={Repeat} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs tabs={["Бүгд", "Шинэ", "Тогтмол", "Идэвхгүй"]} active="Бүгд" />

            <Table
              headers={[
                "Харилцагч",
                "Утас",
                "Нийт захиалга",
                "Нийт зарцуулалт",
                "Сүүлийн ирсэн",
                "Өгсөн үнэлгээ",
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
        </Panel>
      </div>
    </BusinessShell>
  );
}
