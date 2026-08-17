import Link from "next/link";
import {
  ClipboardList,
  Banknote,
  CalendarCheck,
  Paintbrush,
  ScanFace,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  BarChart,
  Donut,
  MeterRow,
  Panel,
  StatCard,
  Table,
  Td,
} from "@/components/admin/kit";

export const metadata = { title: "Ерөнхий мэдээлэл — Супер админ" };

const WEEK = [
  { label: "Дав", value: 62, tone: "solid" as const },
  { label: "Мяг", value: 82, tone: "soft" as const },
  { label: "Лха", value: 44, tone: "solid" as const },
  { label: "Пүр", value: 95, tone: "soft" as const },
  { label: "Баа", value: 70, tone: "solid" as const },
  { label: "Бям", value: 88, tone: "soft" as const },
  { label: "Ням", value: 60, tone: "solid" as const },
];

const PENDING = [
  {
    name: "Oasis Spa Retreat",
    area: "Сүхбаатар дүүрэг",
    type: "Салон",
    date: "2023.10.24",
  },
  {
    name: "Урангоо (Make-up)",
    area: "Чингэлтэй дүүрэг",
    type: "Артист",
    date: "2023.10.23",
  },
];

const ADMINS = [
  { name: "Бат-Эрдэнэ", org: "Luxe Hair Studio", active: true },
  { name: "Сарантуяа", org: "Nail Art Salon", active: false },
];

const COMPLAINTS: Array<{ who: string; reason: string; tone: "warning" | "danger" | "success"; state: string }> = [
  { who: "Хэрэглэгч #4892", reason: "Цагтаа ирээгүй (3 дахь удаа)", tone: "warning", state: "Хүлээгдэж буй" },
  { who: "Glow Studio", reason: "Үйлчилгээний чанар муу", tone: "danger", state: "Анхааруулга өгсөн" },
  { who: "Хэрэглэгч #1024", reason: "Хуурамч бүртгэл", tone: "success", state: "Шийдвэрлэсэн" },
];

export default function SuperAdminDashboard() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin"
      title="Ерөнхий мэдээлэл"
      description="Платформын бодит хугацааны үзүүлэлтүүд."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хэрэглэгч" value="12,450" delta="+8.2%" icon={Users} />
          <StatCard label="Нийт артист" value="342" delta="+12" icon={Paintbrush} />
          <StatCard label="Нийт салон" value="128" delta="+4" icon={Store} />
          <StatCard label="Өнөөдрийн захиалга" value="456" delta="+15%" icon={CalendarCheck} />
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <StatCard label="Нийт орлого (сараар)" value="₮ 145.2M" icon={Banknote} />
          <StatCard label="Комиссын орлого" value="₮ 14.5M" icon={Banknote} />
          <div className="lg:col-span-2">
            <StatCard
              label="Баталгаажуулалт хүлээгдэж буй"
              value="12"
              hint="Шалгах шаардлагатай шинэ бүртгэлүүд"
              icon={ClipboardList}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Хэрэглэгчийн идэвх & Орлогын чиг хандлага" className="lg:col-span-2">
            <div className="rounded-xl border border-surface-tint p-4">
              <BarChart data={WEEK} />
            </div>
          </Panel>

          <div className="flex flex-col gap-6">
            <Panel title="Шилдэг ангилал">
              <div className="flex flex-col gap-4">
                <MeterRow label="Үс арчилгаа" percent={45} />
                <MeterRow label="Нүүр будалт" percent={30} color="bg-primary-light" />
                <MeterRow label="Хумс засал" percent={25} color="bg-primary-accent" />
              </div>
            </Panel>

            <Panel title="Захиалга vs Цуцлалт">
              <div className="flex items-center gap-6">
                <Donut percent={92} label="Амжилттай захиалга" />
                <ul className="flex flex-col gap-2 text-sm text-body">
                  <li className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-primary" />
                    Амжилттай (92%)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-danger" />
                    Цуцлагдсан (8%)
                  </li>
                </ul>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            title="Баталгаажуулалт хүлээгдэж буй"
            className="lg:col-span-2"
            action={
              <Link
                href="/admin/verification"
                className="text-xs font-medium text-primary hover:underline"
              >
                Бүгдийг харах (12)
              </Link>
            }
          >
            <Table headers={["Нэр", "Төрөл", "Хүсэлт илгээсэн огноо", "Баримт бичиг", "Үйлдэл"]}>
              {PENDING.map((p) => (
                <tr key={p.name}>
                  <Td>
                    <span className="block text-sm font-medium text-ink">{p.name}</span>
                    <span className="block text-xs text-muted">{p.area}</span>
                  </Td>
                  <Td>{p.type}</Td>
                  <Td>{p.date}</Td>
                  <Td>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Үзэх
                    </button>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-medium text-success-darker hover:brightness-95"
                      >
                        Зөвшөөрөх
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-medium text-[#991b1b] hover:brightness-95"
                      >
                        Татгалзах
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </Panel>

          <Panel title="AI Үзүүлэлтүүд">
            <div className="flex flex-col gap-4">
              <AiMetric
                icon={<ScanFace className="size-5 text-primary" />}
                label="Арьс оношилгоо (Сард)"
                value="8,542"
                delta="+12% өсөлттэй"
              />
              <AiMetric
                icon={<Sparkles className="size-5 text-primary" />}
                label="Санал болголтын нарийвчлал"
                value="94.8%"
              />
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Салон/Артист Админууд">
            <Table headers={["Админ нэр", "Төлөв", "Үйлдэл"]}>
              {ADMINS.map((a) => (
                <tr key={a.name}>
                  <Td>
                    <span className="block text-sm font-medium text-ink">{a.name}</span>
                    <span className="block text-xs text-muted">{a.org}</span>
                  </Td>
                  <Td>
                    <Badge tone={a.active ? "success" : "neutral"}>
                      {a.active ? "Идэвхтэй" : "Түдгэлзсэн"}
                    </Badge>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {a.active ? "Түдгэлзүүлэх" : "Идэвхжүүлэх"}
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>
          </Panel>

          <Panel title="Гомдол & Мэдээлэгдсэн хэрэглэгчид">
            <Table headers={["Хэрэглэгч/Салон", "Шалтгаан", "Төлөв"]}>
              {COMPLAINTS.map((c) => (
                <tr key={c.who}>
                  <Td className="font-medium text-ink">{c.who}</Td>
                  <Td>{c.reason}</Td>
                  <Td>
                    <Badge tone={c.tone}>{c.state}</Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

function AiMetric({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-surface-tint bg-surface-page p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs leading-4 font-medium text-body">{label}</span>
      </div>
      <p className="mt-3 text-2xl leading-8 font-semibold text-ink">{value}</p>
      {delta && <p className="mt-1 text-xs leading-4 font-medium text-success">{delta}</p>}
    </div>
  );
}
