import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AuthPanel, AuthSplit } from "@/components/auth/AuthSplit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { verifyResetOtp } from "@/lib/auth/actions";
import { OtpInputs } from "./OtpInputs";
import { ResendButton } from "./ResendButton";

export const metadata = { title: "Баталгаажуулах код — LUMINA" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/forgot-password");

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
            Бид {email} хаягт 8 оронтой кодыг илгээлээ.
          </p>
        </div>

        <ActionForm action={verifyResetOtp} className="flex flex-col gap-8">
          <input type="hidden" name="email" value={email} />
          <OtpInputs />

          <ResendButton email={email} />

          <SubmitButton
            pendingLabel="Шалгаж байна..."
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-white hover:bg-primary-dark"
          >
            Баталгаажуулах
            <ArrowRight className="size-4" />
          </SubmitButton>
        </ActionForm>
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
