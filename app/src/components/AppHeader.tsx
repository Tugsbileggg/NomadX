import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { fetchUnreadCount } from "@/lib/notifications"
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
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  // Мэдэгдлийн дэлгэцээс буцаж ирэхэд тоолуур шинэчлэгдэнэ.
  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchUnreadCount().then((n) => {
        if (active) setUnread(n)
      })
      return () => {
        active = false
      }
    }, []),
  )

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

      <Pressable hitSlop={8} onPress={() => router.push("/notifications")}>
        <Ionicons name="notifications-outline" size={20} color={colors.body} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </Pressable>
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
    badge: {
      position: "absolute",
      top: -4,
      right: -6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 4,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { fontSize: 9, fontWeight: "700", color: colors.onPrimary },
  })
}
