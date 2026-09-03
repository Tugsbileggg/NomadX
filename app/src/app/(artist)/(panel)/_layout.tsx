import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/FloatingTabBar';

/**
 * Артистын ажлын самбар.
 *
 * Харилцагчийн tab-аас тусдаа — нэг хүн хоёуланг нь зэрэг харахгүй.
 * Эхний ээлжид өдөр тутмын гурав; үлдсэн хэсэг (үйлчилгээ, бүтээл,
 * сэтгэгдэл, харилцагчид) дараа нэмэгдэнэ.
 *
 * Цэсний харагдац нь харилцагчийн талтай ижил — `FloatingTabBar`-ыг
 * хоёулаа хуваалцана.
 */
export default function ArtistPanelTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Захиалга',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Календарь',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
