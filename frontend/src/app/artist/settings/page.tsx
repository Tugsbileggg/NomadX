import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ArtistPageHeader,
  ArtistPanel,
  ArtistShell,
} from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";

export const metadata = { title: "Тохиргоо — Артистын админ" };

const TABS = [
  "Профайл",
  "Баталгаажуулалт",
  "Банк/Төлбөр",
  "Мэдэгдэл",
  "Аюулгүй байдал",
  "Гэрээ",
];

export default function ArtistSettingsPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/settings" {...ARTIST}>
      <ArtistPageHeader
        title="Тохиргоо"
        actions={
          <button
            type="submit"
            className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Хадгалах
          </button>
        }
      />
      <p className="-mt-6 pb-8 text-sm text-body">
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
          <div className="flex flex-wrap items-center gap-4 border-b border-surface-tint pb-6">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-container text-lg font-semibold text-primary-dark">
              С
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Сарнай Студи</p>
              <p className="text-xs text-muted">sarnai.studio@example.com</p>
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
            <Field label="Овог нэр" defaultValue="Сарнай" />
            <Field label="Утасны дугаар" type="tel" defaultValue="+976 9911 2233" />
            <Field
              label="И-мэйл хаяг"
              type="email"
              defaultValue="sarnai.studio@example.com"
              className="sm:col-span-2"
            />
          </div>
        </ArtistPanel>
      </div>
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
