import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
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
 * Нэвтэрсэн эсэхээс хамааран (tabs)/(auth) бүлгийг сэлгэнэ. Нууц үг сэргээх
 * кодоор баталгаажуулсны дараа Supabase сешн үүсгэдэг тул passwordRecovery
 * төлөвийг тусад нь шалгаж reset-password дэлгэц рүү оруулна.
 */
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, loading, passwordRecovery } = useAuth();
  const { colors, ready } = useAppTheme();

  // `ready`-г хүлээхгүй бол native tab bar эхний удаад буруу байрлана.
  if (loading || !fontsLoaded || !ready) {
    return <View style={{ flex: 1, backgroundColor: colors.surfacePage }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={passwordRecovery}>
        <Stack.Screen name="reset-password" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !passwordRecovery}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        <Stack.Screen name="book/[id]" />
        <Stack.Screen name="favourites" />
        <Stack.Screen name="share" />
      </Stack.Protected>
      <Stack.Protected guard={!session && !passwordRecovery}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
