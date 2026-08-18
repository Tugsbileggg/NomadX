import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { Brand } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

/** Хамгийн энгийн профайл дэлгэц — зөвхөн гарах боломж өгөхийн тулд нэмсэн. */
export default function ProfileScreen() {
  const router = useRouter()
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

        <Pressable style={styles.menuRow} onPress={() => router.push("/share")}>
          <Ionicons name="navigate-outline" size={18} color={Brand.primary} />
          <Text style={styles.menuLabel}>Байршил хуваалцах (POC)</Text>
          <Ionicons name="chevron-forward" size={16} color={Brand.muted} />
        </Pressable>

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
  menuRow: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: Brand.ink },
  card: { width: "100%", marginTop: 12 },
})
