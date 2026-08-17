import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { OtpBoxes } from "@/components/auth/OtpBoxes"
import { Brand } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

const COOLDOWN = 59

/**
 * Нууц үг сэргээх кодыг шалгана. Амжилттай бол Supabase "PASSWORD_RECOVERY"
 * эвент дуудаж, root _layout.tsx-ийн Stack.Protected автоматаар reset-password
 * дэлгэц рүү шилжүүлнэ — энд гараар router.push хийх шаардлагагүй.
 */
export default function VerifyResetScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(COOLDOWN)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  async function onVerify() {
    if (code.length < 4) {
      setError("Кодоо бүрэн оруулна уу.")
      return
    }
    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    })
    setBusy(false)
    if (authError) setError("Код буруу эсвэл хугацаа нь дууссан байна.")
  }

  async function onResend() {
    setResending(true)
    await supabase.auth.resetPasswordForEmail(email)
    setResending(false)
    setSeconds(COOLDOWN)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Brand.primary} />
        </Pressable>

        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Ionicons name="key" size={26} color="#fff" />
          </View>

          <Text style={styles.title}>Баталгаажуулах</Text>
          <Text style={styles.subtitle}>
            Таны <Text style={styles.email}>{email}</Text> хаягт 4 оронтой баталгаажуулах код
            илгээлээ.
          </Text>

          <View style={styles.otpWrap}>
            <OtpBoxes value={code} onChange={setCode} />
          </View>

          <Pressable onPress={onResend} disabled={seconds > 0 || resending}>
            <Text style={[styles.resend, (seconds > 0 || resending) && styles.resendDisabled]}>
              {resending
                ? "Илгээж байна..."
                : seconds > 0
                  ? `Код дахин илгээх (00:${String(seconds).padStart(2, "0")})`
                  : "Код дахин илгээх"}
            </Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <AuthButton label="Баталгаажуулах" onPress={onVerify} busy={busy} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { flex: 1, padding: 24, justifyContent: "space-between" },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  center: { alignItems: "center", gap: 8, marginTop: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "600", color: Brand.ink },
  subtitle: { fontSize: 14, color: Brand.body, textAlign: "center", lineHeight: 20, maxWidth: 300 },
  email: { fontWeight: "700", color: Brand.ink },
  otpWrap: { width: "100%", marginTop: 24 },
  resend: { marginTop: 20, fontSize: 14, fontWeight: "600", color: Brand.ink },
  resendDisabled: { color: Brand.muted },
  error: { marginTop: 16, fontSize: 13, color: Brand.danger, textAlign: "center" },
})
