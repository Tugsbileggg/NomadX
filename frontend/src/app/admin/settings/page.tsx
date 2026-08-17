import { ImageUp } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SUPER_BRAND, SUPER_NAV, SUPER_USER } from "@/components/admin/super-nav";
import { Panel } from "@/components/admin/kit";

export const metadata = { title: "Тохиргоо — Супер админ" };

const TABS = [
  "Ерөнхий",
  "Комисс тохиргоо",
  "Админ эрх",
  "Мэдэгдэл",
  "Нууцлал & Аюулгүй байдал",
];

export default function SettingsPage() {
  return (
    <AdminShell
      {...SUPER_BRAND}
      nav={SUPER_NAV}
      user={SUPER_USER}
      active="/admin/settings"
      title="Тохиргоо"
      description="Системийн ерөнхий тохиргоо, аюулгүй байдал, админ эрхийг удирдана."
    >
      <div className="flex flex-col gap-6">
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

        <Panel>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs leading-4 font-medium text-body">Платформын лого</span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-surface-tint/60 px-6 py-10 text-center hover:border-primary">
                <ImageUp className="size-7 text-primary" strokeWidth={1.6} />
                <span className="text-sm font-medium text-primary">
                  Логогоо энд чирж оруулах эсвэл дарж сонгоно уу
                </span>
                <span className="text-xs text-muted">
                  Тохиромжтой хэмжээ: 512x512px (PNG, SVG)
                </span>
                <input type="file" accept="image/*" className="sr-only" />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Setting label="Платформын нэр" defaultValue="LUMINA" />
              <SettingSelect label="Үндсэн хэл" options={["Монгол (MN)", "Англи (EN)"]} />
              <Setting label="Тусламжийн и-мэйл" type="email" defaultValue="support@lumina.mn" />
              <Setting label="Тусламжийн утас" type="tel" defaultValue="+976 7700 0000" />
            </div>

            <div className="flex justify-end gap-3 border-t border-surface-tint pt-6">
              <button
                type="button"
                className="h-10 rounded-full border border-surface-variant bg-white px-6 text-sm font-medium text-body hover:bg-surface-tint"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}

function Setting({
  label,
  ...props
}: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-surface-variant bg-white px-4 text-sm text-ink focus:border-primary focus:outline-none"
        {...props}
      />
    </label>
  );
}

function SettingSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs leading-4 font-medium text-body">{label}</span>
      <select className="h-11 w-full rounded-lg border border-surface-variant bg-white px-4 text-sm text-ink focus:border-primary focus:outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
