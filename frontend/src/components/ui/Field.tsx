import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Bordered 51px input used across every form in the design. */
export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-[51px] w-full rounded-xl border border-[#6b7280] bg-white px-4",
        "text-base text-ink placeholder:text-[rgba(82,67,69,0.4)]",
        "focus:border-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 appearance-none rounded-sm border border-outline bg-surface-page",
        "checked:border-primary checked:bg-primary",
        "checked:after:block checked:after:text-[10px] checked:after:leading-[14px] checked:after:text-white checked:after:content-['✓']",
        "text-center focus:outline-2 focus:outline-offset-1 focus:outline-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-outline" />
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <span className="h-px flex-1 bg-outline" />
    </div>
  );
}
