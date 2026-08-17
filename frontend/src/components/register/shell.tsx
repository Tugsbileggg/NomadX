import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const WIZARD_STEPS = [
  "Төрөл",
  "Мэдээлэл",
  "Баримт бичиг",
  "Гэрээ",
  "Хянах",
] as const;

/** Slim brand bar with an exit affordance (steps 1–2). */
export function RegisterTopBar({ exit = true }: { exit?: boolean }) {
  return (
    <header className="glass sticky top-0 z-40">
      <div className="mx-auto flex h-[82px] max-w-[1200px] items-center justify-between px-10">
        <Link href="/" className="text-[28px] leading-9 font-semibold text-primary">
          LUMINA
        </Link>
        {exit && (
          <Link
            href="/"
            className="flex items-center gap-2 text-xs leading-4 font-medium text-body hover:text-primary"
          >
            <X className="size-4" />
            Гарах
          </Link>
        )}
      </div>
    </header>
  );
}

/** Numbered 5-step tracker with a filled connector behind it (step 1). */
export function StepTracker({ current }: { current: number }) {
  return (
    <div className="relative flex w-full max-w-[848px] items-start justify-between">
      <div className="absolute top-3.5 right-0 left-0 h-1 rounded-full bg-surface-variant">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((current - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {WIZARD_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n <= current;
        return (
          <div key={label} className="relative flex flex-col items-center gap-2">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs leading-4 font-medium shadow-hairline",
                done
                  ? "bg-primary text-white"
                  : "border border-outline bg-surface-tint-3 text-body",
              )}
            >
              {n}
            </span>
            <span
              className={cn(
                "text-xs leading-4 font-medium whitespace-nowrap",
                done ? "text-primary" : "text-body",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Labelled progress bar used on steps 2 and 5. */
export function StepProgress({
  current,
  total = 5,
  right,
}: {
  current: number;
  total?: number;
  right: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs leading-4 font-medium text-body">
        <span>
          Алхам {current}/{total}
        </span>
        <span>{right}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Frosted panel that holds each step's form. */
export function StepCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-white/40 bg-white/60 p-12 shadow-soft backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Pink-filled input used throughout the registration wizard. */
export function SoftInput({
  label,
  className,
  ...props
}: { label?: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-1 flex-col gap-2">
      {label && <span className="text-xs leading-4 font-medium text-body">{label}</span>}
      <input
        className={cn(
          "h-[51px] w-full rounded-lg bg-surface-tint px-4 text-base text-ink",
          "placeholder:text-[rgba(133,115,116,0.6)] focus:outline-2 focus:outline-primary",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function SoftSelect({
  label,
  children,
  className,
  ...props
}: { label?: string } & React.ComponentProps<"select">) {
  return (
    <label className="flex flex-1 flex-col gap-2">
      {label && <span className="text-xs leading-4 font-medium text-body">{label}</span>}
      <select
        className={cn(
          "h-[50px] w-full rounded-lg bg-surface-tint px-4 text-base text-ink",
          "focus:outline-2 focus:outline-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg leading-6 font-semibold text-ink">{children}</h2>;
}
