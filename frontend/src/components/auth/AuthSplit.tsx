import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Full-bleed split screen — editorial photo on the left, a frosted card on the
 * right. Used by the password-recovery, OTP and success screens.
 */
export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 bg-surface-tint-2 p-12 lg:block">
        <Image
          src="/img/auth-editorial.jpg"
          alt=""
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40"
        />
        <div className="relative flex h-full flex-col justify-between">
          <Link href="/" className="text-[40px] leading-[48px] font-semibold text-white">
            LUMINA
          </Link>
          <p className="max-w-[448px] text-lg leading-[29px] font-medium text-white">
            Шинжлэх ухаан, тайван байдлаар таны төрөлх гоо сайхныг гэрэлтүүлнэ.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-page px-6 py-24">
        <div className="flex w-full max-w-[448px] flex-col gap-8">{children}</div>
      </div>
    </div>
  );
}

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 rounded-xl border border-white/50 bg-white/70 p-10 shadow-[0_8px_32px_rgba(183,110,121,0.08)] backdrop-blur-xl">
      {children}
    </div>
  );
}
