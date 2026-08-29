import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { useAppTheme } from "@/lib/theme-context"
import type { BrandPalette } from "@/constants/theme"

export default function WelcomeScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>Lumina</Text>
          <Text style={styles.subtitle}>Smart Beauty & Wellness</Text>

          <View style={styles.actions}>
            <AuthButton label="Нэвтрэх" onPress={() => router.push("/login")} />
            <AuthButton
              label="Бүртгүүлэх"
              variant="outline"
              onPress={() => router.push("/signup")}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 28,
      backgroundColor: colors.surfacePage,
      paddingVertical: 40,
      paddingHorizontal: 28,
      alignItems: "center",
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: { fontSize: 32, fontWeight: "600", color: colors.primary },
    subtitle: { fontSize: 14, color: colors.body, marginTop: 4, marginBottom: 32 },
    actions: { width: "100%", gap: 12 },
  })
}
