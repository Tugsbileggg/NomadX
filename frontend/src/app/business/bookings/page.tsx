import { CalendarCheck, CalendarClock, CalendarRange } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import {
  Badge,
  FilterTabs,
  Monogram,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Захиалгууд — Салоны админ" };

const ROWS: Array<{
  customer: string;
  service: string;
  date: string;
  time: string;
  staff: string;
  price: string;
  status: string;
  tone: Tone;
}> = [
  {
    customer: "Ариунаа",
    service: "Сормуус суулгах",
    date: "10 сар 15",
    time: "14:00",
    staff: "Сарантуяа",
    price: "85,000₮",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
  {
    customer: "Болормаа",
    service: "Арьс цэвэрлэгээ",
    date: "10 сар 15",
    time: "16:30",
    staff: "Уянга",
    price: "120,000₮",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    customer: "Дэлгэрмаа",
    service: "Үс засалт",
    date: "10 сар 14",
    time: "11:00",
    staff: "Батболд",
    price: "45,000₮",
    status: "Дууссан",
    tone: "neutral",
  },
];

export default function BusinessBookingsPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/bookings"
      ctaHref="/business/bookings/new"
    >
      <PageHeader
        title="Захиалгууд"
        description="Захиалгуудаа удирдаж, хянана уу."
        actions={
          <span className="rounded-full border border-surface-variant bg-white px-4 py-2 text-xs font-medium text-body">
            10 сарын 1 - 10 сарын 31
          </span>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Өнөөдрийн захиалга" value="12" delta="+2" icon={CalendarCheck} />
          <StatCard label="Хүлээгдэж буй" value="5" icon={CalendarClock} />
          <StatCard
            label="Энэ сарын нийт захиалга"
            value="142"
            delta="+15%"
            icon={CalendarRange}
          />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Хүлээгдэж буй", "Баталгаажсан", "Дууссан", "Цуцлагдсан"]}
              active="Бүгд"
            />

            <Table
              headers={[
                "Харилцагч",
                "Үйлчилгээ",
                "Огноо/Цаг",
                "Ажилтан",
                "Үнэ",
                "Төлөв",
                "Үйлдэл",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.customer}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.customer} />
                      <span className="text-sm font-medium text-ink">{r.customer}</span>
                    </div>
                  </Td>
                  <Td>{r.service}</Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.date}</span>
                    <span className="block text-xs text-muted">{r.time}</span>
                  </Td>
                  <Td>{r.staff}</Td>
                  <Td className="font-medium text-ink">{r.price}</Td>
                  <Td>
                    <Badge tone={r.tone}>{r.status}</Badge>
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

            <Pagination summary="Нийт 142-оос 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </BusinessShell>
  );
}
