import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { AuthPanel, AuthSplit } from "@/components/auth/AuthSplit";
import { OtpInputs } from "./OtpInputs";

export const metadata = { title: "Баталгаажуулах код — LUMINA" };

export default function VerifyPage() {
  return (
    <AuthSplit>
      <AuthPanel>
        <Link
          href="/forgot-password"
          className="flex items-center gap-2 text-sm leading-5 font-medium text-body hover:text-primary"
        >
          <ArrowLeft className="size-3" />
          Буцах
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-9 font-semibold text-primary">
            Баталгаажуулах код оруулна уу
          </h1>
          <p className="text-base leading-[26px] text-body">
            Бид 99XX-XXXX дугаарт / u***@email.com хаягт 6 оронтой кодыг илгээлээ.
          </p>
        </div>

        <form className="flex flex-col gap-8">
          <OtpInputs />

          <button
            type="button"
            className="flex items-center justify-center gap-2 text-xs leading-4 font-medium text-muted hover:text-primary"
          >
            <RotateCw className="size-3" />
            Код дахин илгээх (00:45)
          </button>

          <button
            type="submit"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-white hover:bg-primary-dark"
          >
            Баталгаажуулах
            <ArrowRight className="size-4" />
          </button>
        </form>
      </AuthPanel>

      <p className="text-center text-sm text-body">
        Код хүлээж аваагүй юу?{" "}
        <Link href="/contact" className="font-medium text-primary hover:underline">
          Тусламж авах
        </Link>
      </p>
    </AuthSplit>
  );
}
