import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { FloatingTabBar, TabButton, type TabBarItem } from '@/components/FloatingTabBar';

const ITEMS: TabBarItem[] = [
  { icon: 'clipboard-outline', activeIcon: 'clipboard', label: 'Захиалга' },
  { icon: 'calendar-outline', activeIcon: 'calendar', label: 'Календарь' },
  { icon: 'person-outline', activeIcon: 'person', label: 'Профайл' },
];

/**
 * Артистын ажлын самбар.
 *
 * Харилцагчийн tab-аас тусдаа — нэг хүн хоёуланг нь зэрэг харахгүй.
 * Цэсний харагдац нь харилцагчийн талтай ижил: `FloatingTabBar`-ыг
 * хоёулаа хуваалцана (`components/app-tabs.tsx`).
 */
export default function ArtistPanelTabs() {
  return (
    <Tabs>
      <TabSlot />

      <TabList asChild>
        <FloatingTabBar items={ITEMS}>
          <TabTrigger name="bookings" href="/bookings" asChild>
            <TabButton index={0} {...ITEMS[0]} />
          </TabTrigger>

          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton index={1} {...ITEMS[1]} />
          </TabTrigger>

          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton index={2} {...ITEMS[2]} />
          </TabTrigger>
        </FloatingTabBar>
      </TabList>
    </Tabs>
  );
}
