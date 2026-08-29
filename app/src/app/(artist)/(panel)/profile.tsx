import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useAppTheme } from "@/lib/theme-context"
import type { ThemePreference } from "@/lib/theme-context"

/** Ажлын самбарын дэд дэлгэцүүд — tab-д багтахгүй тул эндээс. */
const MENU = [
  { href: "/(artist)/schedule" as const, label: "Хуваарь", icon: "time-outline" as const },
  { href: "/(artist)/services" as const, label: "Үйлчилгээ", icon: "pricetags-outline" as const },
  { href: "/(artist)/portfolio" as const, label: "Бүтээлүүд", icon: "images-outline" as const },
  { href: "/(artist)/reviews" as const, label: "Сэтгэгдэл", icon: "star-outline" as const },
  { href: "/notifications" as const, label: "Мэдэгдэл", icon: "notifications-outline" as const },
]

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Систем", value: "system" },
  { label: "Цайвар", value: "light" },
  { label: "Бараан", value: "dark" },
]

/**
 * Артистын профайл — акаунт, тохиргоо, ажлын самбарын дэд дэлгэцүүд.
 *
 * Хуваарь, үйлчилгээ, бүтээл, сэтгэгдэл нь tab-д багтахгүй тул эндээс
 * нээгдэнэ. Профайлын мэдээлэл засах (нэр, хаяг, лого) хараахан ороогүй —
 * тэр нь вэб панел дээр үлдэж байна.
 */
export default function ArtistProfileScreen() {
  const { colors, preference, setPreference } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const { session, account } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const initial = (account?.business?.name || session?.user.email || "L")
    .trim()
    .charAt(0)
    .toUpperCase()

  async function onSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        {account?.business?.name ? (
          <Text style={styles.name}>{account.business.name}</Text>
        ) : null}
        <Text style={styles.email}>{session?.user.email}</Text>
        <Text style={styles.roleTag}>Хувиараа артист</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Дэлгэцийн горим</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  style={[styles.themeButton, active && styles.themeButtonActive]}
                >
                  <Text style={[styles.themeText, active && styles.themeTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {MENU.map((m) => (
          <Pressable key={m.href} style={styles.menuRow} onPress={() => router.push(m.href)}>
            <Ionicons name={m.icon} size={18} color={colors.primary} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ))}

        <View style={styles.signOut}>
          <AuthButton label="Гарах" onPress={onSignOut} busy={signingOut} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { alignItems: "center", padding: 24, paddingTop: 40, gap: 6, paddingBottom: 120 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { fontSize: 24, fontWeight: "700", color: colors.primaryDark },
    name: { fontSize: 16, fontWeight: "700", color: colors.ink, marginTop: 6 },
    email: { fontSize: 13, color: colors.body },
    roleTag: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.primary,
      backgroundColor: colors.surfaceTint2,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginTop: 2,
    },

    card: { width: "100%", marginTop: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
    label: { fontSize: 12, fontWeight: "600", color: colors.body },
    themeRow: { flexDirection: "row", gap: 8 },
    themeButton: {
      flex: 1,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    themeButtonActive: { backgroundColor: colors.primary },
    themeText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    themeTextActive: { color: colors.onPrimary },

    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "100%",
      marginTop: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.ink },

    signOut: { width: "100%", marginTop: 16 },
  })
}
