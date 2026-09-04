import Link from "next/link";
import { AuthCard, SocialRow } from "@/components/auth/AuthCard";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { Checkbox, Divider, TextInput } from "@/components/ui/Field";
import { signUp } from "@/lib/auth/actions";

export const metadata = { title: "Бүртгүүлэх — LUMINA" };

export default function RegisterPage() {
  return (
    <AuthCard
      footer={
        <>
          <span className="text-base text-body">Бүртгэлтэй юу?</span>
          <Link href="/login" className="text-lg leading-6 font-medium text-primary">
            Нэвтрэх
          </Link>
        </>
      }
    >
      <ActionForm action={signUp} className="flex flex-col gap-4">
        <h1 className="text-[28px] leading-9 font-semibold text-primary">Бүртгүүлэх</h1>

        <TextInput name="full_name" placeholder="Овог нэр" autoComplete="name" required />
        <TextInput
          type="tel"
          name="phone"
          placeholder="Утасны дугаар"
          autoComplete="tel"
        />
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
          autoComplete="new-password"
          required
        />
        <TextInput
          type="password"
          name="confirm"
          placeholder="Нууц үг баталгаажуулах"
          autoComplete="new-password"
          required
        />

        <label className="flex items-start gap-2 pt-1 text-xs leading-4 text-body">
          <Checkbox name="terms" className="mt-0.5" />
          <span>
            Үйлчилгээний нөхцөл болон{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Нууцлалын бодлогыг
            </Link>{" "}
            зөвшөөрч байна
          </span>
        </label>

        <SubmitButton
          pendingLabel="Бүртгэж байна..."
          className="mt-2 h-12 rounded-xl bg-primary text-lg leading-6 font-medium text-white hover:bg-primary-dark"
        >
          Бүртгүүлэх
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
