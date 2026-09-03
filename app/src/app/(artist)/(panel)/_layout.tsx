import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { FloatingTabBar, TabButton } from '@/components/FloatingTabBar';

/**
 * Артистын ажлын самбар.
 *
 * Харилцагчийн tab-аас тусдаа — нэг хүн хоёуланг нь зэрэг харахгүй.
 * Цэсний харагдац нь харилцагчийн талтай ижил: `FloatingTabBar`-ыг
 * хоёулаа хуваалцана.
 */
export default function ArtistPanelTabs() {
  return (
    <Tabs>
      <TabSlot />

      <TabList asChild>
        <FloatingTabBar>
          <TabTrigger name="bookings" href="/bookings" asChild>
            <TabButton icon="clipboard-outline" />
          </TabTrigger>

          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton icon="calendar-outline" />
          </TabTrigger>

          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="person-outline" />
          </TabTrigger>
        </FloatingTabBar>
      </TabList>
    </Tabs>
  );
}
