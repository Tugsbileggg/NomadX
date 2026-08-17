import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type BizNavItem = { href: string; label: string; icon: LucideIcon };

/**
 * Salon / artist console layout: tinted rail with a wordmark and "new booking"
 * CTA, a search top bar, and a white content column.
 */
export function BusinessShell({
  brand,
  subtitle,
  nav,
  footerNav = [],
  active,
  ctaHref,
  ctaLabel = "Шинэ захиалга",
  avatar,
  children,
}: {
  brand: [string, string];
  subtitle: string;
  nav: BizNavItem[];
  footerNav?: BizNavItem[];
  active: string;
  ctaHref: string;
  ctaLabel?: string;
  avatar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[rgba(255,240,241,0.8)]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-white/20 bg-[rgba(255,248,247,0.8)] p-6 shadow-[24px_0_48px_rgba(140,75,85,0.08)] lg:flex">
        <div>
          <Link href="/" className="block text-[40px] leading-[48px] font-semibold text-primary">
            {brand[0]}
            {brand[1] ? (
              <>
                <br />
                {brand[1]}
              </>
            ) : null}
          </Link>
          <p className="mt-2 text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
            {subtitle}
          </p>

          <Link
            href={ctaHref}
            className="mt-10 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-lg leading-6 font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="size-3.5" />
            {ctaLabel}
          </Link>

          <nav className="mt-8 flex flex-col gap-2">
            {nav.map((item) => (
              <NavLink key={item.href} item={item} active={active} />
            ))}
          </nav>
        </div>

        {footerNav.length > 0 && (
          <nav className="flex flex-col gap-2">
            {footerNav.map((item) => (
              <NavLink key={item.href} item={item} active={active} />
            ))}
          </nav>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-20 items-center justify-between gap-6 border-b border-white/20 bg-[rgba(255,248,247,0.6)] px-4">
          <label className="relative max-w-[420px] flex-1">
            <span className="sr-only">Хайх</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Хайх..."
              className="h-10 w-full rounded-full bg-white pr-4 pl-11 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-primary"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Мэдэгдэл"
              className="flex size-10 items-center justify-center rounded-full text-primary hover:bg-white"
            >
              <Bell className="size-5" />
            </button>
            {avatar ?? (
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary-container text-xs font-semibold text-primary-dark">
                LU
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 px-10 py-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ item, active }: { item: BizNavItem; active: string }) {
  const isActive = item.href === active;
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-12 items-center gap-3 rounded-xl px-4 text-base transition-colors",
        isActive ? "bg-primary-light text-white" : "text-body hover:bg-surface-page",
      )}
    >
      <item.icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      {item.label}
    </Link>
  );
}

/** Page title block with an optional right-hand control cluster. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div>
        <h1 className="text-[28px] leading-9 font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-body">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
