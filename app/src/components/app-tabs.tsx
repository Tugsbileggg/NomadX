import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

/**
 * Вэб дээр таб-ын дүрсийг зурахгүй.
 *
 * `NativeTabs` нь дүрсээ зурахдаа `@expo/vector-icons`-ийн
 * `getImageSource()`-ийг дуудах ба тэр нь `expo-font.renderToImageAsync`
 * дээр тулдаг — энэ арга вэбэд байхгүй тул хөгжүүлэлтийн горимд
 * "not available on web" гэсэн алдаа таб бүрд давтагдан гарна.
 *
 * iOS/Android дээр таб бар нь жинхэнэ native тул дүрснүүд хэвээрээ.
 * Вэб нь зөвхөн урьдчилан харах гадаргуу учир тэнд бичиг үлдэнэ.
 */
const SHOW_TAB_ICONS = Platform.OS !== 'web';

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
        {SHOW_TAB_ICONS && <Icon src={<VectorIcon family={Ionicons} name="home-outline" />} />}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Label>Хайх</Label>
        {SHOW_TAB_ICONS && <Icon src={<VectorIcon family={Ionicons} name="search-outline" />} />}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ai-advisor">
        <Label>AI</Label>
        {SHOW_TAB_ICONS && <Icon src={<VectorIcon family={Ionicons} name="sparkles-outline" />} />}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookings">
        <Label>Цаг</Label>
        {SHOW_TAB_ICONS && <Icon src={<VectorIcon family={Ionicons} name="calendar-outline" />} />}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Хувийн</Label>
        {SHOW_TAB_ICONS && <Icon src={<VectorIcon family={Ionicons} name="person-outline" />} />}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
