import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** `href: null` renders the item as plain text — no destination yet. */
const NAV: Array<{ href: string | null; label: string }> = [
  { href: "/", label: "Нээх" },
  { href: "/ai-advisor", label: "AI зөвлөх" },
  { href: null, label: "Бизнес эрхлэгчдэд" },
];

export function SiteHeader({ active = "/" }: { active?: string }) {
  return (
    <header className="glass sticky top-0 z-50 shadow-[0_8px_32px_rgba(140,75,85,0.05)]">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="text-[28px] leading-9 font-semibold text-primary">
          LUMINA
        </Link>

        <nav className="pill-inset hidden items-center gap-8 rounded-full px-8 py-4 md:flex">
          {NAV.map((item) => {
            const className = cn(
              "text-base transition-colors",
              item.href && active === item.href
                ? "border-b border-primary pb-1 font-bold text-primary"
                : "text-[#4c4546]",
            );

            return item.href ? (
              <Link key={item.label} href={item.href} className={cn(className, "hover:text-primary")}>
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className={className}>
                {item.label}
              </span>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Нэвтрэх
          </ButtonLink>
          <ButtonLink href="/register">Бүртгүүлэх</ButtonLink>
        </div>
      </div>
    </header>
  );
}
