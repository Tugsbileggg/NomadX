import { CalendarCheck, CalendarClock, CalendarRange } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
  ArtistStat,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import {
  Badge,
  FilterTabs,
  Monogram,
  Pagination,
  Table,
  Td,
  type Tone,
} from "@/components/admin/kit";

export const metadata = { title: "Захиалгууд — Артистын админ" };

const ROWS: Array<{
  client: string;
  phone: string;
  service: string;
  duration: string;
  date: string;
  time: string;
  price: string;
  status: string;
  tone: Tone;
}> = [
  {
    client: "А. Сарангуа",
    phone: "9911-XXXX",
    service: "Гүн эдийн массаж",
    duration: "90 мин",
    date: "10 сар 24",
    time: "14:00 - 15:30",
    price: "120,000₮",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
  {
    client: "Б. Болормаа",
    phone: "8899-XXXX",
    service: "Хөмсөг хэлбэржүүлэлт",
    duration: "45 мин",
    date: "10 сар 24",
    time: "16:00 - 16:45",
    price: "45,000₮",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    client: "Ц. Уянга",
    phone: "9500-XXXX",
    service: "Гель маникюр",
    duration: "90 мин",
    date: "10 сар 23",
    time: "10:00 - 11:30",
    price: "55,000₮",
    status: "Дууссан",
    tone: "neutral",
  },
];

export default function ArtistBookingsPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/bookings" {...ARTIST}>
      <ArtistPageHeader
        title="Захиалгууд"
        actions={
          <button
            type="button"
            className="h-10 rounded-full border border-outline bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint"
          >
            Огноо сонгох
          </button>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <ArtistStat label="Өнөөдрийн захиалга" value="12" delta="15%" icon={CalendarCheck} />
          <ArtistStat label="Хүлээгдэж буй" value="5" icon={CalendarClock} />
          <ArtistStat
            label="Энэ сарын нийт захиалга"
            value="148"
            delta="4%"
            icon={CalendarRange}
          />
        </div>

        <ArtistPanel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Хүлээгдэж буй", "Баталгаажсан", "Дууссан", "Цуцлагдсан"]}
              active="Бүгд"
            />

            <Table
              headers={["Харилцагч", "Үйлчилгээ", "Огноо/Цаг", "Үнэ", "Төлөв", "Үйлдэл"]}
            >
              {ROWS.map((r) => (
                <tr key={r.client}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.client.split(" ")[1] ?? r.client} />
                      <span>
                        <span className="block text-sm font-medium text-ink">{r.client}</span>
                        <span className="block text-xs text-muted">{r.phone}</span>
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.service}</span>
                    <span className="block text-xs text-muted">{r.duration}</span>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.date}</span>
                    <span className="block text-xs text-muted">{r.time}</span>
                  </Td>
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

            <Pagination summary="Нийт 148-аас 1-10 харуулж байна" />
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
