import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "white" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-raised hover:bg-primary-dark",
  white:
    "bg-surface text-primary shadow-raised hover:bg-surface-tint",
  outline:
    "border border-outline bg-glass/60 text-body hover:bg-surface hover:border-primary/40",
  ghost: "text-body hover:text-primary hover:bg-glass/50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-12 px-6 text-base gap-2",
  lg: "h-14 px-8 text-base gap-2",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  round?: "full" | "xl";
  className?: string;
  children?: ReactNode;
};

function classes({ variant = "primary", size = "md", round = "full", className }: BaseProps) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:pointer-events-none disabled:opacity-50",
    round === "full" ? "rounded-full" : "rounded-xl",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  round,
  className,
  ...props
}: BaseProps & ComponentProps<"button">) {
  return <button className={classes({ variant, size, round, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  round,
  className,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return <Link className={classes({ variant, size, round, className })} {...props} />;
}
