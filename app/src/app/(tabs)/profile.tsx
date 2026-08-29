import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { fetchMyProfile, updateMyProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import { useAppTheme, type ThemePreference } from "@/lib/theme-context"

const ROLE_LABEL: Record<string, string> = {
  customer: "Хэрэглэгч",
  salon: "Салон",
  artist: "Артист",
  super_admin: "Админ",
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Систем" },
  { value: "light", label: "Цайвар" },
  { value: "dark", label: "Бараан" },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { colors, preference, setPreference } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchMyProfile().then((p) => {
        if (p) {
          setFullName(p.fullName)
          setPhone(p.phone ?? "")
          setRole(p.role)
        }
        setLoading(false)
      })
    }, []),
  )

  async function onSave() {
    setSaving(true)
    setMessage(null)
    const failed = await updateMyProfile(fullName, phone)
    setSaving(false)
    setMessage(failed ? { text: failed, isError: true } : { text: "Хадгалагдлаа.", isError: false })
  }

  async function onSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  const initial = (fullName || session?.user.email || "L").trim().charAt(0).toUpperCase()

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.email}>{session?.user.email}</Text>
        {role && <Text style={styles.roleTag}>{ROLE_LABEL[role] ?? role}</Text>}

        {!loading && (
          <View style={styles.card}>
            <Text style={styles.label}>Овог, нэр</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Таны нэр"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Утасны дугаар</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="9911 2233"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              style={styles.input}
            />

            {message ? (
              <Text style={[styles.message, message.isError && styles.messageError]}>
                {message.text}
              </Text>
            ) : null}

            <AuthButton label="Хадгалах" onPress={onSave} busy={saving} />
          </View>
        )}

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

        <Pressable style={styles.menuRow} onPress={() => router.push("/favourites")}>
          <Ionicons name="heart-outline" size={18} color={colors.primary} />
          <Text style={styles.menuLabel}>Дуртай газрууд</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <Pressable style={styles.menuRow} onPress={() => router.push("/share")}>
          <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          <Text style={styles.menuLabel}>Байршил хуваалцах (POC)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.card}>
          <AuthButton label="Гарах" onPress={onSignOut} busy={signingOut} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { alignItems: "center", padding: 24, paddingTop: 48, gap: 12, paddingBottom: 96 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { fontSize: 24, fontWeight: "700", color: colors.primaryDark },
    email: { fontSize: 15, fontWeight: "600", color: colors.ink, marginTop: 4 },
    roleTag: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.primary,
      backgroundColor: colors.surfaceTint2,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    card: { width: "100%", marginTop: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
    label: { fontSize: 12, fontWeight: "600", color: colors.body },
    input: {
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.ink,
      marginBottom: 4,
    },
    message: { fontSize: 12, color: colors.success, textAlign: "center" },
    messageError: { color: colors.danger },
    themeRow: { flexDirection: "row", gap: 8 },
    themeButton: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    themeButtonActive: { backgroundColor: colors.primary },
    themeText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    themeTextActive: { color: colors.onPrimary },
    menuRow: {
      marginTop: 16,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.ink },
  })
}
