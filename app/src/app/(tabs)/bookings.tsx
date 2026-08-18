import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Brand } from "@/constants/theme"
import { cancelBooking, fetchMyBookings, type BookingWithBusiness } from "@/lib/bookings"
import { mnDateLabel, mnTimeLabel } from "@/lib/mn-date"
import { publicAssetUrl } from "@/lib/storage"

const STATUS_LABEL: Record<string, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
}

export default function BookingsScreen() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming")

  const load = useCallback(() => {
    fetchMyBookings().then((rows) => {
      setBookings(rows)
      setLoading(false)
    })
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const now = Date.now()
  const upcoming = useMemo(
    () =>
      bookings.filter((b) => b.status !== "cancelled" && new Date(b.scheduledAt).getTime() >= now),
    [bookings, now],
  )
  const history = useMemo(
    () =>
      bookings.filter((b) => b.status === "cancelled" || new Date(b.scheduledAt).getTime() < now),
    [bookings, now],
  )

  async function onCancel(id: string) {
    await cancelBooking(id)
    load()
  }

  const list = tab === "upcoming" ? upcoming : history

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Миний захиалгууд</Text>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab("upcoming")}
          style={[styles.tabButton, tab === "upcoming" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === "upcoming" && styles.tabTextActive]}>
            Идэвхтэй ({upcoming.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("history")}
          style={[styles.tabButton, tab === "history" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            Түүх ({history.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={28} color={Brand.muted} />
          <Text style={styles.emptyText}>
            {tab === "upcoming" ? "Идэвхтэй захиалга алга." : "Түүх хоосон байна."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {list.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              onPress={() =>
                b.business &&
                router.push({ pathname: "/business/[id]", params: { id: b.business.id } })
              }
              onCancel={() => onCancel(b.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function BookingRow({
  booking,
  onPress,
  onCancel,
}: {
  booking: BookingWithBusiness
  onPress: () => void
  onCancel: () => void
}) {
  const logoUrl = publicAssetUrl(booking.business?.logoPath)
  const initial = (booking.business?.name ?? "L").trim().charAt(0).toUpperCase()
  const date = new Date(booking.scheduledAt)
  const dateLabel = mnDateLabel(date)
  const timeLabel = mnTimeLabel(date)
  const canCancel = booking.status === "pending" || booking.status === "confirmed"

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLogo}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.cardLogoImage} contentFit="cover" />
          ) : (
            <Text style={styles.cardLogoInitial}>{initial}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{booking.business?.name ?? "Устгагдсан бизнес"}</Text>
          <Text style={styles.cardDate}>
            {dateLabel} · {timeLabel}
          </Text>
        </View>
        <View style={[styles.statusPill, statusStyle(booking.status)]}>
          <Text style={styles.statusText}>{STATUS_LABEL[booking.status] ?? booking.status}</Text>
        </View>
      </View>

      {booking.note ? <Text style={styles.note}>{booking.note}</Text> : null}

      {canCancel && (
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Захиалга цуцлах</Text>
        </Pressable>
      )}
    </Pressable>
  )
}

function statusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return { backgroundColor: "#dcfce7" }
    case "cancelled":
      return { backgroundColor: "#fee2e2" }
    case "completed":
      return { backgroundColor: Brand.surfaceTint2 }
    default:
      return { backgroundColor: "#fef3c7" }
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  title: { fontSize: 20, fontWeight: "700", color: Brand.ink, marginTop: 12, marginHorizontal: 20 },
  tabRow: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginTop: 16 },
  tabButton: { flex: 1, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  tabButtonActive: { backgroundColor: Brand.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  tabTextActive: { color: "#fff" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
  emptyText: { fontSize: 13, color: Brand.muted },
  list: { padding: 20, gap: 12, paddingBottom: 96 },
  card: { borderRadius: 16, backgroundColor: "#fff", padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardLogo: { width: 44, height: 44, borderRadius: 12, backgroundColor: Brand.primaryContainer, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  cardLogoImage: { width: "100%", height: "100%" },
  cardLogoInitial: { fontSize: 16, fontWeight: "700", color: Brand.primaryDark },
  cardName: { fontSize: 14, fontWeight: "700", color: Brand.ink },
  cardDate: { fontSize: 12, color: Brand.body, marginTop: 1 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: "700", color: Brand.ink },
  note: { fontSize: 12, color: Brand.body, backgroundColor: Brand.surfaceTint, borderRadius: 10, padding: 10 },
  cancelButton: { alignSelf: "flex-start" },
  cancelText: { fontSize: 12, fontWeight: "600", color: Brand.danger },
})
