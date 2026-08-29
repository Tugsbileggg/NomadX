import { Ionicons } from "@expo/vector-icons"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { useAppTheme } from "@/lib/theme-context"
import { AuthInput } from "@/components/auth/AuthInput"
import type { BrandPalette } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

/**
 * Нэвтрэх төрлийн сонголт.
 *
 * ⚠️ Энэ нь эрхийг ТОДОРХОЙЛДОГГҮЙ — эрх нь бүртгэлээрээ тогтдог бөгөөд
 * нэвтэрсний дараа root layout зөв бүлэг рүү чиглүүлнэ. Сонголтын
 * зорилго нь артист энэ аппаар нэвтэрдэг гэдгийг харуулах, бүртгүүлэх
 * холбоосыг зөв төрөл рүү чиглүүлэх. Буруу сонгосон хүнийг хааж болохгүй.
 */
const LOGIN_AS = [
  { id: "customer" as const, label: "Үйлчлүүлэгч" },
  { id: "artist" as const, label: "Артист" },
]

export default function LoginScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  // Угтах дэлгэцээс "Артистаар" гэж ирвэл сонголт нь урьдчилан тавигдана.
  const { as } = useLocalSearchParams<{ as?: string }>()
  const [loginAs, setLoginAs] = useState<"customer" | "artist">(
    as === "artist" ? "artist" : "customer",
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    if (!email || !password) {
      setError("И-мэйл, нууц үгээ оруулна уу.")
      return
    }
    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (authError) {
      setError(translate(authError.message))
      return
    }
    // Амжилттай нэвтэрсний дараа Stack.Protected автоматаар (tabs) руу шилжүүлнэ.
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.title}>Lumina</Text>
          <Text style={styles.subtitle}>
            {loginAs === "artist"
              ? "Артистын ажлын самбар руу нэвтэрнэ"
              : "Үзэсгэлэнт ертөнцөд дахин тавтай морил"}
          </Text>
        </View>

        <View style={styles.segment}>
          {LOGIN_AS.map((t) => {
            const active = loginAs === t.id
            return (
              <Pressable
                key={t.id}
                onPress={() => setLoginAs(t.id)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.card}>
          <AuthInput
            label="Утасны дугаар эсвэл И-мэйл хаяг"
            placeholder="И-мэйл хаяг"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            label="Нууц үг"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <Link href="/forgot-password" style={styles.forgot}>
            Нууц үг мартсан?
          </Link>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthButton label="Нэвтрэх" onPress={onSubmit} busy={busy} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Эсвэл сошиал хаягаар нэвтрэх</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <View style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color={colors.body} />
              <Text style={styles.socialText}>Google</Text>
            </View>
            <View style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={18} color={colors.body} />
              <Text style={styles.socialText}>Facebook</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Шинэ хэрэглэгч үү?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => router.push({ pathname: "/signup", params: { as: loginAs } })}
          >
            Бүртгүүлэх
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function translate(message: string) {
  const map: Record<string, string> = {
    "Invalid login credentials": "И-мэйл эсвэл нууц үг буруу байна.",
    "Email not confirmed": "И-мэйлээ баталгаажуулна уу.",
  }
  return map[message] ?? message
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingTop: 48, gap: 24, paddingBottom: 64 },
    header: { alignItems: "center", gap: 4 },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    title: { fontSize: 26, fontWeight: "600", color: colors.ink },
    subtitle: { fontSize: 14, color: colors.body },
    segment: {
      flexDirection: "row",
      gap: 6,
      backgroundColor: colors.surfaceTint2,
      borderRadius: 999,
      padding: 4,
      marginTop: 20,
    },
    segmentItem: {
      flex: 1,
      height: 38,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentItemActive: { backgroundColor: colors.primary },
    segmentText: { fontSize: 13, fontWeight: "600", color: colors.body },
    segmentTextActive: { color: colors.onPrimary },
    card: {
      borderRadius: 24,
      backgroundColor: colors.surfacePage,
      padding: 20,
      gap: 16,
    },
    forgot: { alignSelf: "flex-end", fontSize: 13, color: colors.primary, fontWeight: "500" },
    error: { fontSize: 13, color: colors.danger, textAlign: "center" },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.outlineSoft },
    dividerText: { fontSize: 12, color: colors.muted },
    socialRow: { flexDirection: "row", gap: 12 },
    socialButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    socialText: { fontSize: 14, color: colors.body, fontWeight: "500" },
    footer: { textAlign: "center", fontSize: 14, color: colors.body },
    footerLink: { color: colors.primary, fontWeight: "600" },
  })
}
