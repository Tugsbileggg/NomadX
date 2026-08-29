import type { LucideIcon } from "lucide-react";

/** Схемд харгалзах хүснэгт хараахан байхгүй хэсгүүдэд ашиглах шударах placeholder. */
export function AdminComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-variant bg-white px-6 py-20 text-center shadow-hairline">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-tint">
        <Icon className="size-7 text-primary" strokeWidth={1.6} />
      </span>
      <h2 className="text-lg leading-6 font-medium text-ink">{title}</h2>
      <p className="max-w-[420px] text-sm leading-5 text-body">{description}</p>
      <span className="rounded-full bg-surface-tint-2 px-4 py-2 text-xs font-medium text-primary">
        Тун удахгүй
      </span>
    </div>
  );
}
