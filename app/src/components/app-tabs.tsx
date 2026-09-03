import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/FloatingTabBar';

/**
 * Харилцагчийн доод цэс.
 *
 * `NativeTabs` (платформын өөрийн цэс) -ийг орлуулав: тэр нь өнгө, дүрс,
 * гарчгийг л тохируулах боломж өгдөг бөгөөд хөвөгч бие, ховил, өргөгдсөн
 * идэвхтэй таб зэрэг хэлбэрийг огт зөвшөөрдөггүй. Цэсний бүх зураглал
 * одоо `FloatingTabBar` дотор.
 *
 * ⚠️ Гарчиг нь дэлгэц дээр харагдахгүй — дизайн нь зөвхөн дүрстэй.
 * `title` нь дэлгэц уншигчид (accessibility) хэвээр хэрэгтэй тул үлдээв.
 */
export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Хайх',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ai-advisor"
        options={{
          title: 'AI Зөвлөгөө',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Захиалга',
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
