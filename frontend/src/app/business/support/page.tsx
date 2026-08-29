import { Mail, Phone } from "lucide-react";

import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";

export const metadata = { title: "Тусламж — Салоны админ" };

/**
 * Холбоо барих мэдээллийг env-ээс авна.
 *
 * Урьд нь энд зохиомол утас, и-мэйл бичигдсэн байсан (`+976 7700 0000`,
 * `support@lumina.mn`) бөгөөд товчнууд нь юу ч хийдэггүй байв. Бодит утга
 * тохируулаагүй бол зүгээр л харуулахгүй — байхгүй сувгийг байгаа мэт
 * харуулахаас илүү шударга.
 */
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE;

/** Системийн бодит зан төлөвт тулгуурласан асуултууд. */
const FAQ = [
  {
    q: "Захиалга хэрхэн ирдэг вэ?",
    a: "Үйлчлүүлэгч гар утасны аппаас цаг сонгож, юу хийлгэхээ бичээд (хүсвэл жишээ зураг хавсаргаад) илгээнэ. Захиалга «Хүлээгдэж буй» төлөвтэй ирэх бөгөөд та «Захиалгууд» хуудаснаас баталгаажуулна.",
  },
  {
    q: "Аль цагууд үйлчлүүлэгчид харагддаг вэ?",
    a: "«Хуваарь» хуудсанд тохируулсан ажлын цаг болон цагийн нүдний уртаас автоматаар үүснэ. Амарна гэж тэмдэглэсэн өдөр, ажлын цагийн гадна цаг огт харагдахгүй. «Нэг цагт зэрэг үйлчлэх тоо» дүүрсэн цагийг ч мөн нуудаг.",
  },
  {
    q: "Үйлчилгээний үнэ яагаад захиалгад ордоггүй вэ?",
    a: "Үйлчлүүлэгч бэлэн үйлчилгээ сонгодоггүй — хүслээ чөлөөтэй бичдэг. Тиймээс «Үйлчилгээнүүд» хуудас нь үнийн цэс болж аппад харагдана. Дүнг ажил дууссаны дараа та өөрөө нэхэмжлэхэд оруулна.",
  },
  {
    q: "Нэхэмжлэхээр мөнгө шилждэг үү?",
    a: "Үгүй. Одоогийн нэхэмжлэх нь зөвхөн туршилтын бүртгэл — дүнг тэмдэглэж үйлчлүүлэгчид харуулах зорилготой. Бодит төлбөр тооцоо, банкны холболт хараахан нэмэгдээгүй.",
  },
  {
    q: "Сэтгэгдэл хэн бичиж чадах вэ?",
    a: "Зөвхөн танайд үйлчлүүлж, захиалга нь «Дууссан» төлөвт шилжсэн хүн. Нэг хүн нэг л сэтгэгдэл үлдээнэ. Та «Сэтгэгдлүүд» хуудаснаас хариу бичиж болно — хариу нь аппад сэтгэгдлийн доор харагдана.",
  },
  {
    q: "Профайлын зургаа хаанаас нэмэх вэ?",
    a: "Лого, ковер зургийг «Тохиргоо → Профайл», салоны орчин, хийсэн ажлын зургийг «Галерей» хуудаснаас нэмнэ. Мастеруудын зургийг «Ажилтнууд» хуудаснаас.",
  },
];

export default function BusinessSupportPage() {
  const channels = [
    SUPPORT_EMAIL && {
      icon: Mail,
      title: "И-мэйл",
      body: SUPPORT_EMAIL,
      href: `mailto:${SUPPORT_EMAIL}`,
      action: "И-мэйл бичих",
    },
    SUPPORT_PHONE && {
      icon: Phone,
      title: "Утсаар холбогдох",
      body: SUPPORT_PHONE,
      href: `tel:${SUPPORT_PHONE.replace(/\s/g, "")}`,
      action: "Залгах",
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    title: string;
    body: string;
    href: string;
    action: string;
  }[];

  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/support"
      ctaHref="/business/bookings/new"
    >
      <PageHeader title="Тусламж" description="Түгээмэл асуултууд болон холбоо барих мэдээлэл." />

      <div className="flex max-w-[880px] flex-col gap-6">
        {channels.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {channels.map((c) => (
              <Panel key={c.title}>
                <div className="flex flex-col gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-surface-tint">
                    <c.icon className="size-5 text-primary" strokeWidth={1.8} />
                  </span>
                  <h2 className="text-base leading-6 font-medium text-ink">{c.title}</h2>
                  <p className="text-sm leading-5 text-body">{c.body}</p>
                  <a
                    href={c.href}
                    className="mt-2 flex h-10 items-center self-start rounded-full border border-outline bg-white px-5 text-xs font-medium text-primary hover:bg-surface-tint"
                  >
                    {c.action}
                  </a>
                </div>
              </Panel>
            ))}
          </div>
        )}

        <Panel title="Түгээмэл асуултууд">
          <div className="flex flex-col divide-y divide-surface-tint">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-muted transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-5 text-body">{item.a}</p>
              </details>
            ))}
          </div>
        </Panel>

        {channels.length === 0 && (
          <p className="text-xs text-muted">
            Холбоо барих суваг тохируулаагүй байна. <code>NEXT_PUBLIC_SUPPORT_EMAIL</code>{" "}
            эсвэл <code>NEXT_PUBLIC_SUPPORT_PHONE</code> тохируулбал энд харагдана.
          </p>
        )}
      </div>
    </BusinessShell>
  );
}
