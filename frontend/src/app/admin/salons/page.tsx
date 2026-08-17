import { BadgeCheck, Clock, PowerOff, Star, Store } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  FilterTabs,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
  Toolbar,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Салонуудын удирдлага — Супер админ" };

const ROWS: Array<{
  name: string;
  id: string;
  address: string;
  category: string;
  rating: string;
  reviews?: string;
  bookings: string;
  revenue: string;
  status: string;
  tone: Tone;
}> = [
  {
    name: "Luxe Sanctuary Salon",
    id: "SLN-001",
    address: "Улаанбаатар, СБД, 1-р хороо",
    category: "Спа, Массаж",
    rating: "4.9",
    reviews: "(124)",
    bookings: "2,145",
    revenue: "₮ 12.5M / сар",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    name: "Velvet Nails Studio",
    id: "SLN-088",
    address: "Улаанбаатар, ХУД, 15-р хороо",
    category: "Хумс",
    rating: "Шинэ",
    bookings: "0",
    revenue: "-",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
  {
    name: "Aura Hair Design",
    id: "SLN-042",
    address: "Эрдэнэт, Баян-Өндөр",
    category: "Үсчин",
    rating: "3.2",
    bookings: "145",
    revenue: "₮ 1.2M / сар",
    status: "Идэвхгүй",
    tone: "neutral",
  },
];

export default function SalonsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/salons"
      title="Салонуудын удирдлага"
      description="Платформын бодит хугацааны үзүүлэлтүүд."
      actions={
        <button
          type="button"
          className="h-10 rounded-full bg-primary px-5 text-xs leading-4 font-semibold tracking-[0.6px] text-white uppercase hover:bg-primary-dark"
        >
          Шинэ салон нэмэх
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт салон" value="128" icon={Store} />
          <StatCard label="Баталгаажсан" value="112" icon={BadgeCheck} />
          <StatCard label="Хүлээгдэж буй" value="12" icon={Clock} />
          <StatCard label="Идэвхгүй" value="4" icon={PowerOff} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Баталгаажсан", "Хүлээгдэж буй", "Хориглогдсон"]}
              active="Бүгд"
            />
            <Toolbar
              placeholder="Салон хайх..."
              filters={[
                { label: "Хот", options: ["Бүх хот", "Улаанбаатар", "Эрдэнэт", "Дархан"] },
                {
                  label: "Ангилал",
                  options: ["Бүх ангилал", "Үсчин", "Хумс", "Спа, Массаж"],
                },
              ]}
            />

            <Table
              headers={["Салон", "Хаяг / Ангилал", "Үнэлгээ", "Үзүүлэлт", "Төлөв", "Үйлдэл"]}
            >
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <span className="block text-sm font-medium text-ink">{r.name}</span>
                    <span className="block text-xs text-muted">ID: {r.id}</span>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.address}</span>
                    <span className="block text-xs text-muted">{r.category}</span>
                  </Td>
                  <Td>
                    {r.rating === "Шинэ" ? (
                      <Badge tone="primary">Шинэ</Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-ink">
                        <Star className="size-3.5 fill-primary text-primary" />
                        {r.rating}
                        {r.reviews && <span className="text-xs text-muted">{r.reviews}</span>}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.bookings} захиалга</span>
                    <span className="block text-xs text-muted">{r.revenue}</span>
                  </Td>
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

            <Pagination summary="Нийт 128-аас 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
