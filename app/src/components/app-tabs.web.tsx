import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, Text, View, StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing, type BrandPalette } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

const ITEMS: { name: string; href: Href; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'home', href: '/', label: 'Нүүр', icon: 'home-outline' },
  { name: 'search', href: '/search', label: 'Хайх', icon: 'search-outline' },
  { name: 'ai-advisor', href: '/ai-advisor', label: 'AI Зөвлөгөө', icon: 'sparkles-outline' },
  { name: 'bookings', href: '/bookings', label: 'Захиалга', icon: 'calendar-outline' },
  { name: 'profile', href: '/profile', label: 'Профайл', icon: 'person-outline' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {ITEMS.map((item) => (
            <TabTrigger key={item.name} name={item.name} href={item.href} asChild>
              <TabButton icon={item.icon}>{item.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButtonView, pressed && styles.pressed]}>
      <Ionicons name={icon} size={18} color={isFocused ? colors.primary : colors.muted} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{children}</Text>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    tabListContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: Spacing.two,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    innerContainer: {
      backgroundColor: colors.surface,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexGrow: 1,
      maxWidth: MaxContentWidth,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -2 },
    },
    pressed: { opacity: 0.7 },
    tabButtonView: {
      alignItems: 'center',
      gap: 2,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
      borderRadius: Spacing.three,
    },
    tabLabel: { fontSize: 10, fontWeight: '600', color: colors.muted },
    tabLabelActive: { color: colors.primary },
  });
}
