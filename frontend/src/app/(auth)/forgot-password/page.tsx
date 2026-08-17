import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { AuthPanel, AuthSplit } from "@/components/auth/AuthSplit";

export const metadata = { title: "Нууц үг сэргээх — LUMINA" };

export default function ForgotPasswordPage() {
  return (
    <AuthSplit>
      <AuthPanel>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm leading-5 font-medium text-body hover:text-primary"
        >
          <ArrowLeft className="size-3" />
          Нэвтрэх хуудас руу буцах
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-9 font-semibold text-primary">
            Нууц үгээ мартсан уу?
          </h1>
          <p className="text-base leading-[26px] text-body">
            Санаа зоволтгүй! Бүртгэлтэй утасны дугаар эсвэл и-мэйл хаягаа оруулна уу, бид танд
            баталгаажуулах код илгээх болно.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="identifier"
              className="text-xs leading-4 font-medium text-body"
            >
              Утас/И-мэйл
            </label>
            <input
              id="identifier"
              name="identifier"
              placeholder="Утас эсвэл и-мэйл хаяг"
              className="h-14 w-full rounded-xl bg-surface-tint px-4 text-base font-medium text-ink placeholder:text-[rgba(133,115,116,0.5)] focus:outline-2 focus:outline-primary"
            />
          </div>

          <button
            type="submit"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-white hover:bg-primary-dark"
          >
            Код илгээх
            <Send className="size-4" />
          </button>
        </form>
      </AuthPanel>

      <p className="text-center text-sm text-body">
        Тусламж хэрэгтэй юу?{" "}
        <Link href="/contact" className="font-medium text-primary hover:underline">
          Бидэнтэй холбогдох
        </Link>
      </p>
    </AuthSplit>
  );
}
