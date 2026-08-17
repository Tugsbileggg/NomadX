import Link from "next/link";
import { Activity, Gauge, ScanFace, Target } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  BarChart,
  MeterRow,
  Monogram,
  Panel,
  StatCard,
  Table,
  Td,
} from "@/components/admin/kit";

export const metadata = { title: "AI Ашиглалт — Супер админ" };

const DAILY = ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"].map((label, i) => ({
  label,
  value: [220, 260, 310, 285, 340, 410, 284][i],
  tone: (i % 2 ? "soft" : "solid") as "soft" | "solid",
}));

const TOP_SERVICES = [
  { label: "Гүн цэвэрлэгээ", count: "3,420 (40%)", percent: 40 },
  { label: "Чийгшүүлэлт", count: "2,150 (25%)", percent: 25 },
  { label: "Батга эмчилгээ", count: "1,280 (15%)", percent: 15 },
];

const LEADERS = [
  { rank: "01", name: "Serenity Spa", scans: "1.2мянга шинжилгээ" },
  { rank: "02", name: "Luxe Derma", scans: "850 шинжилгээ" },
  { rank: "03", name: "Артист: Болор", scans: "640 шинжилгээ" },
];

const SCANS = [
  {
    user: "Ану З.",
    when: "10 минутын өмнө",
    issue: "Хуурайшилт",
    suggestion: "Чийгшүүлэлт",
    status: "Захиалсан",
  },
  {
    user: "Бат Э.",
    when: "35 минутын өмнө",
    issue: "Батга",
    suggestion: "Батга эмчилгээ",
    status: "Үзсэн",
  },
  {
    user: "Сараа М.",
    when: "1 цагийн өмнө",
    issue: "Гэрэлгүй арьс",
    suggestion: "Гүн цэвэрлэгээ",
    status: "Захиалсан",
  },
];

export default function AiUsagePage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/ai-usage"
      title="AI Ашиглалт"
      description="Хиймэл оюун ухааны шинжилгээний үр дүн, чиг хандлага."
      actions={
        <select
          aria-label="Хугацаа"
          className="h-10 rounded-lg border border-surface-variant bg-white px-3 text-sm text-body focus:border-primary focus:outline-none"
        >
          <option>Энэ сар (2023.09)</option>
          <option>Өнгөрсөн сар</option>
        </select>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт арьс оношилгоо" value="8,542" delta="+12%" icon={ScanFace} />
          <StatCard label="Нарийвчлал" value="94.8%" delta="+3.2%" icon={Target} />
          <StatCard label="Захиалга болсон хувь" value="28.5%" icon={Activity} />
          <StatCard label="Өдрийн дундаж" value="284" hint="шинжилгээ" icon={Gauge} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Өдөр тутмын хэрэглээний хандлага" className="lg:col-span-2">
            <div className="rounded-xl border border-surface-tint p-4">
              <BarChart data={DAILY} />
            </div>
          </Panel>

          <Panel title="Санал болголтын нарийвчлал">
            <div className="flex flex-col gap-4">
              <MeterRow label="Нарийвчлал" percent={95} />
              <MeterRow label="Хэрэглэгчийн батламж" percent={88} color="bg-primary-light" />
              <MeterRow label="Захиалга болсон" percent={29} color="bg-primary-accent" />
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Хамгийн их санал болгосон үйлчилгээнүүд">
            <div className="flex flex-col gap-4">
              {TOP_SERVICES.map((s) => (
                <div key={s.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-medium text-body">
                    <span>{s.label}</span>
                    <span>{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-tint">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Тэргүүлэх Салон / Артист">
            <ul className="flex flex-col gap-3">
              {LEADERS.map((l) => (
                <li
                  key={l.rank}
                  className="flex items-center gap-4 rounded-xl bg-surface-page px-4 py-3"
                >
                  <span className="text-sm font-semibold text-primary">{l.rank}</span>
                  <span className="flex-1 text-sm font-medium text-ink">{l.name}</span>
                  <span className="text-xs text-muted">{l.scans}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel
          title="Сүүлийн шинжилгээнүүд"
          action={
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Бүгдийг харах
            </Link>
          }
        >
          <Table
            headers={["Хэрэглэгч", "Огноо", "Асуудал (илэрсэн)", "Санал болгосон", "Төлөв"]}
          >
            {SCANS.map((s) => (
              <tr key={s.user}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Monogram name={s.user} />
                    <span className="text-sm font-medium text-ink">{s.user}</span>
                  </div>
                </Td>
                <Td>{s.when}</Td>
                <Td>
                  <Badge tone="warning">{s.issue}</Badge>
                </Td>
                <Td className="font-medium text-ink">{s.suggestion}</Td>
                <Td>
                  <Badge tone={s.status === "Захиалсан" ? "success" : "neutral"}>
                    {s.status}
                  </Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </AdminShell>
  );
}
