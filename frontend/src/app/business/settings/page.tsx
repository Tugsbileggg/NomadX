import { Camera, ImagePlus } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { updateBusinessProfile } from "@/lib/business-profile/actions";
import { publicAssetUrl } from "@/lib/storage/store-file";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Тохиргоо — Салоны админ" };

const TABS = [
  "Профайл",
  "Баталгаажуулалт",
  "Банк/Төлбөр",
  "Мэдэгдэл",
  "Аюулгүй байдал",
  "Гэрээ",
];

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, phone, email, address, about, logo_path, cover_path")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const logoUrl = publicAssetUrl(supabase, business?.logo_path ?? null);
  const coverUrl = publicAssetUrl(supabase, business?.cover_path ?? null);

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/settings"
      ctaHref="/business/bookings/new"
    >
      <ActionForm action={updateBusinessProfile} className="flex flex-col gap-6">
        <PageHeader
          title="Тохиргоо"
          description="Байгууллагын мэдээлэл болон системийн тохиргоо удирдах хэсэг."
          actions={
            <SubmitButton
              pendingLabel="Хадгалж байна..."
              className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Хадгалах
            </SubmitButton>
          }
        />

        <nav className="flex flex-wrap gap-6 border-b border-surface-variant">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                i === 0
                  ? "border-b-2 border-primary pb-3 text-sm font-medium text-primary"
                  : "pb-3 text-sm font-medium text-body hover:text-primary"
              }
            >
              {t}
            </button>
          ))}
        </nav>

        <Panel title="Профайл">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start gap-6">
              <UploadZone
                name="cover"
                className="h-[130px] w-[230px] rounded-2xl"
                icon={<ImagePlus className="size-6 text-primary" strokeWidth={1.6} />}
                label="Ковер зураг (16:9)"
                previewUrl={coverUrl}
              />
              <div className="flex flex-col items-center gap-2">
                <UploadZone
                  name="logo"
                  className="size-[96px] rounded-full"
                  icon={<Camera className="size-5 text-primary" strokeWidth={1.6} />}
                  previewUrl={logoUrl}
                />
                <span className="text-xs leading-4 text-body">Лого</span>
              </div>
            </div>

            <div className="grid max-w-[720px] gap-6 sm:grid-cols-2">
              <Field label="Бизнесийн нэр" name="name" defaultValue={business?.name ?? ""} required />
              <Field
                label="Утасны дугаар"
                name="phone"
                type="tel"
                defaultValue={business?.phone ?? ""}
              />
              <Field label="Хаяг" name="address" defaultValue={business?.address ?? ""} />
              <Field
                label="И-мэйл хаяг"
                name="email"
                type="email"
                defaultValue={business?.email ?? ""}
              />

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs leading-4 font-medium text-body">Танилцуулга</span>
                <textarea
                  name="about"
                  rows={4}
                  defaultValue={business?.about ?? ""}
                  placeholder="Дээд зэрэглэлийн гоо сайхан, алжаал тайлах үйлчилгээ."
                  className="w-full rounded-lg bg-surface-tint p-4 text-sm text-ink focus:outline-2 focus:outline-primary"
                />
              </label>
            </div>
          </div>
        </Panel>
      </ActionForm>
    </BusinessShell>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <input
        className="h-11 w-full rounded-lg bg-surface-tint px-4 text-sm text-ink focus:outline-2 focus:outline-primary"
        {...props}
      />
    </label>
  );
}

function UploadZone({
  name,
  className,
  icon,
  label,
  previewUrl,
}: {
  name: string;
  className: string;
  icon: React.ReactNode;
  label?: string;
  previewUrl?: string | null;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden border-2 border-dashed border-primary/30 bg-surface-tint text-center hover:border-primary/60 ${className}`}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          {icon}
          {label && <span className="px-4 text-xs leading-4 text-body">{label}</span>}
        </>
      )}
      <input type="file" name={name} accept="image/*" className="sr-only" />
    </label>
  );
}
