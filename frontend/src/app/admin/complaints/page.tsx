import { AlertTriangle, CheckCircle2, Clock, MessageSquareWarning, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import {
  Badge,
  FilterTabs,
  Monogram,
  Pagination,
  Panel,
  StatCard,
  Table,
  Td,
  Toolbar,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Гомдол ба Маргаан — Супер админ" };

const ROWS: Array<{
  from: string;
  fromRole: string;
  to: string;
  reason: string;
  date: string;
  priority: string;
  priorityTone: Tone;
  status: string;
  statusTone: Tone;
}> = [
  {
    from: "А. Болор",
    fromRole: "Customer",
    to: "Glow Spa",
    reason: "Үйлчилгээний чанар",
    date: "2023.10.25",
    priority: "Яаралтай",
    priorityTone: "danger",
    status: "Хүлээгдэж буй",
    statusTone: "warning",
  },
  {
    from: "M. Саруул",
    fromRole: "Artist",
    to: "Lash Lounge",
    reason: "Төлбөрийн маргаан",
    date: "2023.10.24",
    priority: "Энгийн",
    priorityTone: "neutral",
    status: "Хянагдаж буй",
    statusTone: "primary",
  },
  {
    from: "Б. Номин",
    fromRole: "Customer",
    to: "Serenity Spa",
    reason: "Цаг цуцлалт",
    date: "2023.10.22",
    priority: "Энгийн",
    priorityTone: "neutral",
    status: "Шийдвэрлэсэн",
    statusTone: "success",
  },
];

export default function ComplaintsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/complaints"
      title="Гомдол ба Маргаан шийдвэрлэлт"
      description="Системд бүртгэгдсэн гомдол, санал хүсэлтийн удирдлага"
      actions={
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="size-4" />
          Шинэ бүртгэл
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт гомдол" value="142" icon={MessageSquareWarning} />
          <StatCard label="Шийдвэрлээгүй" value="12" icon={Clock} />
          <StatCard label="Шийдвэрлэсэн" value="130" icon={CheckCircle2} />
          <StatCard label="Энэ сарын гомдол" value="24" delta="+8%" icon={AlertTriangle} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Хүлээгдэж буй", "Хянагдаж буй", "Шийдвэрлэсэн"]}
              active="Бүгд"
            />
            <Toolbar placeholder="Хайх..." />

            <Table
              headers={[
                "Илгээгч",
                "Хэнд",
                "Төрөл/Шалтгаан",
                "Огноо",
                "Дараалал",
                "Төлөв",
                "Үйлдэл",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.from}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.from} />
                      <span>
                        <span className="block text-sm font-medium text-ink">{r.from}</span>
                        <span className="block text-xs text-muted">{r.fromRole}</span>
                      </span>
                    </div>
                  </Td>
                  <Td className="font-medium text-ink">{r.to}</Td>
                  <Td>{r.reason}</Td>
                  <Td>{r.date}</Td>
                  <Td>
                    <Badge tone={r.priorityTone}>{r.priority}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={r.statusTone}>{r.status}</Badge>
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
    </AdminShell>
  );
}
