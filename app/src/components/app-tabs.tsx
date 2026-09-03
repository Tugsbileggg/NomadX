import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
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

// SDK 57-д Icon/Label/VectorIcon нь тусдаа экспорт байхаа больж,
// `NativeTabs.Trigger`-ийн доорх бүрэлдэхүүн болсон.
const { Trigger } = NativeTabs;

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
      <Trigger name="index">
        <Trigger.Label>Нүүр</Trigger.Label>
        {SHOW_TAB_ICONS && <Trigger.Icon src={<Trigger.VectorIcon family={Ionicons} name="home-outline" />} />}
      </Trigger>

      <Trigger name="search">
        <Trigger.Label>Хайх</Trigger.Label>
        {SHOW_TAB_ICONS && <Trigger.Icon src={<Trigger.VectorIcon family={Ionicons} name="search-outline" />} />}
      </Trigger>

      <Trigger name="ai-advisor">
        <Trigger.Label>AI</Trigger.Label>
        {SHOW_TAB_ICONS && <Trigger.Icon src={<Trigger.VectorIcon family={Ionicons} name="sparkles-outline" />} />}
      </Trigger>

      <Trigger name="bookings">
        <Trigger.Label>Цаг</Trigger.Label>
        {SHOW_TAB_ICONS && <Trigger.Icon src={<Trigger.VectorIcon family={Ionicons} name="calendar-outline" />} />}
      </Trigger>

      <Trigger name="profile">
        <Trigger.Label>Хувийн</Trigger.Label>
        {SHOW_TAB_ICONS && <Trigger.Icon src={<Trigger.VectorIcon family={Ionicons} name="person-outline" />} />}
      </Trigger>
    </NativeTabs>
  );
}
