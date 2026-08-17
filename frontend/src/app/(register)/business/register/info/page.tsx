import Link from "next/link";
import { Camera, ImagePlus, MapPin, Upload } from "lucide-react";
import {
  RegisterTopBar,
  SectionTitle,
  SoftInput,
  SoftSelect,
  StepCard,
  StepProgress,
} from "@/components/register/shell";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveBusinessInfo } from "@/lib/registration/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Бизнес бүртгэл — Үндсэн мэдээлэл" };

const SERVICE_TAGS = ["Гоо сайхан", "Үсчин", "Хумс", "Спа, Массаж", "Арьс арчилгаа"];

export default async function BusinessInfoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, email, phone, address, staff_size")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const [{ data: hours }, { data: categories }] = await Promise.all([
    supabase
      .from("business_hours")
      .select("open_time, close_time")
      .eq("business_id", business?.id ?? "")
      .limit(1),
    supabase
      .from("business_categories")
      .select("category")
      .eq("business_id", business?.id ?? ""),
  ]);

  const chosen = new Set((categories ?? []).map((c) => c.category));
  const open = hours?.[0]?.open_time?.slice(0, 5) ?? "09:00";
  const close = hours?.[0]?.close_time?.slice(0, 5) ?? "20:00";

  return (
    <div className="bg-aurora min-h-screen">
      <RegisterTopBar />

      <main className="mx-auto flex max-w-[752px] flex-col gap-8 px-6 py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-9 font-semibold text-ink">Үндсэн мэдээлэл</h1>
          <p className="text-base text-body">
            Таны салон/төвийн талаарх дэлгэрэнгүй мэдээлэл.
          </p>
        </div>

        <StepProgress current={2} right="Үндсэн мэдээлэл" />

        <ActionForm action={saveBusinessInfo}>
          <StepCard className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
              <SectionTitle>Зураг оруулах</SectionTitle>
              <div className="flex flex-wrap items-start gap-8">
                <UploadZone
                  name="cover"
                  className="h-[156px] flex-1 rounded-2xl"
                  icon={<ImagePlus className="size-7 text-primary" strokeWidth={1.6} />}
                  label="Ковер зураг оруулах (16:9)"
                />
                <div className="flex flex-col items-center gap-2">
                  <UploadZone
                    name="logo"
                    className="size-[124px] rounded-full"
                    icon={<Camera className="size-6 text-primary" strokeWidth={1.6} />}
                  />
                  <span className="text-xs leading-4 text-body">Лого</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 border-t border-white/60 pt-8">
              <SectionTitle>Ерөнхий мэдээлэл</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <SoftInput
                  label="Салоны нэр"
                  name="name"
                  defaultValue={business?.name ?? ""}
                  placeholder="Жишээ: Lumina Spa"
                  required
                />
                <SoftInput
                  label="И-мэйл"
                  name="email"
                  type="email"
                  defaultValue={business?.email ?? ""}
                  placeholder="contact@luminaspa.mn"
                />
                <SoftInput
                  label="Утасны дугаар"
                  name="phone"
                  type="tel"
                  defaultValue={business?.phone ?? ""}
                  placeholder="+976 9900 1122"
                />
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-xs leading-4 font-medium text-body">Хаяг</span>
                <div className="flex gap-2">
                  <input
                    name="address"
                    defaultValue={business?.address ?? ""}
                    placeholder="Дэлгэрэнгүй хаяг оруулах"
                    className="h-[51px] flex-1 rounded-lg bg-surface-tint px-4 text-base text-ink placeholder:text-[rgba(133,115,116,0.6)] focus:outline-2 focus:outline-primary"
                  />
                  <button
                    type="button"
                    aria-label="Газрын зураг дээрээс сонгох"
                    className="flex size-[51px] items-center justify-center rounded-lg border border-outline bg-white text-primary hover:bg-surface-tint"
                  >
                    <MapPin className="size-5" />
                  </button>
                </div>
              </label>
            </section>

            <section className="flex flex-col gap-4 border-t border-white/60 pt-8">
              <SectionTitle>Үйл ажиллагаа</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs leading-4 font-medium text-body">Ажлын цаг</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      name="open_time"
                      defaultValue={open}
                      aria-label="Нээх цаг"
                      className="h-[50px] flex-1 rounded-lg bg-surface-tint px-4 text-base text-ink focus:outline-2 focus:outline-primary"
                    />
                    <span className="text-body">-</span>
                    <input
                      type="time"
                      name="close_time"
                      defaultValue={close}
                      aria-label="Хаах цаг"
                      className="h-[50px] flex-1 rounded-lg bg-surface-tint px-4 text-base text-ink focus:outline-2 focus:outline-primary"
                    />
                  </div>
                </div>

                <SoftSelect
                  label="Ажилтнуудын тоо"
                  name="staff_size"
                  defaultValue={business?.staff_size ?? "1-5"}
                >
                  <option value="1-5">1-5 хүн</option>
                  <option value="6-15">6-15 хүн</option>
                  <option value="16+">16+ хүн</option>
                </SoftSelect>
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-xs leading-4 font-medium text-body">
                  Үйлчилгээний төрөл (Олон сонголттой)
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TAGS.map((tag) => (
                    <label
                      key={tag}
                      className="cursor-pointer rounded-full border border-outline bg-white px-4 py-2 text-xs leading-4 font-medium text-body has-checked:border-primary has-checked:bg-primary has-checked:text-white"
                    >
                      <input
                        type="checkbox"
                        name="services"
                        value={tag}
                        defaultChecked={chosen.has(tag)}
                        className="sr-only"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="flex flex-col gap-4 border-t border-white/60 pt-8">
              <SectionTitle>Бичиг баримт</SectionTitle>
              <label className="flex flex-col gap-2">
                <span className="text-xs leading-4 font-medium text-body">
                  Улсын бүртгэлийн гэрчилгээ
                </span>
                <div className="flex items-center gap-3 rounded-lg bg-surface-tint px-4 py-3">
                  <span className="flex items-center gap-2 rounded-md border border-outline bg-white px-3 py-1.5 text-xs font-medium text-ink">
                    <Upload className="size-3.5" />
                    Файл сонгох
                  </span>
                  <span className="text-xs text-muted">Гэрчилгээ.pdf хуулбар...</span>
                  <input type="file" name="license" accept=".pdf,image/*" className="sr-only" />
                </div>
              </label>
            </section>

            <div className="flex justify-between border-t border-white/60 pt-8">
              <Link
                href="/business/register"
                className="flex h-12 items-center rounded-full border border-outline bg-white px-8 text-base font-medium text-body hover:bg-surface-tint"
              >
                Буцах
              </Link>
              <SubmitButton className="flex h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-white shadow-hairline hover:bg-primary-dark">
                Үргэлжлүүлэх
              </SubmitButton>
            </div>
          </StepCard>
        </ActionForm>
      </main>
    </div>
  );
}

function UploadZone({
  name,
  className,
  icon,
  label,
}: {
  name: string;
  className: string;
  icon: React.ReactNode;
  label?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 bg-surface-tint text-center hover:border-primary/60 ${className}`}
    >
      {icon}
      {label && <span className="px-4 text-xs leading-4 text-body">{label}</span>}
      <input type="file" name={name} accept="image/*" className="sr-only" />
    </label>
  );
}
