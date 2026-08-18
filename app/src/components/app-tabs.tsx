import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ color: colors.text }}>
      <NativeTabs.Trigger name="index">
        <Label>Нүүр</Label>
        <Icon src={<VectorIcon family={Ionicons} name="home-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Label>Хайх</Label>
        <Icon src={<VectorIcon family={Ionicons} name="search-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ai-advisor">
        <Label>AI Зөвлөгөө</Label>
        <Icon src={<VectorIcon family={Ionicons} name="sparkles-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookings">
        <Label>Захиалга</Label>
        <Icon src={<VectorIcon family={Ionicons} name="calendar-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Профайл</Label>
        <Icon src={<VectorIcon family={Ionicons} name="person-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
