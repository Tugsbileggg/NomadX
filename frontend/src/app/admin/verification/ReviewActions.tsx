"use client";

import { useActionState, useState } from "react";
import { approveBusiness, rejectBusiness } from "@/lib/admin/actions";

/** Зөвшөөрөх нь шууд, татгалзах нь шалтгаан асууна. */
export function ReviewActions({ businessId }: { businessId: string }) {
  const [approveState, approve, approving] = useActionState(approveBusiness, null);
  const [rejectState, reject, rejecting] = useActionState(rejectBusiness, null);
  const [asking, setAsking] = useState(false);

  const error = approveState?.error ?? rejectState?.error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <form action={approve}>
          <input type="hidden" name="business_id" value={businessId} />
          <button
            type="submit"
            disabled={approving}
            className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-medium text-success-darker hover:brightness-95 disabled:opacity-60"
          >
            Зөвшөөрөх
          </button>
        </form>

        <button
          type="button"
          onClick={() => setAsking((v) => !v)}
          className="rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-medium text-[#991b1b] hover:brightness-95"
        >
          Татгалзах
        </button>
      </div>

      {asking && (
        <form action={reject} className="flex flex-col gap-2">
          <input type="hidden" name="business_id" value={businessId} />
          <textarea
            name="reason"
            rows={2}
            required
            placeholder="Татгалзах шалтгаан..."
            className="w-56 rounded-lg border border-surface-variant p-2 text-xs text-ink focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={rejecting}
            className="self-start rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger-dark disabled:opacity-60"
          >
            Илгээх
          </button>
        </form>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
