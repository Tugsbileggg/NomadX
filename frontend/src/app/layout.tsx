import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { THEME_SCRIPT } from "@/lib/theme";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMINA — Монголын хамгийн ухаалаг гоо сайхны платформ",
  description:
    "Цаг захиалга, AI зөвлөгөө, баталгаажсан салон болон артистууд нэг дороос.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning` — доорх скрипт нь hydrate болохоос өмнө
    // `data-theme`-ийг нэмдэг тул серверийн HTML-ээс зөрөх нь ХҮЛЭЭГДСЭН.
    <html
      lang="mn"
      className={`${montserrat.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        {/* Хамгийн эхэнд, зурагдахаас өмнө ажиллана — эс тэгвээс бараан
            горимтой хэрэглэгчид цайвар өнгө анивчиж харагдана. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
