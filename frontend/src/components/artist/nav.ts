import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import type { ArtistNavItem } from "./ArtistShell";

export const ARTIST = { name: "LUMINA", role: "Хувийн студи" };

export const ARTIST_NAV: ArtistNavItem[] = [
  { href: "/artist", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/artist/bookings", label: "Захиалгууд", icon: ClipboardList },
  { href: "/artist/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/artist/availability", label: "Хуваарь", icon: CalendarClock },
  { href: "/artist/services", label: "Үйлчилгээнүүд", icon: Sparkles },
  { href: "/artist/clients", label: "Харилцагчид", icon: Users },
  { href: "/artist/profile", label: "Миний профайл", icon: UserRound },
  { href: "/artist/analytics", label: "Мэдээлэл", icon: BarChart3 },
  { href: "/artist/reviews", label: "Сэтгэгдлүүд", icon: Star },
  { href: "/artist/messages", label: "Мессеж", icon: MessageSquare },
  { href: "/artist/settings", label: "Тохиргоо", icon: Settings },
];
