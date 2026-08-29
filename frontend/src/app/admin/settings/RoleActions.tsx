"use client";

import { useActionState } from "react";
import { setUserRole } from "@/lib/admin/actions";

/**
 * Админ томилох / чөлөөлөх.
 *
 * Энэ бол `super_admin` эрх олгох ЦОРЫН ГАНЦ зөвшөөрөгдсөн зам — 0018-аас
 * хойш хэрэглэгч өөрийн role-оо өөрчилж чадахгүй.
 */
export function RoleActions({
  userId,
  role,
  /** Хуучин role — админаас чөлөөлөхөд буцаах утга. */
  previousRole,
}: {
  userId: string;
  role: string;
  previousRole: string;
}) {
  const [state, submit, pending] = useActionState(setUserRole, null);
  const promoting = role !== "super_admin";

  return (
    <div className="flex flex-col items-start gap-1">
      <form action={submit}>
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="role" value={promoting ? "super_admin" : previousRole} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
        >
          {promoting ? "Админ болгох" : "Админаас чөлөөлөх"}
        </button>
      </form>
      {state?.error && <p className="text-xs text-[#991b1b]">{state.error}</p>}
    </div>
  );
}
