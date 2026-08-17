import Link from "next/link";
import { Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type AdminUser = { name: string; email: string };

/**
 * 256px rail + content column shared by the super-admin, salon-admin and
 * artist-admin consoles.
 */
export async function AdminShell({
  brand,
  subtitle,
  nav,
  user,
  active,
  title,
  description,
  actions,
  children,
}: {
  brand: string;
  subtitle: string;
  nav: NavItem[];
  user: AdminUser;
  active: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Баталгаажуулалт хүлээж буй бүртгэлийн тоог тэмдэг болгон харуулна.
  const pending = await pendingVerificationCount();

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[rgba(215,193,195,0.3)] bg-surface-page py-6 lg:flex">
        <div className="border-b border-surface-variant px-6 pb-6">
          <p className="text-lg leading-6 font-medium text-primary">{brand}</p>
          <p className="mt-1 text-xs leading-4 font-medium text-body">{subtitle}</p>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-5">
          {nav.map((item) => {
            const isActive = item.href === active;
            const badge =
              item.href === "/admin/verification"
                ? pending > 0
                  ? String(pending)
                  : undefined
                : item.badge;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-xs leading-4 font-medium transition-colors",
                  isActive
                    ? "bg-primary-container text-primary-dark"
                    : "text-body hover:bg-surface-tint",
                )}
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-xs leading-4 font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-surface-variant px-6 pt-4">
          <p className="text-xs leading-4 font-medium text-ink">{user.name}</p>
          <p className="mt-0.5 truncate text-xs leading-4 text-muted">{user.email}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-start justify-between gap-6 px-8 py-6">
          <div>
            <h1 className="text-[28px] leading-9 font-semibold text-ink">{title}</h1>
            {description && <p className="mt-1 text-sm text-body">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {actions}
            <button
              type="button"
              aria-label="Мэдэгдэл"
              className="flex size-10 items-center justify-center rounded-full text-primary hover:bg-surface-tint"
            >
              <Bell className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 bg-surface-page px-8 pt-2 pb-10">{children}</main>
      </div>
    </div>
  );
}

async function pendingVerificationCount() {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]);
    return count ?? 0;
  } catch {
    // Supabase тохируулаагүй үед самбар нь тэмдэггүйгээр ажиллана.
    return 0;
  }
}
