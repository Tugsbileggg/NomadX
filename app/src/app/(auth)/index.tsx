import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { Brand } from "@/constants/theme"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={28} color={Brand.primary} />
          </View>

          <Text style={styles.title}>Lumina</Text>
          <Text style={styles.subtitle}>Smart Beauty & Wellness</Text>

          <View style={styles.actions}>
            <AuthButton label="Нэвтрэх" onPress={() => router.push("/login")} />
            <AuthButton
              label="Бүртгүүлэх"
              variant="outline"
              onPress={() => router.push("/signup")}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    backgroundColor: Brand.surfacePage,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "600", color: Brand.primary },
  subtitle: { fontSize: 14, color: Brand.body, marginTop: 4, marginBottom: 32 },
  actions: { width: "100%", gap: 12 },
})
