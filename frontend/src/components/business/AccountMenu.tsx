"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/auth/actions";

/**
 * Header-ийн аватар товч — дарахад тухайн салоны нэр (+ и-мэйл) болон
 * "Гарах" товчийг агуулсан цэс fade+scale-ээр унана. Лого зураг байвал
 * түүнийг, үгүй бол нэрний эхний үсгүүдийг харуулна.
 */
export function AccountMenu({
  name,
  subtitle,
  avatarUrl,
}: {
  name: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Хэрэглэгчийн цэс"
        className={cn(
          "size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white transition hover:brightness-95 focus:outline-none focus-visible:ring-primary",
          open && "ring-primary/50",
        )}
      >
        <Avatar name={name} avatarUrl={avatarUrl} className="size-9 text-xs" />
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute top-full right-0 z-50 mt-3 w-64 origin-top-right rounded-3xl border border-outline-soft bg-surface p-2 shadow-float transition duration-150 ease-out",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar name={name} avatarUrl={avatarUrl} className="size-11 shrink-0 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          </div>
        </div>

        <div className="mx-1 my-1 h-px bg-outline-soft" />

        <form action={signOut}>
          <button
            type="submit"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            className="group flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-body transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="size-4 text-muted transition-colors group-hover:text-danger" />
            Гарах
          </button>
        </form>
      </div>
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, тогтмол remote domain-гүй.
      <img src={avatarUrl} alt="" className={cn("rounded-full object-cover", className)} />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-linear-to-br from-primary-container to-primary-accent font-semibold text-primary-dark",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
