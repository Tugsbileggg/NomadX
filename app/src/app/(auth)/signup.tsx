import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { Brand } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

const RULES = [
  { label: "8-аас дээш тэмдэгт", test: (v: string) => v.length >= 8 },
  { label: "Том, жижиг үсэг", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "Тоо эсвэл тусгай тэмдэгт", test: (v: string) => /[\d\W]/.test(v) },
]

export default function SignupScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreed, setAgreed] = useState(false)
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
      options: { data: { full_name: fullName, phone, role: "customer" } },
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
          <Ionicons name="arrow-back" size={22} color={Brand.primary} />
        </Pressable>

        <Text style={styles.title}>Шинэ бүртгэл үүсгэх</Text>
        <Text style={styles.subtitle}>Тавтай морил! Мэдээллээ оруулж бүртгэлээ үүсгэнэ үү.</Text>

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
                      color={ok ? Brand.success : Brand.muted}
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
              {agreed ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { padding: 24, paddingTop: 16, gap: 8, paddingBottom: 64 },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  title: { fontSize: 26, fontWeight: "600", color: Brand.primary, marginTop: 8 },
  subtitle: { fontSize: 14, color: Brand.body, marginBottom: 8 },
  card: {
    borderRadius: 24,
    backgroundColor: Brand.surfacePage,
    padding: 20,
    gap: 16,
  },
  rules: { marginTop: 8, gap: 6 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { fontSize: 13, color: Brand.body },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Brand.outline,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  termsText: { flex: 1, fontSize: 13, color: Brand.body, lineHeight: 18 },
  termsLink: { color: Brand.primary, fontWeight: "600" },
  error: { fontSize: 13, color: Brand.danger, textAlign: "center" },
  footer: { textAlign: "center", fontSize: 14, color: Brand.body, marginTop: 16 },
  footerLink: { color: Brand.primary, fontWeight: "600" },
})
