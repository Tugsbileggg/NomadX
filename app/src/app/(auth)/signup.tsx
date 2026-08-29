import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { useAppTheme } from "@/lib/theme-context"
import { AuthInput } from "@/components/auth/AuthInput"
import type { BrandPalette } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

/**
 * Аппаар өөрөө сонгож болох эрх.
 *
 * `super_admin`, `salon` энд байхгүй нь зориуд: админыг зөвхөн одоо байгаа
 * админ томилно (0018), салон нь вэб панелаар бүртгүүлдэг хэвээр.
 * DB тал ч мөн адил хамгаалагдсан — `handle_new_user` зөвшөөрөгдсөн
 * жагсаалтаас гадуур утгыг үл тоодог.
 */
const ACCOUNT_TYPES = [
  {
    id: "customer" as const,
    title: "Үйлчлүүлэгч",
    body: "Салон, артист хайж цаг захиална.",
    icon: "person-outline" as const,
  },
  {
    id: "artist" as const,
    title: "Хувиараа артист",
    body: "Өөрийн үйлчилгээгээ бүртгэж захиалга авна.",
    icon: "color-palette-outline" as const,
  },
]

const RULES = [
  { label: "8-аас дээш тэмдэгт", test: (v: string) => v.length >= 8 },
  { label: "Том, жижиг үсэг", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "Тоо эсвэл тусгай тэмдэгт", test: (v: string) => /[\d\W]/.test(v) },
]

export default function SignupScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreed, setAgreed] = useState(false)
  // Нэвтрэх дэлгэц эсвэл угтах дэлгэцээс ирсэн сонголтыг дагана.
  const { as } = useLocalSearchParams<{ as?: string }>()
  const [accountType, setAccountType] = useState<"customer" | "artist">(
    as === "artist" ? "artist" : "customer",
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    if (!fullName || !email || !password) {
      setError("Нэр, и-мэйл, нууц үгээ бөглөнө үү.")
      return
    }
    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна.")
      return
    }
    if (!agreed) {
      setError("Үйлчилгээний нөхцөлийг зөвшөөрнө үү.")
      return
    }

    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, role: accountType } },
    })
    setBusy(false)

    if (authError) {
      setError(translate(authError.message))
      return
    }
    router.push({ pathname: "/verify-otp", params: { email } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>

        <Text style={styles.title}>Шинэ бүртгэл үүсгэх</Text>
        <Text style={styles.subtitle}>Тавтай морил! Мэдээллээ оруулж бүртгэлээ үүсгэнэ үү.</Text>

        <View style={styles.typeRow}>
          {ACCOUNT_TYPES.map((t) => {
            const active = accountType === t.id
            return (
              <Pressable
                key={t.id}
                onPress={() => setAccountType(t.id)}
                style={[styles.typeCard, active && styles.typeCardActive]}
              >
                <Ionicons
                  name={t.icon}
                  size={20}
                  color={active ? colors.onPrimary : colors.primary}
                />
                <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>{t.title}</Text>
                <Text style={[styles.typeBody, active && styles.typeBodyActive]}>{t.body}</Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.card}>
          <AuthInput
            label="Овог, Нэр"
            icon="person-outline"
            placeholder="Таны нэр"
            value={fullName}
            onChangeText={setFullName}
          />
          <AuthInput
            label="И-мэйл хаяг"
            icon="mail-outline"
            placeholder="name@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            label="Утасны дугаар"
            icon="call-outline"
            placeholder="9911 2233"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <View>
            <AuthInput
              label="Нууц үг"
              icon="lock-closed-outline"
              placeholder="Нууц үгээ оруулна уу"
              isPassword
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.rules}>
              {RULES.map((r) => {
                const ok = r.test(password)
                return (
                  <View key={r.label} style={styles.ruleRow}>
                    <Ionicons
                      name={ok ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={ok ? colors.success : colors.muted}
                    />
                    <Text style={styles.ruleText}>{r.label}</Text>
                  </View>
                )
              })}
            </View>
          </View>
          <AuthInput
            label="Нууц үг давтах"
            icon="lock-closed-outline"
            placeholder="Нууц үгээ дахин оруулна уу"
            isPassword
            value={confirm}
            onChangeText={setConfirm}
          />

          <Pressable style={styles.termsRow} onPress={() => setAgreed((a) => !a)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed ? <Ionicons name="checkmark" size={14} color={colors.onPrimary} /> : null}
            </View>
            <Text style={styles.termsText}>
              Би <Text style={styles.termsLink}>Үйлчилгээний нөхцөл</Text> болон{" "}
              <Text style={styles.termsLink}>Нууцлалын бодлогыг</Text> зөвшөөрч байна
            </Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthButton label="Үргэлжлүүлэх" onPress={onSubmit} busy={busy} />
        </View>

        <Text style={styles.footer}>
          Бүртгэлтэй юу?{" "}
          <Text style={styles.footerLink} onPress={() => router.push("/login")}>
            Нэвтрэх
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function translate(message: string) {
  const map: Record<string, string> = {
    "User already registered": "Энэ и-мэйл аль хэдийн бүртгэлтэй байна.",
  }
  return map[message] ?? message
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingTop: 16, gap: 8, paddingBottom: 64 },
    back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -8 },
    title: { fontSize: 26, fontWeight: "600", color: colors.primary, marginTop: 8 },
    subtitle: { fontSize: 14, color: colors.body, marginBottom: 8 },
    typeRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    typeCard: {
      flex: 1,
      gap: 4,
      borderRadius: 16,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
    },
    typeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
    typeTitleActive: { color: colors.onPrimary },
    typeBody: { fontSize: 11, color: colors.muted, lineHeight: 15 },
    typeBodyActive: { color: colors.onPrimary, opacity: 0.85 },
    card: {
      borderRadius: 24,
      backgroundColor: colors.surfacePage,
      padding: 20,
      gap: 16,
    },
    rules: { marginTop: 8, gap: 6 },
    ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    ruleText: { fontSize: 13, color: colors.body },
    termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    termsText: { flex: 1, fontSize: 13, color: colors.body, lineHeight: 18 },
    termsLink: { color: colors.primary, fontWeight: "600" },
    error: { fontSize: 13, color: colors.danger, textAlign: "center" },
    footer: { textAlign: "center", fontSize: 14, color: colors.body, marginTop: 16 },
    footerLink: { color: colors.primary, fontWeight: "600" },
  })
}
