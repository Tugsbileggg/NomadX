import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"
import { mnTimeAgo } from "@/lib/mn-date"
import {
  deleteNotification,
  fetchNotifications,
  markAllRead,
  markRead,
  NOTIFICATION_ICON,
  type AppNotification,
} from "@/lib/notifications"

export default function NotificationsScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchNotifications().then((rows) => {
        if (!active) return
        setItems(rows)
        setLoading(false)
      })
      return () => {
        active = false
      }
    }, []),
  )

  const unread = items.filter((n) => !n.isRead).length

  async function onOpen(item: AppNotification) {
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)))
      await markRead(item.id)
    }

    // Захиалгын мэдэгдэл нь Захиалга tab руу, бусад нь бизнесийн профайл руу.
    if (item.bookingId) router.push("/bookings")
    else if (item.businessId) {
      router.push({ pathname: "/business/[id]", params: { id: item.businessId } })
    }
  }

  async function onDelete(id: string) {
    const previous = items
    setItems((prev) => prev.filter((n) => n.id !== id))
    try {
      await deleteNotification(id)
    } catch {
      setItems(previous)
    }
  }

  async function onMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    await markAllRead()
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Мэдэгдэл</Text>
        {unread > 0 && (
          <Pressable onPress={onMarkAll} hitSlop={8} style={{ marginLeft: "auto" }}>
            <Text style={styles.markAll}>Бүгдийг уншсан</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.primaryLight} />
          <Text style={styles.emptyTitle}>Мэдэгдэл алга</Text>
          <Text style={styles.emptyBody}>
            Захиалга баталгаажсан, цуцлагдсан, нэхэмжлэх ирсэн зэрэг мэдээлэл энд харагдана.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => onOpen(n)}
              style={[styles.card, !n.isRead && styles.cardUnread]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={NOTIFICATION_ICON[n.kind] as never}
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                {n.body && <Text style={styles.cardBody}>{n.body}</Text>}
                <Text style={styles.cardAge}>{mnTimeAgo(n.createdAt)}</Text>
              </View>

              {!n.isRead && <View style={styles.dot} />}

              <Pressable onPress={() => onDelete(n.id)} hitSlop={8}>
                <Ionicons name="close" size={16} color={colors.muted} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink },
    markAll: { fontSize: 12, fontWeight: "600", color: colors.primary },

    list: { padding: 20, paddingTop: 4, gap: 10, paddingBottom: 40 },
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
    },
    cardUnread: { borderWidth: 1, borderColor: colors.primaryContainer },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
    cardBody: { fontSize: 12, color: colors.body, lineHeight: 17 },
    cardAge: { fontSize: 11, color: colors.muted },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },

    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
    emptyTitle: { fontSize: 15, fontWeight: "700", color: colors.ink, marginTop: 6 },
    emptyBody: { fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },
  })
}
