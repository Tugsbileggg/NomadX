import { Download, Banknote, Percent, Receipt, Wallet } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  BarChart,
  FilterTabs,
  MeterRow,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Гүйлгээ ба Комисс — Супер админ" };

const WEEKS = [
  { label: "1-р долоо хоног", value: 62, tone: "solid" as const },
  { label: "2-р долоо хоног", value: 74, tone: "soft" as const },
  { label: "3-р долоо хоног", value: 90, tone: "solid" as const },
  { label: "4-р долоо хоног", value: 100, tone: "soft" as const },
];

const ROWS: Array<{
  date: string;
  provider: string;
  booking: string;
  gross: string;
  rate: string;
  commission: string;
  status: string;
  tone: Tone;
}> = [
  {
    date: "2023.10.24",
    provider: "Luxe Beauty Lounge",
    booking: "#B-8921",
    gross: "₮ 120,000",
    rate: "15%",
    commission: "₮ 18,000",
    status: "Төлөгдсөн",
    tone: "success",
  },
  {
    date: "2023.10.24",
    provider: "Ariana Hair Studio",
    booking: "#B-8920",
    gross: "₮ 85,000",
    rate: "15%",
    commission: "₮ 12,750",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
  {
    date: "2023.10.23",
    provider: "Serenity Spa",
    booking: "#B-8918",
    gross: "₮ 210,000",
    rate: "12%",
    commission: "₮ 25,200",
    status: "Төлөгдсөн",
    tone: "success",
  },
];

export default function TransactionsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/transactions"
      title="Гүйлгээ ба Комисс"
      description="Платформын орлого, шимтгэлийн тайлан."
      actions={
        <div className="flex items-center gap-3">
          <select
            aria-label="Хугацаа"
            className="h-10 rounded-lg border border-surface-variant bg-white px-3 text-sm text-body focus:border-primary focus:outline-none"
          >
            <option>Энэ сар</option>
            <option>Өнгөрсөн сар</option>
            <option>Энэ жил</option>
          </select>
          <select
            aria-label="Салон/Артист"
            className="h-10 rounded-lg border border-surface-variant bg-white px-3 text-sm text-body focus:border-primary focus:outline-none"
          >
            <option>Бүгд</option>
            <option>Салон</option>
            <option>Артист</option>
          </select>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Download className="size-4" />
            Тайлан татах
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Нийт орлого"
            value="₮ 124,500,000"
            delta="+12.5% (өмнөх сараас)"
            icon={Banknote}
          />
          <StatCard
            label="Комиссын орлого"
            value="₮ 18,675,000"
            delta="+8.2% (өмнөх сараас)"
            icon={Percent}
          />
          <StatCard
            label="Төлбөр хүлээгдэж буй"
            value="₮ 42,300,000"
            hint="Шилжүүлэг хүлээгдэж буй"
            icon={Wallet}
          />
          <StatCard
            label="Энэ сарын гүйлгээ"
            value="2,451"
            delta="+15.4% (өмнөх сараас)"
            icon={Receipt}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Орлого ба Комиссын хандлага" className="lg:col-span-2">
            <div className="rounded-xl border border-surface-tint p-4">
              <BarChart data={WEEKS} />
            </div>
          </Panel>

          <Panel title="Ангилал тус бүрийн комисс">
            <div className="flex flex-col gap-4">
              <MeterRow label="Үс" percent={45} />
              <MeterRow label="Хумс" percent={30} color="bg-primary-light" />
              <MeterRow label="Спа" percent={25} color="bg-primary-accent" />
            </div>
          </Panel>
        </div>

        <Panel title="Гүйлгээний түүх">
          <div className="flex flex-col gap-4">
            <FilterTabs tabs={["Бүгд", "Төлөгдсөн", "Хүлээгдэж буй"]} active="Бүгд" />

            <Table
              headers={[
                "Огноо",
                "Салон/Артист",
                "Захиалгын дугаар",
                "Нийт дүн",
                "Комисс %",
                "Комиссын дүн",
                "Төлөв",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.booking}>
                  <Td>{r.date}</Td>
                  <Td className="font-medium text-ink">{r.provider}</Td>
                  <Td>{r.booking}</Td>
                  <Td>{r.gross}</Td>
                  <Td>{r.rate}</Td>
                  <Td className="font-medium text-ink">{r.commission}</Td>
                  <Td>
                    <Badge tone={r.tone}>{r.status}</Badge>
                  </Td>
                </tr>
              ))}
            </Table>

            <Pagination summary="Нийт 2,451-ээс 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
