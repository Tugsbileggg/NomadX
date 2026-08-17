import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Paintbrush,
  Receipt,
  Settings,
  Store,
  Users,
} from "lucide-react";
import type { AdminUser, NavItem } from "./AdminShell";

export const SUPER_BRAND = { brand: "LUMINA", subtitle: "Супер админ самбар" };

export const SUPER_USER: AdminUser = {
  name: "Супер админ",
  email: "owner@lumina.mn",
};

export const SUPER_NAV: NavItem[] = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
  { href: "/admin/salons", label: "Салонууд", icon: Store },
  { href: "/admin/artists", label: "Артистууд", icon: Paintbrush },
  { href: "/admin/bookings", label: "Захиалгууд", icon: CalendarDays },
  { href: "/admin/transactions", label: "Гүйлгээ/Комисс", icon: Receipt },
  { href: "/admin/verification", label: "Баталгаажуулалт", icon: BadgeCheck },
  { href: "/admin/complaints", label: "Гомдол", icon: AlertTriangle },
  { href: "/admin/reviews", label: "Сэтгэгдлүүд", icon: MessageSquare },
  { href: "/admin/ai-usage", label: "AI ашиглалт", icon: Bot },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
];
