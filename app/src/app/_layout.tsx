import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { InAppNotice } from '@/components/InAppNotice';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppThemeProvider, useAppTheme } from '@/lib/theme-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  return (
    <AppThemeProvider>
      <ThemedNavigation>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigator fontsLoaded={fontsLoaded} />
        </AuthProvider>
      </ThemedNavigation>
    </AppThemeProvider>
  );
}

/** Хэрэглэгчийн сонгосон (эсвэл системийн) горимоор навигацийн крум, статус бар-ыг тааруулна. */
function ThemedNavigation({ children }: { children: React.ReactNode }) {
  const { scheme } = useAppTheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}

/**
 * Эрхээс хамааран навигацийн бүлгийг сэлгэнэ.
 *
 * - нэвтрээгүй → `(auth)`
 * - артист     → `(artist)` (бүртгэл, хүлээлт, панел бүгд тэнд)
 * - бусад      → `(tabs)` — харилцагчийн туршлага
 *
 * Нууц үг сэргээх кодоор баталгаажуулсны дараа Supabase сешн үүсгэдэг тул
 * passwordRecovery төлөвийг тусад нь шалгаж reset-password руу оруулна.
 */
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, loading, passwordRecovery, account, accountReady } = useAuth();
  const { colors, ready } = useAppTheme();
  const router = useRouter();

  // Push мэдэгдэл дээр дарахад мэдэгдлийн төв рүү оруулна. Тухайн
  // захиалга руу шууд орох нь илүү боловч мэдэгдэл нь захиалгынх ч
  // байж болно, бүртгэлийнх ч байж болно — төв нь бүх төрлийг зөв
  // харуулдаг цорын ганц дэлгэц.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });
    return () => sub.remove();
  }, [router]);

  // `ready`-г хүлээхгүй бол native tab bar эхний удаад буруу байрлана.
  // `accountReady`-г хүлээхгүй бол артист эхлээд харилцагчийн дэлгэцийг
  // хормын зуур хараад дараа нь үсэрч засагдана.
  if (loading || !fontsLoaded || !ready || (session && !accountReady)) {
    return <View style={{ flex: 1, backgroundColor: colors.surfacePage }} />;
  }

  const signedIn = !!session && !passwordRecovery;
  const isArtist = account?.role === "artist";

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={passwordRecovery}>
          <Stack.Screen name="reset-password" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && isArtist}>
          <Stack.Screen name="(artist)" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !isArtist}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="business/[id]" />
          <Stack.Screen name="book/[id]" />
          <Stack.Screen name="favourites" />
          <Stack.Screen name="share" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          {/* Мэдэгдэл хоёр талд хоёуланд нь хэрэгтэй. */}
          <Stack.Screen name="notifications" />
        </Stack.Protected>
        <Stack.Protected guard={!session && !passwordRecovery}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {/* Мэдэгдлийн самбар бүх дэлгэцийн дээгүүр гарах ёстой тул
          Stack-ийн гадна, түүний дараа байрлана. */}
      <InAppNotice />
    </View>
  );
}
