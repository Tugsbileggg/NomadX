import Link from "next/link";
import { Award, Building2, Check, CreditCard, FileUp, ShieldCheck } from "lucide-react";
import { RegisterTopBar, SoftInput } from "@/components/register/shell";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveDocuments } from "@/lib/registration/actions";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const metadata = { title: "Бизнес бүртгэл — Баталгаажуулалт" };

/**
 * Figma draws this step in English with its own five-label tracker
 * (Basics → Review); the labels are translated here but the tracker's wording
 * still differs from the other steps, matching the design.
 */
const TRACK = ["Үндсэн", "Байршил", "Баталгаажуулалт", "Үйлчилгээ", "Хянах"];

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const [{ data: payout }, { data: docs }] = await Promise.all([
    supabase
      .from("payout_accounts")
      .select("bank_name, holder_name, account_number")
      .eq("business_id", business?.id ?? "")
      .maybeSingle(),
    supabase.from("documents").select("kind").eq("business_id", business?.id ?? ""),
  ]);

  const uploaded = new Set((docs ?? []).map((d) => d.kind));

  return (
    <div className="bg-aurora min-h-screen">
      <RegisterTopBar exit={false} />

      <main className="mx-auto flex max-w-[800px] flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[28px] leading-9 font-semibold text-ink">Баталгаажуулалт</h1>
          <p className="text-sm text-body">Алхам 3/5: Бизнесийн профайлаа баталгаажуулна уу.</p>
        </div>

        <div className="relative flex items-start justify-between px-4">
          <div className="absolute top-3.5 right-8 left-8 h-0.5 bg-surface-variant">
            <div className="h-full w-1/2 bg-primary" />
          </div>
          {TRACK.map((label, i) => {
            const done = i < 2;
            const active = i === 2;
            return (
              <div key={label} className="relative flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold",
                    done || active
                      ? "bg-primary text-white"
                      : "border border-outline bg-surface-tint-3 text-muted",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    active ? "text-primary" : done ? "text-body" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <ActionForm action={saveDocuments} className="flex flex-col gap-8">
        <section className="rounded-2xl bg-white p-8 shadow-soft">
          <h2 className="flex items-center gap-2 text-base font-semibold text-primary">
            <ShieldCheck className="size-5" />
            Иргэний үнэмлэх баталгаажуулах
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {(
              [
                ["id_front", "Иргэний үнэмлэх (Урд тал)"],
                ["id_back", "Иргэний үнэмлэх (Ар тал)"],
              ] as const
            ).map(([name, label]) => (
              <div key={name} className="flex flex-col gap-2">
                <span className="text-xs text-body">{label}</span>
                <DropZone
                  name={name}
                  done={uploaded.has(name)}
                  title="Дарж оруулах эсвэл чирж тавина уу"
                  hint="PNG, JPG — 5MB хүртэл"
                  icon={<FileUp className="size-6 text-primary" strokeWidth={1.6} />}
                />
              </div>
            ))}
          </div>

          <h2 className="mt-10 flex items-center gap-2 border-t border-surface-tint pt-8 text-base font-semibold text-primary">
            <Building2 className="size-5" />
            Бизнесийн баримт бичиг
          </h2>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-body">Улсын бүртгэлийн гэрчилгээ</span>
              <DropZone
                name="license"
                done={uploaded.has("license")}
                title="PDF эсвэл зураг оруулах"
                icon={<FileUp className="size-5 text-primary" strokeWidth={1.6} />}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-body">Мэргэжлийн гэрчилгээ (заавал биш)</span>
              <DropZone
                name="certificate"
                done={uploaded.has("certificate")}
                title="Гэрчилгээ, шагнал нэмэх"
                icon={<Award className="size-5 text-primary" strokeWidth={1.6} />}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-soft">
          <h2 className="flex items-center gap-2 text-base font-semibold text-primary">
            <CreditCard className="size-5" />
            Төлбөр хүлээн авах мэдээлэл
          </h2>
          <p className="mt-2 text-xs text-body">Орлогоо хаана хүлээн авах вэ?</p>

          <div className="mt-6 flex flex-col gap-4">
            <SoftInput
              label="Банкны нэр"
              name="bank_name"
              defaultValue={payout?.bank_name ?? ""}
              placeholder="Жишээ: Хаан банк"
            />
            <SoftInput
              label="Данс эзэмшигчийн нэр"
              name="holder_name"
              defaultValue={payout?.holder_name ?? ""}
              placeholder="Данс дээрх нэртэй яг ижил"
            />
            <SoftInput
              label="Дансны дугаар"
              name="account_number"
              defaultValue={payout?.account_number ?? ""}
              placeholder="Дансны дугаараа оруулна уу"
            />
          </div>
        </section>

        <div className="flex items-center justify-between">
          <Link
            href="/business/register/info"
            className="flex h-10 items-center rounded-full border border-outline bg-white px-6 text-sm font-medium text-body hover:bg-surface-tint"
          >
            Буцах
          </Link>
          <SubmitButton className="flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark">
            Үргэлжлүүлэх
          </SubmitButton>
        </div>
        </ActionForm>
      </main>
    </div>
  );
}

function DropZone({
  name,
  title,
  hint,
  icon,
  done = false,
}: {
  name: string;
  title: string;
  hint?: string;
  icon: React.ReactNode;
  done?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center hover:border-primary",
        done ? "border-success bg-[#dcfce7]/40" : "border-primary/40 bg-surface-tint/60",
      )}
    >
      {done ? <Check className="size-6 text-success" /> : icon}
      <span className="text-xs font-medium text-primary">
        {done ? "Хуулагдсан — солих бол дарна уу" : title}
      </span>
      {hint && !done && <span className="text-[10px] text-muted">{hint}</span>}
      <input type="file" name={name} accept=".pdf,image/*" className="sr-only" />
    </label>
  );
}
