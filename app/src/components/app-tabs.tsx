import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

export default function AppTabs() {
  const { scheme } = useAppTheme();
  const colors = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      // iOS дээр гүйлгэлт ирмэгтээ хүрэхэд tab bar-ын `backgroundColor` нь
      // `null`, blur нь `none` болж бүрэн тунгалаг болдог — тэгэхээр ард
      // байгаа агуулга цэсний бичгээр дамжин харагдана. Хуудас бүр өөр
      // өөрөөр харагдахгүйн тулд хаав.
      disableTransparentOnScrollEdge
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
        <Label>AI</Label>
        <Icon src={<VectorIcon family={Ionicons} name="sparkles-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookings">
        <Label>Цаг</Label>
        <Icon src={<VectorIcon family={Ionicons} name="calendar-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Хувийн</Label>
        <Icon src={<VectorIcon family={Ionicons} name="person-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
