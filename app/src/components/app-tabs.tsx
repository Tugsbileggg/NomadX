import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { FloatingTabBar, TabButton } from '@/components/FloatingTabBar';

/**
 * Харилцагчийн доод цэс.
 *
 * `expo-router/ui`-ийн headless tabs дээр бүтээв: expo-router нь зөвхөн
 * навигацийг хариуцаж, зураглалыг бүхэлд нь `FloatingTabBar` хийнэ.
 *
 * ⚠️ Дизайны дагуу шошго байхгүй — зөвхөн дүрс. `TabTrigger`-ийн `name`
 * нь замын нэр, `href` нь очих хаяг.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />

      <TabList asChild>
        <FloatingTabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home-outline" />
          </TabTrigger>

          <TabTrigger name="search" href="/search" asChild>
            <TabButton icon="search-outline" />
          </TabTrigger>

          <TabTrigger name="ai-advisor" href="/ai-advisor" asChild>
            <TabButton icon="sparkles-outline" />
          </TabTrigger>

          <TabTrigger name="bookings" href="/bookings" asChild>
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
