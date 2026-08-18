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
import { useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Brand } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator fontsLoaded={fontsLoaded} />
      </AuthProvider>
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

  if (loading || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Brand.surfacePage }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={passwordRecovery}>
        <Stack.Screen name="reset-password" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !passwordRecovery}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[id]" />
        <Stack.Screen name="share" />
      </Stack.Protected>
      <Stack.Protected guard={!session && !passwordRecovery}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
