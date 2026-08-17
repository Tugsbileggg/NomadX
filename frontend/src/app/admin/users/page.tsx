import { Ban, UserCheck, UserPlus, Users } from "lucide-react";
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
} from "@/components/admin/kit";

export const metadata = { title: "Хэрэглэгчийн удирдлага — Супер админ" };

const ROWS = [
  {
    name: "Бат-Эрдэнэ",
    role: "Хэрэглэгч",
    phone: "9911-XXXX",
    email: "bat.e@example.com",
    joined: "2023.10.15",
    bookings: 12,
    status: "Идэвхтэй" as const,
  },
  {
    name: "Анужин",
    role: "Артист",
    phone: "8899-XXXX",
    email: "anujin.m@example.com",
    joined: "2023.11.02",
    bookings: 45,
    status: "Идэвхтэй" as const,
  },
  {
    name: "Төгөлдөр",
    role: "Хэрэглэгч",
    phone: "8011-XXXX",
    email: "tugu@example.com",
    joined: "2023.09.20",
    bookings: 3,
    status: "Хориглогдсон" as const,
  },
];

export default function UsersPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/users"
      title="Хэрэглэгчийн удирдлага"
      description="Платформын бодит хугацааны үзүүлэлтүүд."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хэрэглэгч" value="12,450" icon={Users} />
          <StatCard label="Шинэ бүртгэл (энэ сар)" value="842" delta="+12%" icon={UserPlus} />
          <StatCard label="Идэвхтэй хэрэглэгч" value="10,210" icon={UserCheck} />
          <StatCard label="Хориглогдсон хэрэглэгчид" value="45" icon={Ban} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Идэвхтэй", "Хориглогдсон", "Баталгаажаагүй"]}
              active="Бүгд"
            />
            <Toolbar
              placeholder="Хэрэглэгч хайх..."
              filters={[{ label: "Дүр", options: ["Бүх дүр", "Хэрэглэгч", "Артист", "Салон"] }]}
            />

            <Table
              headers={[
                "Хэрэглэгч",
                "Холбоо барих",
                "Бүртгүүлсэн",
                "Захиалга",
                "Төлөв",
                "Үйлдэл",
              ]}
            >
              {ROWS.map((r) => (
                <tr key={r.email}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.name} />
                      <span>
                        <span className="block text-sm font-medium text-ink">{r.name}</span>
                        <span className="block text-xs text-muted">{r.role}</span>
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.phone}</span>
                    <span className="block text-xs text-muted">{r.email}</span>
                  </Td>
                  <Td>{r.joined}</Td>
                  <Td>{r.bookings}</Td>
                  <Td>
                    <Badge tone={r.status === "Идэвхтэй" ? "success" : "danger"}>
                      {r.status}
                    </Badge>
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
