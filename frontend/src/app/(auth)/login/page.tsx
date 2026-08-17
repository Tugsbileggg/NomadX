import Link from "next/link";
import { AuthCard, SocialRow } from "@/components/auth/AuthCard";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { Checkbox, Divider, TextInput } from "@/components/ui/Field";
import { signIn } from "@/lib/auth/actions";

export const metadata = { title: "Нэвтрэх — LUMINA" };

export default function LoginPage() {
  return (
    <AuthCard
      footer={
        <>
          <span className="text-base text-body">Бүртгэлгүй юу?</span>
          <Link href="/register" className="text-lg leading-6 font-medium text-primary">
            Бүртгүүлэх
          </Link>
        </>
      }
    >
      <h1 className="pt-10 text-[28px] leading-9 font-semibold text-primary">
        Тавтай морилно уу?
      </h1>

      <ActionForm action={signIn} className="mt-6 flex flex-col gap-4">
        <TextInput
          type="email"
          name="email"
          placeholder="И-мэйл"
          autoComplete="email"
          required
        />
        <TextInput
          type="password"
          name="password"
          placeholder="Нууц үг"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between pb-2">
          <label className="flex items-center gap-2 text-xs leading-4 font-medium text-body">
            <Checkbox name="remember" />
            Сануулах
          </label>
          <Link
            href="/forgot-password"
            className="text-xs leading-4 font-medium text-primary hover:underline"
          >
            Нууц үг мартсан?
          </Link>
        </div>

        <SubmitButton
          pendingLabel="Нэвтэрч байна..."
          className="h-12 rounded-xl bg-primary text-lg leading-6 font-medium text-white hover:bg-primary-dark"
        >
          Нэвтрэх
        </SubmitButton>
      </ActionForm>

      <div className="mt-6">
        <Divider label="эсвэл" />
      </div>
      <div className="mt-6">
        <SocialRow />
      </div>
    </AuthCard>
  );
}
