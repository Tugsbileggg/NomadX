import Link from "next/link";
import { Instagram, Facebook } from "@/components/icons/Brand";

const COLUMNS = [
  {
    title: "Холбоосууд",
    links: [
      { href: "/about", label: "Бидний тухай" },
      { href: "/services", label: "Үйлчилгээ" },
      { href: "/contact", label: "Холбоо барих" },
    ],
  },
  {
    title: "Хууль эрх зүй",
    links: [
      { href: "/privacy", label: "Нууцлалын бодлого" },
      { href: "/terms", label: "Үйлчилгээний нөхцөл" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="glass px-10 py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col gap-12 md:flex-row md:gap-8">
          <div className="flex max-w-[564px] flex-1 flex-col gap-4">
            <Link href="/" className="text-[28px] leading-9 font-semibold text-primary">
              LUMINA
            </Link>
            <p className="text-base text-body">
              Монголын хамгийн ухаалаг, найдвартай гоо сайхны
              <br />
              үйлчилгээний нэгдсэн платформ.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-white shadow-[4px_4px_12px_rgba(140,75,85,0.15)] transition-transform hover:-translate-y-0.5"
                >
                  <Icon className="size-5 text-primary" strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="w-[270px] shrink-0">
              <h4 className="text-lg leading-6 font-semibold text-ink">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-base text-body hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/60 pt-8 text-center text-sm text-muted">
          © 2024 Lumina Mongolia. Бүх эрх хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
