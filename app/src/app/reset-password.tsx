import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { Brand } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

const RULES = [
  { label: "8+ тэмдэгт", test: (v: string) => v.length >= 8 },
  { label: "Том үсэг агуулсан", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Тоо агуулсан", test: (v: string) => /\d/.test(v) },
]

export default function ResetPasswordScreen() {
  const { clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit() {
    if (password.length < 8) {
      setError("Нууц үг доод тал нь 8 тэмдэгт байх ёстой.")
      return
    }
    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна.")
      return
    }
    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setDone(true)
    setTimeout(async () => {
      await supabase.auth.signOut()
      clearPasswordRecovery()
    }, 1500)
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Нууц үг амжилттай солигдлоо</Text>
          <Text style={styles.subtitle}>Шинэ нууц үгээрээ нэвтэрнэ үү.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.title}>Шинэ нууц үг үүсгэх</Text>
        <Text style={styles.subtitle}>Өмнөх нууц үгээс ялгаатай, хүчтэй нууц үг сонгоно уу</Text>

        <View style={styles.card}>
          <AuthInput
            label="Шинэ нууц үг"
            icon="lock-closed-outline"
            placeholder="Шинэ нууц үгээ оруулна уу"
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

          <AuthInput
            label="Нууц үг баталгаажуулах"
            icon="lock-closed-outline"
            placeholder="Нууц үгээ дахин оруулна уу"
            isPassword
            value={confirm}
            onChangeText={setConfirm}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthButton label="Хадгалах" onPress={onSubmit} busy={busy} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { flex: 1, padding: 24, paddingTop: 48, gap: 8 },
  title: { fontSize: 24, fontWeight: "600", color: Brand.primary, textAlign: "center" },
  subtitle: { fontSize: 14, color: Brand.body, textAlign: "center", marginBottom: 8 },
  card: { borderRadius: 24, backgroundColor: Brand.surfacePage, padding: 20, gap: 16, marginTop: 16 },
  rules: { gap: 6, marginTop: -8 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { fontSize: 13, color: Brand.body },
  error: { fontSize: 13, color: Brand.danger, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
})
