import Link from "next/link";
import { Smartphone } from "lucide-react";

export const metadata = { title: "Артистын самбар — LUMINA" };

const APP_URL = process.env.NEXT_PUBLIC_MOBILE_APP_URL;

/**
 * Артистын ажлын самбар апп руу шилжсэн.
 *
 * Хувиараа ажилладаг артист захиалгаа хөдөлгөөнтэй үедээ, гар утаснаасаа
 * удирдах нь зөв — вэб панелаар ажиллах нь бодит хэрэглээнд тохирохгүй
 * байв. Бүртгэл, захиалга, хуваарь, үйлчилгээ, бүтээл, сэтгэгдэл бүгд
 * аппад шилжсэн.
 *
 * Салон (`/business/*`) вэб панелаараа хэвээр ажиллана.
 */
export default function ArtistMovedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-tint px-6 py-16">
      <div className="w-full max-w-[440px] rounded-3xl border border-surface-variant bg-white p-8 text-center shadow-hairline">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface-tint">
          <Smartphone className="size-7 text-primary" strokeWidth={1.6} />
        </span>

        <h1 className="mt-5 text-xl leading-7 font-semibold text-ink">
          Артистын самбар апп руу шилжлээ
        </h1>
        <p className="mt-3 text-sm leading-5 text-body">
          Захиалга, хуваарь, үйлчилгээ, бүтээл, сэтгэгдэл бүгд Lumina апп дотор.
          Ижил и-мэйл, нууц үгээрээ нэвтэрнэ үү.
        </p>

        {APP_URL ? (
          <a
            href={APP_URL}
            className="mt-6 flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Апп нээх
          </a>
        ) : (
          <p className="mt-6 text-xs text-muted">
            Аппын холбоос тун удахгүй нэмэгдэнэ.
          </p>
        )}

        <p className="mt-6 text-xs leading-4 text-muted">
          Салон эрхэлдэг бол{" "}
          <Link href="/business" className="text-primary hover:underline">
            салоны панел
          </Link>{" "}
          руу орно уу.
        </p>
      </div>
    </main>
  );
}
