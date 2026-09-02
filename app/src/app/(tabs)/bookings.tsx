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

import type { BrandPalette } from "@/constants/theme"
import {
  cancelBooking,
  fetchMyBookings,
  payInvoice,
  type BookingWithBusiness,
} from "@/lib/bookings"
import { mnDateLabel, mnTimeLabel } from "@/lib/mn-date"
import { publicAssetUrl } from "@/lib/storage"
import { useAppTheme } from "@/lib/theme-context"

const INVOICE_LABEL: Record<string, string> = {
  issued: "Төлөх дүн",
  paid: "Төлөгдсөн",
  cancelled: "Цуцлагдсан нэхэмжлэх",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
}

export default function BookingsScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
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

  async function onPay(invoiceId: string) {
    await payInvoice(invoiceId)
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
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={28} color={colors.muted} />
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
              onPay={() => b.invoice && onPay(b.invoice.id)}
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
  onPay,
}: {
  booking: BookingWithBusiness
  onPress: () => void
  onCancel: () => void
  onPay: () => void
}) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const logoUrl = publicAssetUrl(booking.business?.logoPath)
  const initial = (booking.business?.name ?? "L").trim().charAt(0).toUpperCase()
  const date = new Date(booking.scheduledAt)
  const dateLabel = mnDateLabel(date)
  const timeLabel = mnTimeLabel(date)
  const canCancel = booking.status === "pending" || booking.status === "confirmed"
  const isPending = booking.status === "pending"
  const canPay = booking.invoice?.status === "issued"

  return (
    <Pressable onPress={onPress} style={[styles.card, isPending && styles.cardPending]}>
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
        <View style={[styles.statusPill, statusStyle(booking.status, colors)]}>
          <Text style={styles.statusText}>{STATUS_LABEL[booking.status] ?? booking.status}</Text>
        </View>
      </View>

      {booking.note ? <Text style={styles.note}>{booking.note}</Text> : null}

      {/* ⚠️ Туршилтын нэхэмжлэх — бодит төлбөр тооцоо хийгддэггүй, зөвхөн
          бизнесийн бичсэн дүнг харуулна. */}
      {booking.invoice && (
        <View style={styles.invoice}>
          <View style={styles.invoiceTop}>
            <Ionicons name="receipt-outline" size={14} color={colors.primary} />
            <Text style={styles.invoiceLabel}>
              {INVOICE_LABEL[booking.invoice.status] ?? "Нэхэмжлэх"}
            </Text>
            <Text style={styles.invoiceTest}>туршилтын</Text>
          </View>
          <Text
            style={[
              styles.invoiceAmount,
              booking.invoice.status === "cancelled" && styles.invoiceVoid,
            ]}
          >
            {booking.invoice.amount.toLocaleString("en-US")}₮
          </Text>
          {booking.invoice.note ? (
            <Text style={styles.invoiceNote}>{booking.invoice.note}</Text>
          ) : null}

          {canPay && (
            <Pressable
              onPress={(e) => {
                // Картыг дарах үйлдлийг тасална — үгүй бол бизнесийн
                // хуудас зэрэг нээгдэнэ.
                e.stopPropagation()
                onPay()
              }}
              style={styles.payButton}
            >
              <Ionicons name="card-outline" size={15} color={colors.onPrimary} />
              <Text style={styles.payText}>Төлсөн гэж тэмдэглэх</Text>
            </Pressable>
          )}
        </View>
      )}

      {canCancel && (
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Захиалга цуцлах</Text>
        </Pressable>
      )}
    </Pressable>
  )
}

function statusStyle(status: string, colors: BrandPalette) {
  switch (status) {
    case "confirmed":
      return { backgroundColor: colors.successSoft }
    case "cancelled":
      return { backgroundColor: colors.dangerSoft }
    case "completed":
      return { backgroundColor: colors.surfaceTint2 }
    default:
      return { backgroundColor: colors.warningSoft }
  }
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginTop: 12, marginHorizontal: 20 },
    tabRow: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginTop: 16 },
    tabButton: { flex: 1, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
    tabButtonActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    tabTextActive: { color: colors.onPrimary },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
    emptyText: { fontSize: 13, color: colors.muted },
    list: { padding: 20, gap: 12, paddingBottom: 96 },
    card: { borderRadius: 16, backgroundColor: colors.surface, padding: 14, gap: 10 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardLogo: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    cardLogoImage: { width: "100%", height: "100%" },
    cardLogoInitial: { fontSize: 16, fontWeight: "700", color: colors.primaryDark },
    cardName: { fontSize: 14, fontWeight: "700", color: colors.ink },
    cardDate: { fontSize: 12, color: colors.body, marginTop: 1 },
    // Хүлээгдэж буй захиалга бусдаасаа ялгарна: хариу хүлээж байгаа тул
    // жагсаалтыг гүйлгэхэд шууд нүдэнд өртөх ёстой.
    cardPending: {
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      backgroundColor: colors.warningSoft,
    },
    statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 10, fontWeight: "700", color: colors.ink },
    note: { fontSize: 12, color: colors.body, backgroundColor: colors.surfaceTint, borderRadius: 10, padding: 10 },
    invoice: {
      marginTop: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outline,
      padding: 12,
    },
    invoiceTop: { flexDirection: "row", alignItems: "center", gap: 5 },
    invoiceLabel: { fontSize: 11, fontWeight: "700", color: colors.body },
    invoiceTest: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.muted,
      backgroundColor: colors.surfaceTint2,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    invoiceAmount: { marginTop: 4, fontSize: 20, fontWeight: "700", color: colors.ink },
    invoiceVoid: { textDecorationLine: "line-through", color: colors.muted },
    invoiceNote: { marginTop: 2, fontSize: 12, color: colors.body },
    payButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 10,
      height: 40,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    payText: { fontSize: 13, fontWeight: "700", color: colors.onPrimary },
    cancelButton: { alignSelf: "flex-start" },
    cancelText: { fontSize: 12, fontWeight: "600", color: colors.danger },
  })
}
