import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { updateBusinessProfile } from "@/lib/business-profile/actions";
import { publicAssetUrl } from "@/lib/storage/store-file";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Тохиргоо — Артистын админ" };

const TABS = [
  "Профайл",
  "Баталгаажуулалт",
  "Банк/Төлбөр",
  "Мэдэгдэл",
  "Аюулгүй байдал",
  "Гэрээ",
];

export default async function ArtistSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, phone, email, about, logo_path, cover_path")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const logoUrl = publicAssetUrl(supabase, business?.logo_path ?? null);
  const coverUrl = publicAssetUrl(supabase, business?.cover_path ?? null);
  const initial = (business?.name ?? "А").trim().charAt(0).toUpperCase();

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/settings" {...ARTIST}>
      <ActionForm action={updateBusinessProfile} className="flex flex-col gap-2">
        <ArtistPageHeader
          title="Тохиргоо"
          actions={
            <SubmitButton
              pendingLabel="Хадгалж байна..."
              className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Хадгалах
            </SubmitButton>
          }
        />
        <p className="-mt-4 pb-8 text-sm text-body">
          Студийн тохиргоо болон бүртгэлийн мэдээллээ удирдана уу.
        </p>

        <div className="flex flex-col gap-6">
          <nav className="flex flex-wrap gap-6 border-b border-outline/40">
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

          <ArtistPanel title="Ерөнхий мэдээлэл">
            <label className="group relative mb-6 flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-linear-to-r from-primary-container to-primary-accent">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
              ) : null}
              <span className="relative flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-primary group-hover:bg-white">
                <Camera className="size-3.5" />
                Ковер зураг солих
              </span>
              <input type="file" name="cover" accept="image/*" className="sr-only" />
            </label>

            <div className="flex flex-wrap items-center gap-4 border-b border-surface-tint pb-6">
              <label className="group relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary-container text-lg font-semibold text-primary-dark">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="size-full object-cover" />
                ) : (
                  initial
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100">
                  <Camera className="size-4 text-white" />
                </span>
                <input type="file" name="logo" accept="image/*" className="sr-only" />
              </label>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{business?.name || "Нэргүй"}</p>
                <p className="text-xs text-muted">{business?.email || "—"}</p>
              </div>
              <Link
                href="/artist/profile"
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                Миний профайл хуудас руу очих
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-6 grid max-w-[640px] gap-6 sm:grid-cols-2">
              <Field label="Овог нэр" name="name" defaultValue={business?.name ?? ""} required />
              <Field
                label="Утасны дугаар"
                name="phone"
                type="tel"
                defaultValue={business?.phone ?? ""}
              />
              <Field
                label="И-мэйл хаяг"
                name="email"
                type="email"
                defaultValue={business?.email ?? ""}
                className="sm:col-span-2"
              />
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs leading-4 font-medium text-body">Миний тухай</span>
                <textarea
                  name="about"
                  rows={4}
                  defaultValue={business?.about ?? ""}
                  placeholder="Туршлага, мэргэшсэн чиглэлээ товч танилцуулна уу."
                  className="w-full rounded-lg bg-surface-tint p-4 text-sm text-ink focus:outline-2 focus:outline-primary"
                />
              </label>
            </div>
          </ArtistPanel>
        </div>
      </ActionForm>
    </ArtistShell>
  );
}

function Field({
  label,
  className,
  ...props
}: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <input
        className="h-11 w-full rounded-lg bg-surface-tint px-4 text-sm text-ink focus:outline-2 focus:outline-primary"
        {...props}
      />
    </label>
  );
}
