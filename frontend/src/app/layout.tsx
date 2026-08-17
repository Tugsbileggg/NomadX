import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

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
    <html lang="mn" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
