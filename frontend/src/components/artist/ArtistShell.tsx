import Link from "next/link";
import { Bell, HelpCircle, LogOut, Plus, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type ArtistNavItem = { href: string; label: string; icon: LucideIcon };

/**
 * Solo-artist console: floating 288px rail on the aurora backdrop, search +
 * quick-action top bar, and a translucent content column.
 */
export function ArtistShell({
  nav,
  active,
  name,
  role,
  children,
}: {
  nav: ArtistNavItem[];
  active: string;
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-aurora flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 p-4 lg:block">
        <div className="flex h-full flex-col rounded-4xl border border-white/40 bg-white/60 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary-dark">
              {name.charAt(0)}
            </span>
            <div>
              <p className="text-sm leading-5 font-semibold text-ink">{name}</p>
              <p className="text-xs leading-4 text-muted">{role}</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
            {nav.map((item) => {
              const isActive = item.href === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-4 text-sm transition-colors",
                    isActive
                      ? "bg-primary-container font-medium text-primary-dark"
                      : "text-body hover:bg-white/70",
                  )}
                >
                  <item.icon className="size-[18px] shrink-0" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/login"
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl border border-outline bg-surface-tint text-sm font-medium text-primary hover:bg-primary-container"
          >
            <LogOut className="size-4" />
            Гарах
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 items-center justify-between gap-6 border-b border-white/20 bg-[rgba(255,248,247,0.7)] px-8 shadow-[0_1px_2px_rgba(138,72,83,0.05)]">
          <label className="relative max-w-[384px] flex-1">
            <span className="sr-only">Хайх</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Хайх..."
              className="h-11 w-full rounded-full border border-[rgba(215,193,195,0.3)] bg-surface-tint pr-4 pl-11 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-primary"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Мэдэгдэл"
              className="relative flex size-10 items-center justify-center rounded-full text-primary hover:bg-white/70"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-danger" />
            </button>
            <button
              type="button"
              aria-label="Тусламж"
              className="flex size-10 items-center justify-center rounded-full text-primary hover:bg-white/70"
            >
              <HelpCircle className="size-5" />
            </button>
            <Link
              href="/artist/bookings"
              className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Plus className="size-4" />
              Шинэ захиалга
            </Link>
            <span className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary-container text-xs font-semibold text-primary-dark">
              {name.charAt(0)}
            </span>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

export function ArtistPageHeader({
  title,
  chip,
  actions,
}: {
  title: string;
  chip?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
      <h1 className="text-[28px] leading-9 font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        {chip && (
          <span className="rounded-full bg-surface-tint px-4 py-2 text-xs font-medium text-body">
            {chip}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

/** Stat tile with an icon square and a delta chip in the corner. */
export function ArtistStat({
  label,
  value,
  suffix,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-surface-tint">
          <Icon className="size-5 text-primary" strokeWidth={1.8} />
        </span>
        {delta && (
          <span className="rounded-full bg-surface-tint px-2.5 py-1 text-xs font-medium text-primary">
            ↑ {delta}
          </span>
        )}
      </div>
      <p className="mt-5 text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
        {label}
      </p>
      <p className="mt-1 text-[28px] leading-9 font-semibold text-ink">
        {value}
        {suffix && <span className="text-base font-normal text-muted"> {suffix}</span>}
      </p>
    </div>
  );
}

/** Frosted panel matching the artist console's card treatment. */
export function ArtistPanel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/40 bg-white/70 p-6 shadow-soft backdrop-blur-xl",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-4 pb-4">
          <h2 className="text-lg leading-6 font-medium text-ink">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
