import { Flower2, Paintbrush } from "lucide-react";
import { RegisterTopBar, StepCard, StepTracker } from "@/components/register/shell";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveBusinessType } from "@/lib/registration/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Бизнес бүртгэл — Төрөл сонгох" };

const TYPES = [
  {
    id: "salon",
    icon: Flower2,
    title: "Салон",
    body: "Олон ажилтантай, тогтмол байршилтай гоо сайхан, спа үйлчилгээний газар.",
  },
  {
    id: "artist",
    icon: Paintbrush,
    title: "Хувиараа Артист",
    body: "Бие даан ажилладаг гоо сайханч, нүүр будагч, үсчин гэх мэт мэргэжилтэн.",
  },
];

export default async function BusinessTypePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Буцаж ирвэл өмнө нь сонгосон төрөл нь тэмдэглэгдсэн байна.
  const { data: business } = user
    ? await supabase
        .from("businesses")
        .select("type")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="bg-aurora min-h-screen">
      <RegisterTopBar />

      <main className="mx-auto flex max-w-[896px] flex-col items-center gap-12 px-6 py-24">
        <StepTracker current={1} />

        <StepCard className="w-full max-w-[768px]">
          <h1 className="text-center text-[28px] leading-9 font-semibold text-ink">
            Бизнесийн төрлөө сонгоно уу
          </h1>
          <p className="mt-2 text-center text-base text-body">
            Та өөрийн үйл ажиллагааны чиглэлд тохирох сонголтыг хийнэ үү.
          </p>

          <ActionForm action={saveBusinessType} className="mt-6 flex flex-col gap-6">
            <fieldset className="grid gap-6 sm:grid-cols-2">
              <legend className="sr-only">Бизнесийн төрөл</legend>
              {TYPES.map((t) => (
                <label
                  key={t.id}
                  className="group relative cursor-pointer rounded-4xl border border-white/60 bg-white/70 p-6 shadow-hairline transition-shadow has-checked:border-primary has-checked:shadow-card"
                >
                  <input
                    type="radio"
                    name="business-type"
                    value={t.id}
                    defaultChecked={business?.type === t.id}
                    className="absolute top-6 right-6 size-5 appearance-none rounded-full border border-outline checked:border-6 checked:border-primary"
                  />
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-tint">
                    <t.icon className="size-6 text-primary" strokeWidth={1.8} />
                  </span>
                  <span className="mt-6 block text-lg leading-6 font-medium text-ink">
                    {t.title}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-body">{t.body}</span>
                </label>
              ))}
            </fieldset>

            <div className="flex justify-end border-t border-white/60 pt-8">
              <SubmitButton className="flex h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-white shadow-hairline hover:bg-primary-dark">
                Үргэлжлүүлэх
              </SubmitButton>
            </div>
          </ActionForm>
        </StepCard>
      </main>
    </div>
  );
}
