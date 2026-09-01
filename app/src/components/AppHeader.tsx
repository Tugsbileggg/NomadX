import { Image } from "expo-image"
import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"

import { NotificationBell } from "@/components/NotificationBell"
import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Брэндийн толгой — Lumina зүүн талд, мэдэгдлийн хонх баруун талд.
 *
 * Нүүр, Хайх хоёр өөр өөрийн хувилбартай байсан: нэг нь брэндээ голлуулж,
 * нөгөө нь зүүн шахсан, мөн Хайх дээрх хонх нь хаашаа ч ороогүй байв.
 * Нэг бүрэлдэхүүн болгосноор хуудсууд ялгарах боломжгүй болно — шинэ
 * хуудсанд мөн үүнийг л оруулна.
 */
export function AppHeader() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <View style={styles.row}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Image
            source={require("@/assets/images/lumina-mark.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>
        <Text style={styles.brandText}>Lumina</Text>
      </View>

      <NotificationBell />
    </View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 4,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    logoImage: { width: "100%", height: "100%" },
    brandText: { fontSize: 18, fontWeight: "700", color: colors.primary },
  })
}
