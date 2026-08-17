import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { BizNavItem } from "./BusinessShell";

export const BIZ_BRAND: [string, string] = ["LUMINA", ""];

export const BIZ_NAV: BizNavItem[] = [
  { href: "/business", label: "Мэдээлэл", icon: LayoutDashboard },
  { href: "/business/bookings", label: "Захиалгууд", icon: ClipboardList },
  { href: "/business/calendar", label: "Календар", icon: CalendarDays },
  { href: "/business/availability", label: "Хуваарь", icon: CalendarClock },
  { href: "/business/services", label: "Үйлчилгээнүүд", icon: Sparkles },
  { href: "/business/employees", label: "Ажилтнууд", icon: UserRound },
  { href: "/business/customers", label: "Харилцагчид", icon: Users },
  { href: "/business/reviews", label: "Сэтгэгдлүүд", icon: MessageSquare },
];

export const BIZ_FOOTER_NAV: BizNavItem[] = [
  { href: "/business/settings", label: "Тохиргоо", icon: Settings },
  { href: "/business/support", label: "Тусламж", icon: LifeBuoy },
];
