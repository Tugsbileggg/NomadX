"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * AI Зөвлөгөө зөвхөн гар утасны аппад бий (HANDOFF.md) — энд бодит хуудас
 * байхгүй тул хоёулаа нүүр хуудасны холбогдох хэсэг рүү anchor хийнэ
 * (`WhyUs`, `BusinessBanner` — `page.tsx`-ийн `id`-тай таарна).
 * `href: null` нь ирээдүйд зорилтгүй зүйл гарвал энгийн текст болгоно.
 * `sectionId` — scroll-spy-д ашиглана: тухайн хэсэг дэлгэц дээр ирэхэд л
 * энэ item идэвхжинэ (доор харна уу). "Нээх" ч зөвхөн Hero хэсэгт
 * (`id="hero"`) идэвхтэй байх ёстой тул мөн адил ажиглагдана.
 */
const NAV: Array<{ href: string | null; label: string; sectionId?: string }> = [
  { href: "/", label: "Нүүр", sectionId: "hero" },
  { href: "/#why-us", label: "Бидний тухай", sectionId: "why-us" },
  { href: "/#business", label: "Бизнес эрхлэгчдэд", sectionId: "business" },
];

const SPY_SECTION_IDS = NAV.map((item) => item.sectionId).filter(
  (id): id is string => id != null,
);

export function SiteHeader({ active = "/" }: { active?: string }) {
  // Гүйлгэхэд аль хэсэг дэлгэцний дээд хэсэгт ирснийг ажиглаад, тохирох
  // цэсийг л идэвхжүүлнэ — Hero/Яагаад бид/Бизнес аль нэгэнд байхгүй
  // үед ("Түгээмэл ангилал" гэх мэт хооронд) ямар ч цэс идэвхгүй байна.
  // `undefined` — observer хараахан анхны хариугаа өгөөгүй (эсвэл Home бус
  // хуудсанд эдгээр `id` огт байхгүй) тул `active` prop-оор л ажиллана.
  // `null` — observer ажиллаж байгаа ч одоогоор ямар ч хэсэг идэвхгүй.
  const [activeSection, setActiveSection] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const elements = SPY_SECTION_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        // Хэд хэдэн хэсэг зэрэг илэрч болно (жишээ нь Hero-гийн `py-20`
        // margin нь why-us эхлэх хүртэл давхцаж болно) — баримт бичгийн
        // эрэмбээр СҮҮЛД орсныг сонгоно, учир нь тэр нь "хэрэглэгч дөнгөж
        // орж ирсэн" хэсэг, өмнөх нь зөвхөн зайнаасаа болж давхцаж байна.
        const next =
          SPY_SECTION_IDS.filter((id) => intersecting.has(id)).pop() ?? null;
        setActiveSection(next);
      },
      // Sticky толгойн (h-20 ≈ 80px) доор, дэлгэцний дээд ~30%-д ороход л
      // "идэвхтэй" гэж тооцно — доод захын том сөрөг margin үүнийг хийнэ.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="glass sticky top-0 z-50 shadow-[0_8px_32px_rgba(140,75,85,0.05)]">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="text-[28px] leading-9 font-semibold text-primary"
        >
          LUMINA
        </Link>

        <nav className="pill-inset hidden items-center gap-8 rounded-full px-8 py-4 md:flex">
          {NAV.map((item) => {
            const isActive =
              activeSection !== undefined
                ? activeSection === item.sectionId
                : active === item.href;

            const className = cn(
              "text-base transition-colors",
              item.href && isActive
                ? "font-bold text-primary"
                : "text-[#4c4546]",
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={cn(className, "hover:text-primary")}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className={className}>
                {item.label}
              </span>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Нэвтрэх
          </ButtonLink>
          <ButtonLink href="/register">Бүртгүүлэх</ButtonLink>
        </div>
      </div>
    </header>
  );
}
