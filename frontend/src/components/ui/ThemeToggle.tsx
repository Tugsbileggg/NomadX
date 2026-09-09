"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/** Горим солигдсоныг товчнууддаа мэдэгдэх суваг (олон толгойд байж болно). */
const THEME_EVENT = "lumina:theme";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

/** Цорын ганц үнэн бол DOM өөрөө — React дотор хуулбар хадгалахгүй. */
function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/**
 * Цайвар ↔ бараан горим солих товч.
 *
 * Товч нь `<html data-theme>`-ийг л сольдог; өнгө бүрийг globals.css дэх
 * токенууд шийднэ.
 *
 * Сервер нь хэрэглэгчийн сонголтыг мэдэхгүй (`theme.ts`-ийн тайлбарыг
 * үзнэ үү) тул төлвийг `useSyncExternalStore`-оор уншив: серверийн
 * хувилбар `null` буцаана — эхний render дүрсгүй гарч, hydrate болмогц
 * зөв дүрс орно. `useState` + `useEffect` байсан бол буруу дүрс нэг
 * агшин анивчина.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Сонголт хадгалагдахгүй ч энэ хуудсанд горим солигдсон хэвээр.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Цайвар горимд шилжих" : "Бараан горимд шилжих"}
      aria-pressed={isDark}
      title={isDark ? "Цайвар горим" : "Бараан горим"}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-tint",
        className,
      )}
    >
      {theme === null ? (
        // Горим тодорхойгүй байх хэсэг хугацаанд байрлалаа хадгална.
        <span className="size-5" />
      ) : isDark ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
