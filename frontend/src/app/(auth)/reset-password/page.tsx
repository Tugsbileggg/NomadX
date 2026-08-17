import Link from "next/link";
import { AuthPanel, AuthSplit } from "@/components/auth/AuthSplit";
import { NewPasswordForm } from "./NewPasswordForm";

export const metadata = { title: "Шинэ нууц үг — LUMINA" };

export default function ResetPasswordPage() {
  return (
    <AuthSplit>
      <AuthPanel>
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[28px] leading-9 font-semibold text-primary">
            Шинэ нууц үг үүсгэх
          </h1>
          <p className="max-w-[352px] text-base text-body">
            Өмнөх нууц үгээс ялгаатай, хүчтэй нууц үг сонгоно уу
          </p>
        </div>

        <NewPasswordForm />
      </AuthPanel>

      <p className="text-center text-sm text-body">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Нэвтрэх хуудас руу буцах
        </Link>
      </p>
    </AuthSplit>
  );
}
