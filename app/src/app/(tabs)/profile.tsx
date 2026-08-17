import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { Brand } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

/** Хамгийн энгийн профайл дэлгэц — зөвхөн гарах боломж өгөхийн тулд нэмсэн. */
export default function ProfileScreen() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)

  async function onSignOut() {
    setBusy(true)
    await supabase.auth.signOut()
    setBusy(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={Brand.primary} />
        </View>
        <Text style={styles.email}>{session?.user.email}</Text>

        <View style={styles.card}>
          <AuthButton label="Гарах" onPress={onSignOut} busy={busy} variant="outline" />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { flex: 1, alignItems: "center", padding: 24, paddingTop: 64, gap: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  email: { fontSize: 16, fontWeight: "600", color: Brand.ink },
  card: { width: "100%", marginTop: 24 },
})
