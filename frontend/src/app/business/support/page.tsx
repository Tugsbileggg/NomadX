import { BookOpen, Mail, MessageCircle, Phone } from "lucide-react";
import { BusinessShell, PageHeader } from "@/components/business/BusinessShell";
import { BIZ_BRAND, BIZ_FOOTER_NAV, BIZ_NAV } from "@/components/business/nav";
import { Panel } from "@/components/admin/kit";

export const metadata = { title: "Тусламж — Салоны админ" };

/**
 * The sidebar's Support link has no Figma frame; this reuses the console's
 * card patterns for the standard contact routes.
 */
const CHANNELS = [
  {
    icon: MessageCircle,
    title: "Чат дэмжлэг",
    body: "Ажлын өдрүүдэд 09:00 - 18:00 цагт шуурхай хариулна.",
    action: "Чат эхлүүлэх",
  },
  {
    icon: Phone,
    title: "Утсаар холбогдох",
    body: "+976 7700 0000",
    action: "Залгах",
  },
  {
    icon: Mail,
    title: "И-мэйл",
    body: "support@lumina.mn",
    action: "И-мэйл бичих",
  },
  {
    icon: BookOpen,
    title: "Гарын авлага",
    body: "Систем ашиглах зааварчилгаа, түгээмэл асуултууд.",
    action: "Нээх",
  },
];

export default function BusinessSupportPage() {
  return (
    <BusinessShell
      brand={BIZ_BRAND}
      subtitle="Админ самбар"
      nav={BIZ_NAV}
      footerNav={BIZ_FOOTER_NAV}
      active="/business/support"
      ctaHref="/business/bookings/new"
    >
      <PageHeader title="Тусламж" description="Танд туслах хэрэгтэй юу? Бидэнтэй холбогдоорой." />

      <div className="grid max-w-[880px] gap-6 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <Panel key={c.title}>
            <div className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-surface-tint">
                <c.icon className="size-5 text-primary" strokeWidth={1.8} />
              </span>
              <h2 className="text-base leading-6 font-medium text-ink">{c.title}</h2>
              <p className="text-sm leading-5 text-body">{c.body}</p>
              <button
                type="button"
                className="mt-2 h-10 self-start rounded-full border border-outline bg-white px-5 text-xs font-medium text-primary hover:bg-surface-tint"
              >
                {c.action}
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </BusinessShell>
  );
}
