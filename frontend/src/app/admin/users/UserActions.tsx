"use client";

import { useActionState } from "react";
import { banUser, unbanUser } from "@/lib/admin/actions";

export function UserActions({ userId, banned }: { userId: string; banned: boolean }) {
  const [banState, ban, banning] = useActionState(banUser, null);
  const [unbanState, unban, unbanning] = useActionState(unbanUser, null);
  const error = banState?.error ?? unbanState?.error;

  return (
    <div className="flex flex-col items-start gap-1">
      <form action={banned ? unban : ban}>
        <input type="hidden" name="user_id" value={userId} />
        <button
          type="submit"
          disabled={banning || unbanning}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
        >
          {banned ? "Хориг цуцлах" : "Хориглох"}
        </button>
      </form>
      {error && <p className="text-xs text-[#991b1b]">{error}</p>}
    </div>
  );
}
