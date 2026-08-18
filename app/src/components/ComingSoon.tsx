import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Brand } from "@/constants/theme"

/** Хараахан хийгдээгүй feature-үүдэд ашиглах шударга "тун удахгүй" дэлгэц. */
export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={28} color={Brand.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Тун удахгүй</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", color: Brand.ink, textAlign: "center" },
  description: { fontSize: 13, color: Brand.body, textAlign: "center", lineHeight: 19 },
  badge: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint2,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: Brand.primary },
})
