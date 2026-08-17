import { CalendarDays, CalendarX, Coins } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  BarChart,
  FilterTabs,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
  Toolbar,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Захиалгын удирдлага — Супер админ" };

const TREND = [
  { label: "320", value: 320, tone: "soft" as const },
  { label: "410", value: 410, tone: "solid" as const },
  { label: "550", value: 550, tone: "soft" as const },
  { label: "480", value: 480, tone: "solid" as const },
  { label: "620", value: 620, tone: "soft" as const },
  { label: "850", value: 850, tone: "solid" as const },
];

const ROWS: Array<{
  customer: string;
  phone: string;
  provider: string;
  artist: string;
  service: string;
  date: string;
  time: string;
  price: string;
  fee: string;
  status: string;
  tone: Tone;
}> = [
  {
    customer: "Б. Амина",
    phone: "9911-XXXX",
    provider: "Goo Beauty Salon",
    artist: "Ц. Болор (Артист)",
    service: "Будалт + Үс засалт",
    date: "2023.10.25",
    time: "14:30 - 16:00",
    price: "₮120,000",
    fee: "₮12,000",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
  {
    customer: "С. Хулан",
    phone: "9955-XXXX",
    provider: "Velvet Nails Studio",
    artist: "Э. Нандин (Артист)",
    service: "Гель маникюр",
    date: "2023.10.25",
    time: "11:00 - 12:00",
    price: "₮65,000",
    fee: "₮6,500",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    customer: "Д. Оюун",
    phone: "8800-XXXX",
    provider: "Serenity Spa",
    artist: "Б. Тэмүүлэн (Артист)",
    service: "Бариа засал",
    date: "2023.10.24",
    time: "18:00 - 19:30",
    price: "₮150,000",
    fee: "₮15,000",
    status: "Цуцлагдсан",
    tone: "danger",
  },
];

export default function BookingsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/bookings"
      title="Захиалгын удирдлага"
      description="Платформ дээрх бүх захиалгын хяналт."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Өнөөдрийн захиалга" value="456" delta="+15%" icon={CalendarDays} />
          <StatCard label="Энэ сарын нийт" value="12,450" delta="+8.2%" icon={CalendarDays} />
          <StatCard label="Цуцлагдсан хувь" value="8%" delta="-1.5%" icon={CalendarX} />
          <StatCard label="Дундаж захиалгын үнэ" value="₮85,000" delta="+3%" icon={Coins} />
        </div>

        <Panel
          title="Захиалгын хандлага"
          action={<span className="text-xs text-muted">Сүүлийн 30 хоног</span>}
        >
          <div className="rounded-xl border border-surface-tint p-4">
            <BarChart data={TREND} />
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Хүлээгдэж буй", "Баталгаажсан", "Дууссан", "Цуцлагдсан"]}
              active="Бүгд"
            />
            <Toolbar
              placeholder="Харилцагчаар хайх..."
              filters={[
                { label: "Огноо", options: ["Огноо", "Өнөөдөр", "Энэ долоо хоног"] },
                { label: "Шүүлтүүр", options: ["Шүүлтүүр", "Салон", "Артист"] },
              ]}
            />

            <Table
              headers={[
                "Харилцагч",
                "Салон / Артист",
                "Үйлчилгээ",
                "Огноо & цаг",
                "Үнэ",
                "Шимтгэл",
                "Төлөв",
                "Үйлдэл",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.customer}>
                  <Td>
                    <span className="block text-sm font-medium text-ink">{r.customer}</span>
                    <span className="block text-xs text-muted">{r.phone}</span>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.provider}</span>
                    <span className="block text-xs text-muted">{r.artist}</span>
                  </Td>
                  <Td>{r.service}</Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.date}</span>
                    <span className="block text-xs text-muted">{r.time}</span>
                  </Td>
                  <Td className="font-medium text-ink">{r.price}</Td>
                  <Td>{r.fee}</Td>
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

            <Pagination summary="Нийт 12,450-аас 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
