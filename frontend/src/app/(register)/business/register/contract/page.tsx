import Link from "next/link";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Checkbox } from "@/components/ui/Field";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveContract } from "@/lib/registration/actions";

export const metadata = { title: "Бизнес бүртгэл — Үйлчилгээний гэрээ" };

const BULLETS_USER = [
  "Өөрийн байгууллагын мэдээллийг үнэн зөв оруулах",
  "Үйлчлүүлэгчдийн захиалгыг цаг тухайд нь баталгаажуулах, цуцлах",
  "Үйлчилгээний чанар, аюулгүй байдлыг хангах",
];

const BULLETS_PROVIDER = [
  "Системийн хэвийн үйл ажиллагааг хангах",
  "Хэрэглэгчийн мэдээллийн нууцлалыг хадгалах",
  "Техникийн тусламж, дэмжлэг үзүүлэх",
];

export default function ContractPage() {
  return (
    <div className="bg-aurora flex min-h-screen flex-col">
      <SiteHeader active="/business" />

      <main className="mx-auto w-full max-w-[800px] flex-1 px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs leading-4 font-medium tracking-[0.6px] text-primary uppercase">
            Алхам 4 / 5
          </span>
          <h1 className="text-[28px] leading-9 font-semibold text-ink">Үйлчилгээний гэрээ</h1>
          <StepDashes current={4} />
        </div>

        <ActionForm action={saveContract}>
        <section className="mt-10 rounded-2xl border border-white/60 bg-white/70 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-surface-tint pb-4">
            <h2 className="text-base font-medium text-ink">
              Серэн платформын үйлчилгээний нөхцөл
            </h2>
            <a
              href="#"
              className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.6px] text-primary uppercase hover:underline"
            >
              Гэрээг PDF татах
              <Download className="size-3.5" />
            </a>
          </div>

          <article className="mt-6 h-[360px] overflow-y-auto pr-4 text-sm leading-6 text-body">
            <h3 className="text-center text-sm font-semibold tracking-[0.6px] text-ink uppercase">
              Үйлчилгээний гэрээ
            </h3>
            <p className="mt-4">
              Энэхүү үйлчилгээний гэрээ нь нэг талаас Серэн платформ (цаашид “Үйлчилгээ
              үзүүлэгч” гэх), нөгөө талаас системд бүртгүүлж буй байгууллага, хувь хүн (цаашид
              “Хэрэглэгч” гэх) нарын хооронд үйлчилгээ үзүүлэх, ашиглахтай холбоотой харилцааг
              зохицуулна.
            </p>

            <h4 className="mt-6 font-semibold text-ink">1. Нийтлэг үндэслэл</h4>
            <p className="mt-2">
              1.1. Энэхүү гэрээ нь хэрэглэгч Серэн платформд бүртгүүлж, үйлчилгээний нөхцөлийг
              хүлээн зөвшөөрснөөр хүчин төгөлдөр болно.
            </p>
            <p className="mt-2">
              1.2. Платформ нь эрүүл мэнд, гоо сайхны үйлчилгээ үзүүлэгчдийг үйлчлүүлэгчтэй
              холбох цахим орчин байна.
            </p>

            <h4 className="mt-6 font-semibold text-ink">2. Талуудын эрх, үүрэг</h4>
            <p className="mt-2 font-medium text-ink">2.1. Хэрэглэгчийн эрх, үүрэг:</p>
            <ul className="mt-2 list-disc pl-5">
              {BULLETS_USER.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-4 font-medium text-ink">2.2. Үйлчилгээ үзүүлэгчийн эрх, үүрэг:</p>
            <ul className="mt-2 list-disc pl-5">
              {BULLETS_PROVIDER.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <h4 className="mt-6 font-semibold text-ink">3. Төлбөр тооцоо</h4>
            <p className="mt-2">
              3.1. Платформ ашиглалтын шимтгэлийг тусдаа хавсралтаар зохицуулна.
            </p>

            <h4 className="mt-6 font-semibold text-ink">4. Бусад нөхцөл</h4>
            <p className="mt-2">
              4.1. Гэрээнд нэмэлт өөрчлөлт оруулах тохиолдолд талууд харилцан тохиролцоно.
            </p>
          </article>

          <label className="mt-6 flex items-start gap-3 border-t border-surface-tint pt-6 text-sm text-body">
            <Checkbox name="accept" className="mt-0.5" />
            Гэрээний нөхцөлийг уншиж танилцсан бөгөөд бүрэн хүлээн зөвшөөрч байна.
          </label>

          <label className="mt-6 flex flex-col gap-2">
            <span className="text-xs leading-4 font-medium text-body">
              Цахим гарын үсэг (Овог нэр)
            </span>
            <input
              name="signed_name"
              required
              placeholder="Жишээ: Бат Дорж"
              className="h-[51px] w-full rounded-lg bg-surface-tint px-4 text-base text-ink placeholder:text-[rgba(133,115,116,0.6)] focus:outline-2 focus:outline-primary"
            />
          </label>
        </section>

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/business/register/documents"
            className="flex h-12 items-center gap-2 rounded-full border border-outline bg-white px-6 text-sm font-medium text-body hover:bg-surface-tint"
          >
            <ArrowLeft className="size-4" />
            Өмнөх алхам
          </Link>
          <SubmitButton className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark">
            Үргэлжлүүлэх
            <ArrowRight className="size-4" />
          </SubmitButton>
        </div>
        </ActionForm>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Dashed rail with a dot marking the current step. */
function StepDashes({ current, total = 5 }: { current: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        if (n === current) {
          return <span key={n} className="size-3 rounded-full bg-primary" />;
        }
        return (
          <span
            key={n}
            className={`h-1 w-10 rounded-full ${n < current ? "bg-primary" : "bg-surface-variant"}`}
          />
        );
      })}
    </div>
  );
}
