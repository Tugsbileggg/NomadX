import { BadgeCheck, Clock, PowerOff, Star, Paintbrush } from "lucide-react";
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

export const metadata = { title: "Артистуудын удирдлага — Супер админ" };

/**
 * The sidebar links here but the Figma file has no Артистууд frame, so this
 * page mirrors the Салонууд screen's layout with artist-shaped columns.
 */
const ROWS: Array<{
  name: string;
  id: string;
  specialty: string;
  area: string;
  rating: string;
  bookings: string;
  revenue: string;
  status: string;
  tone: Tone;
}> = [
  {
    name: "Ц. Болор",
    id: "ART-014",
    specialty: "Нүүр будалт",
    area: "Улаанбаатар, СБД",
    rating: "4.9",
    bookings: "845",
    revenue: "₮ 4.2M / сар",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    name: "Э. Нандин",
    id: "ART-102",
    specialty: "Хумс",
    area: "Улаанбаатар, ХУД",
    rating: "4.6",
    bookings: "312",
    revenue: "₮ 1.8M / сар",
    status: "Баталгаажсан",
    tone: "success",
  },
  {
    name: "Урангоо",
    id: "ART-188",
    specialty: "Нүүр будалт",
    area: "Чингэлтэй дүүрэг",
    rating: "Шинэ",
    bookings: "0",
    revenue: "-",
    status: "Хүлээгдэж буй",
    tone: "warning",
  },
];

export default function ArtistsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/artists"
      title="Артистуудын удирдлага"
      description="Хувиараа ажиллах мэргэжилтнүүдийн хяналт."
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт артист" value="342" delta="+12" icon={Paintbrush} />
          <StatCard label="Баталгаажсан" value="318" icon={BadgeCheck} />
          <StatCard label="Хүлээгдэж буй" value="18" icon={Clock} />
          <StatCard label="Идэвхгүй" value="6" icon={PowerOff} />
        </div>

        <Panel>
          <div className="flex flex-col gap-4">
            <FilterTabs
              tabs={["Бүгд", "Баталгаажсан", "Хүлээгдэж буй", "Хориглогдсон"]}
              active="Бүгд"
            />
            <Toolbar
              placeholder="Артист хайх..."
              filters={[
                {
                  label: "Мэргэжил",
                  options: ["Бүх мэргэжил", "Үсчин", "Хумс", "Нүүр будалт"],
                },
              ]}
            />

            <Table
              headers={["Артист", "Мэргэжил / Байршил", "Үнэлгээ", "Үзүүлэлт", "Төлөв", "Үйлдэл"]}
            >
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={r.name} />
                      <span>
                        <span className="block text-sm font-medium text-ink">{r.name}</span>
                        <span className="block text-xs text-muted">ID: {r.id}</span>
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="block text-sm text-ink">{r.specialty}</span>
                    <span className="block text-xs text-muted">{r.area}</span>
                  </Td>
                  <Td>
                    {r.rating === "Шинэ" ? (
                      <Badge tone="primary">Шинэ</Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-ink">
                        <Star className="size-3.5 fill-primary text-primary" />
                        {r.rating}
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

            <Pagination summary="Нийт 342-оос 1-10 харуулж байна" />
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
