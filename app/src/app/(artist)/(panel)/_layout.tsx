import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

/**
 * Артистын ажлын самбар.
 *
 * Харилцагчийн tab-аас тусдаа — нэг хүн хоёуланг нь зэрэг харахгүй.
 * Эхний ээлжид өдөр тутмын гурав; үлдсэн хэсэг (үйлчилгээ, бүтээл,
 * сэтгэгдэл, харилцагчид) дараа нэмэгдэнэ.
 */
export default function ArtistPanelTabs() {
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
      <NativeTabs.Trigger name="bookings">
        <Label>Захиалга</Label>
        <Icon src={<VectorIcon family={Ionicons} name="clipboard-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Label>Календарь</Label>
        <Icon src={<VectorIcon family={Ionicons} name="calendar-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Профайл</Label>
        <Icon src={<VectorIcon family={Ionicons} name="person-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
