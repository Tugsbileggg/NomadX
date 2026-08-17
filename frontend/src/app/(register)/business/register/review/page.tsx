import { Building2, CheckCircle2, FileText, Image as ImageIcon } from "lucide-react";
import { RegisterTopBar } from "@/components/register/shell";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { submitRegistration } from "@/lib/registration/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Бизнес бүртгэл — Мэдээлэл шалгах" };

const DOC_LABELS: Record<string, string> = {
  id_front: "Иргэний үнэмлэх (Урд тал)",
  id_back: "Иргэний үнэмлэх (Ар тал)",
  license: "Улсын бүртгэлийн гэрчилгээ",
  certificate: "Мэргэжлийн гэрчилгээ",
  logo: "Байгууллагын лого",
  cover: "Ковер зураг",
};

const IMAGE_KINDS = new Set(["logo", "cover"]);

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, type, name, reg_number, phone, email, address")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const [{ data: categories }, { data: docs }] = await Promise.all([
    supabase
      .from("business_categories")
      .select("category")
      .eq("business_id", business?.id ?? ""),
    supabase
      .from("documents")
      .select("kind, storage_path")
      .eq("business_id", business?.id ?? ""),
  ]);

  const details = [
    { label: "Байгууллагын нэр", value: business?.name },
    { label: "Төрөл", value: business?.type === "artist" ? "Хувиараа артист" : "Салон" },
    {
      label: "Үйл ажиллагааны чиглэл",
      value: (categories ?? []).map((c) => c.category).join(", "),
    },
    { label: "Холбоо барих утас", value: business?.phone },
    { label: "И-мэйл", value: business?.email },
  ];

  return (
    <div className="bg-aurora min-h-screen">
      <RegisterTopBar exit={false} />

      <main className="mx-auto flex max-w-[720px] flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs leading-4 font-medium text-body">
            <span>Алхам 5/5: Хянах &amp; Илгээх</span>
            <span>100%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[28px] leading-9 font-semibold text-ink">Мэдээллээ шалгана уу</h1>
          <p className="text-sm text-body">
            Бүртгэлээ илгээхээс өмнө оруулсан мэдээллээ сайтар шалгана уу.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-8 shadow-soft">
          <h2 className="flex items-center gap-2 border-b border-surface-tint pb-4 text-base font-semibold text-ink">
            <Building2 className="size-5 text-primary" />
            Байгууллагын мэдээлэл
          </h2>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs leading-4 text-muted">{d.label}</dt>
                <dd className="mt-1 text-sm leading-5 font-medium text-ink">
                  {d.value || <span className="text-muted">—</span>}
                </dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-xs leading-4 text-muted">Хаяг</dt>
              <dd className="mt-1 text-sm leading-5 font-medium text-ink">
                {business?.address || <span className="text-muted">—</span>}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-soft">
          <h2 className="flex items-center gap-2 border-b border-surface-tint pb-4 text-base font-semibold text-ink">
            <FileText className="size-5 text-primary" />
            Хавсаргасан баримт бичиг
          </h2>

          {docs?.length ? (
            <ul className="mt-6 flex flex-col gap-3">
              {docs.map((d) => {
                const Icon = IMAGE_KINDS.has(d.kind) ? ImageIcon : FileText;
                return (
                  <li
                    key={d.kind}
                    className="flex items-center justify-between rounded-lg bg-surface-tint px-4 py-3"
                  >
                    <span className="flex items-center gap-3 text-sm text-body">
                      <Icon className="size-4 text-primary" />
                      {DOC_LABELS[d.kind] ?? d.kind}
                    </span>
                    <CheckCircle2 className="size-5 text-primary" />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">Одоогоор файл хавсаргаагүй байна.</p>
          )}
        </section>

        <ActionForm
          action={async () => {
            "use server";
            return submitRegistration();
          }}
          className="flex justify-center"
        >
          <SubmitButton
            pendingLabel="Илгээж байна..."
            className="h-12 rounded-full bg-primary px-12 text-base font-medium text-white shadow-hairline hover:bg-primary-dark"
          >
            Илгээх
          </SubmitButton>
        </ActionForm>
      </main>
    </div>
  );
}
