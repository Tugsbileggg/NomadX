import Link from "next/link";
import { Phone, Star } from "lucide-react";

import { Badge, Monogram, Table, Td } from "@/components/admin/kit";
import type { PanelCustomer } from "@/lib/customers/queries";
import { cn } from "@/lib/cn";

const TABS: { label: string; value: string | null }[] = [
  { label: "Бүгд", value: null },
  { label: "Шинэ", value: "new" },
  { label: "Тогтмол", value: "regular" },
  { label: "Идэвхгүй", value: "inactive" },
];

export function CustomerTabs({ basePath, active }: { basePath: string; active: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const on = t.value === active;
        return (
          <Link
            key={t.label}
            href={t.value ? `${basePath}?filter=${t.value}` : basePath}
            className={cn(
              "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
              on
                ? "bg-primary text-white"
                : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function CustomerTable({ customers }: { customers: PanelCustomer[] }) {
  if (!customers.length) {
    return (
      <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
        Энэ шүүлтэд тохирох харилцагч алга.
      </p>
    );
  }

  return (
    <Table
      headers={["Харилцагч", "Захиалга", "Нэхэмжилсэн", "Сүүлд ирсэн", "Өгсөн оноо"]}
    >
      {customers.map((c) => (
        <tr key={c.id}>
          <Td>
            <div className="flex items-center gap-3">
              <Monogram name={c.name} />
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  {c.name}
                  {c.isNew && <Badge tone="primary">Шинэ</Badge>}
                  {c.isInactive && <Badge>Идэвхгүй</Badge>}
                </p>
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="mt-0.5 flex items-center gap-1 text-xs text-body hover:text-primary"
                  >
                    <Phone className="size-3" />
                    {c.phone}
                  </a>
                )}
              </div>
            </div>
          </Td>

          <Td>
            <span className="text-sm tabular-nums text-ink">{c.bookings}</span>
            <span className="block text-xs text-muted">{c.completed} дууссан</span>
          </Td>

          <Td className="tabular-nums">
            {c.invoiced ? (
              <span className="font-medium text-ink">{c.invoiced.toLocaleString("en-US")}₮</span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </Td>

          <Td className="tabular-nums">{formatDate(c.lastVisit)}</Td>

          <Td>
            {c.rating != null ? (
              <span className="flex items-center gap-1 text-sm tabular-nums text-ink">
                <Star className="size-3.5 fill-gold text-gold" />
                {c.rating.toFixed(1)}
              </span>
            ) : (
              <span className="text-sm text-muted">—</span>
            )}
          </Td>
        </tr>
      ))}
    </Table>
  );
}

/** "2026.08.22" — mn-MN locale энэ орчинд бүрэн дэмжигдэхгүй. */
function formatDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}
