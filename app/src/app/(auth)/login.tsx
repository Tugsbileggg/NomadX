import { Ionicons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { Brand } from "@/constants/theme"
import { supabase } from "@/lib/supabase"

export default function LoginScreen() {
  const router = useRouter()
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
            <Ionicons name="leaf-outline" size={26} color={Brand.primary} />
          </View>
          <Text style={styles.title}>Lumina</Text>
          <Text style={styles.subtitle}>Үзэсгэлэнт ертөнцөд дахин тавтай морил</Text>
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
              <Ionicons name="logo-google" size={18} color={Brand.body} />
              <Text style={styles.socialText}>Google</Text>
            </View>
            <View style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={18} color={Brand.body} />
              <Text style={styles.socialText}>Facebook</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Шинэ хэрэглэгч үү?{" "}
          <Text style={styles.footerLink} onPress={() => router.push("/signup")}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { padding: 24, paddingTop: 48, gap: 24, paddingBottom: 64 },
  header: { alignItems: "center", gap: 4 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "600", color: Brand.ink },
  subtitle: { fontSize: 14, color: Brand.body },
  card: {
    borderRadius: 24,
    backgroundColor: Brand.surfacePage,
    padding: 20,
    gap: 16,
  },
  forgot: { alignSelf: "flex-end", fontSize: 13, color: Brand.primary, fontWeight: "500" },
  error: { fontSize: 13, color: Brand.danger, textAlign: "center" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Brand.outlineSoft },
  dividerText: { fontSize: 12, color: Brand.muted },
  socialRow: { flexDirection: "row", gap: 12 },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.outlineSoft,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialText: { fontSize: 14, color: Brand.body, fontWeight: "500" },
  footer: { textAlign: "center", fontSize: 14, color: Brand.body },
  footerLink: { color: Brand.primary, fontWeight: "600" },
})
