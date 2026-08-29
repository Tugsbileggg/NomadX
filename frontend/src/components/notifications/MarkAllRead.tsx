"use client";

import { useActionState } from "react";
import { CheckCheck } from "lucide-react";

import { markAllNotificationsRead } from "@/lib/notifications/actions";

/** "Бүгдийг уншсан болгох" — маягтын талбар шаардахгүй тул шууд action. */
export function MarkAllRead() {
  const [state, run, pending] = useActionState(markAllNotificationsRead, null);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={run}>
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center gap-2 rounded-full border border-outline bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint disabled:opacity-60"
        >
          <CheckCheck className="size-4" />
          Бүгдийг уншсан болгох
        </button>
      </form>
      {state?.error && <p className="text-xs text-[#991b1b]">{state.error}</p>}
    </div>
  );
}
