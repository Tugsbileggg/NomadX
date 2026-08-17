import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

/** White panel with the design's hairline border and soft shadow. */
export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-surface-variant bg-white shadow-hairline",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
          <h2 className="text-lg leading-6 font-medium text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn(title ? "px-6 pb-6" : "p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Metric tile: caption, big number, optional delta and watermark icon. */
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline">
      {Icon && (
        <Icon
          className="absolute top-5 right-5 size-8 text-surface-variant"
          strokeWidth={1.5}
          aria-hidden
        />
      )}
      <p className="text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
        {label}
      </p>
      <p className="mt-3 text-[28px] leading-9 font-semibold text-ink">{value}</p>
      {delta && (
        <p className="mt-3 flex items-center gap-1 text-xs leading-4 font-medium text-success">
          <TrendingUp className="size-3.5" />
          {delta}
        </p>
      )}
      {hint && <p className="mt-3 text-xs leading-4 text-body">{hint}</p>}
    </div>
  );
}

const TONES = {
  neutral: "bg-surface-variant text-body",
  success: "bg-[#dcfce7] text-success-darker",
  warning: "bg-[#fef3c7] text-warning-darker",
  danger: "bg-[#fee2e2] text-[#991b1b]",
  primary: "bg-primary-container text-on-primary-container",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs leading-4 font-medium whitespace-nowrap",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Simple data table: headers plus already-rendered rows. */
export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-surface-variant">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-3 py-3 text-xs leading-4 font-medium text-muted first:pl-0 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-tint">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-4 align-middle text-sm leading-5 text-body first:pl-0 last:pr-0",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Pill tab strip that filters a list ("Бүгд / Идэвхтэй / ..."). */
export function FilterTabs({ tabs, active }: { tabs: string[]; active: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={t === active}
          className={cn(
            "rounded-full px-4 py-2 text-xs leading-4 font-medium transition-colors",
            t === active
              ? "bg-primary text-white"
              : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/** Search field plus optional selects, sitting above a table. */
export function Toolbar({
  placeholder,
  filters = [],
}: {
  placeholder: string;
  filters?: Array<{ label: string; options: string[] }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] flex-1">
        <SearchGlyph />
        <input
          type="search"
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-surface-variant bg-white pr-4 pl-10 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.label}
          aria-label={f.label}
          className="h-10 rounded-lg border border-surface-variant bg-white px-3 text-sm text-body focus:border-primary focus:outline-none"
        >
          {f.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ))}
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function Pagination({ summary, pages = 3 }: { summary: string; pages?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
      <p className="text-xs leading-4 text-body">{summary}</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
            className={cn(
              "size-8 rounded-lg text-xs font-medium",
              i === 0
                ? "bg-primary text-white"
                : "border border-surface-variant bg-white text-body hover:bg-surface-tint",
            )}
          >
            {i + 1}
          </button>
        ))}
        <span className="px-1 text-xs text-muted">...</span>
      </div>
    </div>
  );
}

/** Small round monogram used in place of a missing avatar. */
export function Monogram({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary-dark">
      {name.charAt(0)}
    </span>
  );
}

/** Labelled horizontal meter used for category / share breakdowns. */
export function MeterRow({
  label,
  percent,
  color = "bg-primary",
}: {
  label: string;
  percent: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs leading-4 font-medium text-body">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-tint">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** Weekday bar chart drawn with plain divs — no chart library needed. */
export function BarChart({
  data,
  className,
}: {
  data: Array<{ label: string; value: number; tone?: "solid" | "soft" }>;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex h-56 items-end gap-4", className)}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-3">
          {/* absolute positioning so the percentage height resolves against a
              definite containing block */}
          <div className="relative w-full flex-1">
            <div
              className={cn(
                "absolute bottom-0 w-full rounded-t-sm",
                d.tone === "soft" ? "bg-primary-container" : "bg-primary-light",
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs leading-4 text-body">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut built from a conic gradient, with the share printed in the middle. */
export function Donut({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      className="relative flex size-[72px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-primary) ${percent}%, var(--color-surface-variant) 0)`,
      }}
      role="img"
      aria-label={`${label}: ${percent}%`}
    >
      <div className="flex size-[56px] items-center justify-center rounded-full bg-white">
        <span className="text-xs leading-4 font-semibold text-ink">{percent}%</span>
      </div>
    </div>
  );
}
