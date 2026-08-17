import Link from "next/link";
import { CalendarCheck, Star, UserPlus, Wallet } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
  ArtistStat,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { LineChart } from "@/components/admin/LineChart";
import { Badge, Monogram, Table, Td } from "@/components/admin/kit";

export const metadata = { title: "Ерөнхий тойм — Артистын админ" };

const SPLIT = [
  { label: "Нүүр цэвэрлэгээ", percent: 45, color: "var(--color-primary)" },
  { label: "Иллэг, массаж", percent: 25, color: "var(--color-primary-light)" },
  { label: "Бусад", percent: 30, color: "var(--color-surface-variant)" },
];

const BOOKINGS = [
  { client: "Анударь Б.", service: "Гүн цэвэрлэгээ", time: "14:00", status: "Баталгаажсан" },
  { client: "Батчимэг Д.", service: "Иллэг", time: "15:30", status: "Хүлээгдэж буй" },
  { client: "Цэцэгмаа Т.", service: "Нүүр будалт", time: "17:00", status: "Баталгаажсан" },
];

const REVIEWS = [
  { name: "Номин-Эрдэнэ", when: "Өчигдөр", rating: 5, text: "Маш анхаарал болгоомжтой ажилладаг." },
  { name: "Сувд-Эрдэнэ", when: "2 хоногийн өмнө", rating: 5, text: "Арьс маань үнэхээр сэргэсэн." },
];

export default function ArtistDashboard() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist" {...ARTIST}>
      <ArtistPageHeader title="Ерөнхий тойм" chip="Өнөөдөр: 2024.05.24" />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <ArtistStat
            label="Өнөөдрийн захиалга"
            value="8"
            delta="12%"
            icon={CalendarCheck}
          />
          <ArtistStat label="Сарын орлого" value="3.2M₮" delta="5%" icon={Wallet} />
          <ArtistStat label="Дундаж үнэлгээ" value="4.9" suffix="/ 5.0" delta="0%" icon={Star} />
          <ArtistStat label="Шинэ харилцагчид" value="24" delta="18%" icon={UserPlus} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ArtistPanel
            title="Орлогын хандлага"
            className="lg:col-span-2"
            action={
              <select
                aria-label="Хугацаа"
                className="h-9 rounded-full bg-surface-tint px-4 text-xs font-medium text-body focus:outline-2 focus:outline-primary"
              >
                <option>Энэ сар</option>
                <option>Өнгөрсөн сар</option>
              </select>
            }
          >
            <LineChart
              labels={["1", "5", "10", "15", "20", "25", "30"]}
              yTicks={["3M", "2M", "1M", "0"]}
              series={[
                {
                  label: "Орлого",
                  color: "var(--color-primary-light)",
                  fill: "rgba(166,96,107,0.1)",
                  points: [0.4, 1.2, 0.5, 1.9, 1.6, 2.6, 2.4],
                },
              ]}
            />
          </ArtistPanel>

          <ArtistPanel title="Үйлчилгээний тархалт">
            <div className="flex flex-col items-center gap-6">
              <div
                className="relative flex size-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${SPLIT[0].color} 0 45%, ${SPLIT[1].color} 45% 70%, ${SPLIT[2].color} 70% 100%)`,
                }}
                role="img"
                aria-label="Үйлчилгээний тархалт"
              >
                <div className="flex size-28 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-sm font-semibold text-ink">Нийт</span>
                  <span className="text-xs text-muted">120</span>
                </div>
              </div>

              <ul className="w-full flex-col gap-2 text-xs text-body">
                {SPLIT.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 py-1">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="flex-1">{s.label}</span>
                    <span className="font-medium">{s.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </ArtistPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ArtistPanel
            title="Сүүлийн захиалгууд"
            action={
              <Link
                href="/artist/bookings"
                className="text-xs font-medium text-primary hover:underline"
              >
                Бүгдийг харах
              </Link>
            }
          >
            <Table headers={["Үйлчлүүлэгч", "Үйлчилгээ", "Цаг", "Төлөв"]}>
              {BOOKINGS.map((b) => (
                <tr key={b.client}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={b.client} />
                      <span className="text-sm font-medium text-ink">{b.client}</span>
                    </div>
                  </Td>
                  <Td>{b.service}</Td>
                  <Td>{b.time}</Td>
                  <Td>
                    <Badge tone={b.status === "Баталгаажсан" ? "success" : "warning"}>
                      {b.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          </ArtistPanel>

          <ArtistPanel
            title="Сүүлийн сэтгэгдлүүд"
            action={
              <Link
                href="/artist/reviews"
                className="text-xs font-medium text-primary hover:underline"
              >
                Бүгдийг харах
              </Link>
            }
          >
            <ul className="flex flex-col gap-3">
              {REVIEWS.map((r) => (
                <li key={r.name} className="rounded-xl border border-surface-tint bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {r.name}
                      <span className="ml-2 text-xs font-normal text-muted">{r.when}</span>
                    </span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Star key={i} className="size-3 fill-gold text-gold" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-body">{r.text}</p>
                </li>
              ))}
            </ul>
          </ArtistPanel>
        </div>
      </div>
    </ArtistShell>
  );
}
