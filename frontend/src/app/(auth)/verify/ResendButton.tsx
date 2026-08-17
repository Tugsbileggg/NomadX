"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { resendResetOtp } from "@/lib/auth/actions";

const COOLDOWN = 45;

/** Дахин илгээх товч — 45 секундын хугацаанд дахин дарахыг хориглоно. */
export function ResendButton({ email }: { email: string }) {
  const [seconds, setSeconds] = useState(COOLDOWN);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return (
    <button
      type="button"
      disabled={seconds > 0 || pending}
      onClick={async () => {
        setPending(true);
        const fd = new FormData();
        fd.set("email", email);
        await resendResetOtp(null, fd);
        setPending(false);
        setSeconds(COOLDOWN);
      }}
      className="flex items-center justify-center gap-2 text-xs leading-4 font-medium text-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RotateCw className="size-3" />
      {seconds > 0
        ? `Код дахин илгээх (00:${String(seconds).padStart(2, "0")})`
        : pending
          ? "Илгээж байна..."
          : "Код дахин илгээх"}
    </button>
  );
}
