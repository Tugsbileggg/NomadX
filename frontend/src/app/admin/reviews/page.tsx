import { Flag, MessageSquare, Sparkles, Star } from "lucide-react";
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

export const metadata = { title: "Сэтгэгдлүүд удирдах — Супер админ" };

const ROWS: Array<{
  author: string;
  target: string;
  rating: number;
  text: string;
  date: string;
  status: string;
  tone: Tone;
}> = [
  {
    author: "А. Болор",
    target: "Luxe Sanctuary Salon",
    rating: 5,
    text: "Маш сайхан үйлчилгээ, дахин очно.",
    date: "2023.10.25",
    status: "Нийтлэгдсэн",
    tone: "success",
  },
  {
    author: "Б. Номин",
    target: "Velvet Nails Studio",
    rating: 2,
    text: "Цагтаа эхлээгүй, удаан хүлээсэн.",
    date: "2023.10.24",
    status: "Тайлагдсан",
    tone: "danger",
  },
  {
    author: "Д. Оюун",
    target: "Serenity Spa",
    rating: 4,
    text: "Тухтай орчин, үнэ өндөр.",
    date: "2023.10.22",
    status: "Хянагдаж буй",
    tone: "warning",
  },
];

export default function ReviewsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/reviews"
      title="Сэтгэгдлүүд удирдах"
      description="Платформ дээрх бүх үнэлгээ, сэтгэгдлийг хянах, зохицуулах."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт сэтгэгдэл" value="45.2K" delta="+12%" icon={MessageSquare} />
          <StatCard label="Дундаж үнэлгээ" value="4.8" icon={Star} />
          <StatCard label="Тайлагдсан" value="128" hint="Анхаарал хандуулах" icon={Flag} />
          <StatCard label="Энэ сарын шинэ" value="1,240" icon={Sparkles} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Тайлагдсан", "Хянагдаж буй", "Нийтлэгдсэн"]}
              active="Бүгд"
            />
            <Toolbar placeholder="Хайх..." />

            <Table
              headers={["Хэрэглэгч", "Салон / Артист", "Үнэлгээ", "Сэтгэгдэл", "Огноо", "Төлөв", "Үйлдэл"]}
            >
              {ROWS.map((r) => (
                <tr key={r.author}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.author} />
                      <span className="text-sm font-medium text-ink">{r.author}</span>
                    </div>
                  </Td>
                  <Td className="font-medium text-ink">{r.target}</Td>
                  <Td>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating
                              ? "size-3.5 fill-primary text-primary"
                              : "size-3.5 text-surface-variant"
                          }
                        />
                      ))}
                    </span>
                  </Td>
                  <Td className="max-w-[280px]">{r.text}</Td>
                  <Td>{r.date}</Td>
                  <Td>
                    <Badge tone={r.tone}>{r.status}</Badge>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Хянах
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>

            <Pagination summary="Нийт 45,200-аас 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
