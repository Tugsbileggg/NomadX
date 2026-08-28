"use client";

import { cn } from "@/lib/cn";

/** Панелийн маягтуудад нийтлэг оролтын хэлбэр. */
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  min,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  min?: number;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        className="h-11 w-full rounded-lg bg-surface-tint px-4 text-sm text-ink focus:outline-2 focus:outline-primary"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs leading-4 font-medium tracking-[0.6px] text-body uppercase">
        {label}
      </span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg bg-surface-tint px-4 py-3 text-sm leading-5 text-ink focus:outline-2 focus:outline-primary"
      />
    </label>
  );
}

/** Идэвхтэй эсэх — тэмдэглэгээгүй үед formData-д огт ирэхгүй. */
export function ActiveToggle({ defaultChecked = true }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-body">
      <input
        type="checkbox"
        name="is_active"
        defaultChecked={defaultChecked}
        className="size-4 rounded border-outline accent-[#8a4853]"
      />
      Идэвхтэй — аппад харагдана
    </label>
  );
}

export const PRIMARY_BUTTON =
  "h-10 rounded-full bg-primary px-5 text-xs font-medium text-white hover:bg-primary-dark";

export const GHOST_BUTTON =
  "h-10 rounded-full border border-surface-variant bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint";
