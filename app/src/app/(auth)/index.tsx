import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
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

          {/* Артист энэ аппаар ажилладаг гэдгийг эхний дэлгэцээс мэдэгдэнэ —
              эс тэгвэл зөвхөн үйлчлүүлэгчид зориулсан мэт харагдана. */}
          <Pressable
            style={styles.artistLink}
            onPress={() => router.push({ pathname: "/login", params: { as: "artist" } })}
          >
            <Ionicons name="color-palette-outline" size={16} color={colors.primary} />
            <Text style={styles.artistLinkText}>Хувиараа артист уу? Эндээс нэвтэрнэ</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    artistLink: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 18,
      paddingVertical: 6,
    },
    artistLinkText: { fontSize: 12, fontWeight: "600", color: colors.primary },
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
