import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Centred split card — image panel on the left, form on the right.
 * Used by the login and register screens.
 */
export function AuthCard({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-tint px-6 py-14">
      {/* soft colour blooms behind the card */}
      <div
        aria-hidden
        className="absolute -top-20 -left-32 h-[376px] w-[640px] rounded-full bg-primary-container blur-3xl"
      />
      <div
        aria-hidden
        className="absolute right-0 bottom-0 h-[300px] w-[512px] rounded-full bg-primary-accent blur-3xl"
      />

      <div className="glass-strong relative flex w-full max-w-[1000px] overflow-hidden rounded-4xl shadow-float">
        <div className="relative hidden w-[499px] shrink-0 bg-surface-variant lg:block">
          <Image src="/img/auth-room.jpg" alt="" fill sizes="499px" className="object-cover" />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-[rgba(138,72,83,0.6)] to-transparent"
          />
          <div className="absolute right-6 bottom-6 left-6">
            <Link href="/" className="text-[40px] leading-[48px] font-semibold text-white">
              LUMINA
            </Link>
            <p className="mt-2 text-lg leading-6 font-medium text-white">
              Гоо сайхан, амралтын таны орон зай.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-10 py-8">
          {children}
          <div className="mt-6 flex items-center justify-center gap-1 pt-6">{footer}</div>
        </div>
      </div>
    </div>
  );
}

/** Google / phone sign-in row shared by login and register. */
export function SocialRow() {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-outline bg-white text-xs leading-4 font-medium text-ink hover:bg-surface-tint"
      >
        <Image src="/img/icon-gmail.png" alt="" width={21} height={22} />
        Google-ээр
      </button>
      <button
        type="button"
        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-outline bg-white text-xs leading-4 font-medium text-ink hover:bg-surface-tint"
      >
        <PhoneGlyph />
        Утасны дугаараар
      </button>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg width="15" height="22" viewBox="0 0 15 22" fill="none" aria-hidden>
      <rect x="0.75" y="0.75" width="13.5" height="20.5" rx="2.25" stroke="#211a1b" strokeWidth="1.5" />
      <circle cx="7.5" cy="18" r="1" fill="#211a1b" />
    </svg>
  );
}
