import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Нууц үг солигдлоо — LUMINA" };

export default function PasswordChangedPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/img/auth-editorial.jpg"
          alt=""
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-[rgba(138,72,83,0.1)]" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-surface-page p-6">
        <div className="flex w-full max-w-[480px] flex-col items-center rounded-4xl border border-white/80 bg-white/70 px-12 py-14 text-center shadow-float backdrop-blur-xl">
          <div className="flex size-24 items-center justify-center rounded-full bg-surface-tint shadow-[0_12px_32px_rgba(138,72,83,0.1)]">
            <Image src="/img/success-check.jpg" alt="" width={96} height={96} className="rounded-full" />
          </div>

          <h1 className="mt-8 text-[28px] leading-9 font-semibold text-ink">Амжилттай!</h1>
          <p className="mt-4 text-base text-body">
            Таны нууц үг амжилттай шинэчлэгдлээ. Одоо шинэ нууц үгээрээ нэвтэрч болно.
          </p>

          <Link
            href="/login"
            className="mt-10 flex h-14 w-full items-center justify-center rounded-full bg-linear-to-r from-primary to-[#a85c6a] text-lg leading-6 font-medium text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:brightness-105"
          >
            Нэвтрэх
          </Link>
        </div>

        <p className="absolute bottom-14 text-lg leading-6 font-medium text-primary">LUMINA</p>
      </div>
    </div>
  );
}
