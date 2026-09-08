import type { Href } from "expo-router";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";

import { FloatingTabBar, TabButton, type TabBarItem } from "@/components/FloatingTabBar";

const ITEMS: (TabBarItem & { name: string; href: Href })[] = [
  {
    name: "home",
    href: "/",
    label: "Нүүр",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "search",
    href: "/search",
    label: "Хайх",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "ai-advisor",
    href: "/ai-advisor",
    label: "AI Зөвлөгөө",
    icon: "sparkles-outline",
    activeIcon: "sparkles",
  },
  {
    name: "bookings",
    href: "/bookings",
    label: "Захиалга",
    icon: "calendar-outline",
    activeIcon: "calendar",
  },
  {
    name: "profile",
    href: "/profile",
    label: "Профайл",
    icon: "person-outline",
    activeIcon: "person",
  },
];

/** Харилцагчийн доод цэс — дизайныг `FloatingTabBar`-аар артистынхтай хуваалцана. */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <FloatingTabBar items={ITEMS}>
          {ITEMS.map((item, index) => (
            <TabTrigger key={item.name} name={item.name} href={item.href} asChild>
              <TabButton
                index={index}
                icon={item.icon}
                activeIcon={item.activeIcon}
                label={item.label}
              />
            </TabTrigger>
          ))}
        </FloatingTabBar>
      </TabList>
    </Tabs>
  );
}
