import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { Brand } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    if (!email) {
      setError("И-мэйл хаягаа оруулна уу.")
      return
    }
    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email)
    setBusy(false)
    if (authError) {
      setError(authError.message)
      return
    }
    router.push({ pathname: "/verify-reset", params: { email } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Brand.primary} />
        </Pressable>

        <Text style={styles.title}>Нууц үгээ мартсан уу?</Text>
        <Text style={styles.subtitle}>
          Санаа зоволтгүй! Бүртгэлтэй и-мэйл хаягаа оруулна уу, бид танд баталгаажуулах код
          илгээх болно.
        </Text>

        <View style={styles.card}>
          <AuthInput
            label="И-мэйл"
            icon="mail-outline"
            placeholder="И-мэйл хаяг"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthButton label="Код илгээх" onPress={onSubmit} busy={busy} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { flex: 1, padding: 24, paddingTop: 16, gap: 8 },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  title: { fontSize: 24, fontWeight: "600", color: Brand.primary, marginTop: 8 },
  subtitle: { fontSize: 14, color: Brand.body, lineHeight: 20 },
  card: { borderRadius: 24, backgroundColor: Brand.surfacePage, padding: 20, gap: 16, marginTop: 16 },
  error: { fontSize: 13, color: Brand.danger, textAlign: "center" },
})
