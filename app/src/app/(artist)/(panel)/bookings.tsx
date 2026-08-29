import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useFocusEffect } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import type { BookingStatus } from "@/lib/db-types"
import {
  fetchArtistBookings,
  saveArtistInvoice,
  setArtistBookingStatus,
  NEXT_STEPS,
  STATUS_LABEL,
  type ArtistBooking,
} from "@/lib/artist-bookings"
import { mnDateLabel, mnTimeLabel } from "@/lib/mn-date"
import { useAppTheme } from "@/lib/theme-context"

const FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "Бүгд", value: "all" },
  { label: "Хүлээгдэж буй", value: "pending" },
  { label: "Баталгаажсан", value: "confirmed" },
  { label: "Дууссан", value: "completed" },
]

/** Артистын захиалгууд — баталгаажуулах, дуусгах, нэхэмжлэх. */
export default function ArtistBookingsScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<ArtistBooking[]>([])
  const [counts, setCounts] = useState({ total: 0, today: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BookingStatus | "all">("all")
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await fetchArtistBookings()
    setBusinessId(data.businessId)
    setBookings(data.bookings)
    setCounts(data.counts)
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter],
  )

  async function onStatus(id: string, next: BookingStatus) {
    setError(null)
    const failed = await setArtistBookingStatus(id, next)
    if (failed) {
      setError(failed)
      return
    }
    await load()
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Захиалга</Text>
      <View style={styles.statRow}>
        <Stat label="Өнөөдөр" value={counts.today} styles={styles} />
        <Stat label="Хүлээгдэж буй" value={counts.pending} styles={styles} />
        <Stat label="Нийт" value={counts.total} styles={styles} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="clipboard-outline" size={36} color={colors.primaryLight} />
          <Text style={styles.emptyText}>Энэ шүүлтэд тохирох захиалга алга.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {visible.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              businessId={businessId}
              styles={styles}
              colors={colors}
              onStatus={onStatus}
              onSaved={load}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function Stat({
  label,
  value,
  styles,
}: {
  label: string
  value: number
  styles: ReturnType<typeof makeStyles>
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function BookingCard({
  booking,
  businessId,
  styles,
  colors,
  onStatus,
  onSaved,
}: {
  booking: ArtistBooking
  businessId: string | null
  styles: ReturnType<typeof makeStyles>
  colors: BrandPalette
  onStatus: (id: string, next: BookingStatus) => Promise<void>
  onSaved: () => Promise<void>
}) {
  const [amount, setAmount] = useState(booking.invoice ? String(booking.invoice.amount) : "")
  const [note, setNote] = useState(booking.invoice?.note ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const at = new Date(booking.scheduledAt)
  const steps = NEXT_STEPS[booking.status]
  const name = booking.customer?.name?.trim() || "Нэргүй хэрэглэгч"

  async function onSaveInvoice() {
    if (!businessId) return
    setBusy(true)
    setError(null)
    const failed = await saveArtistInvoice(booking.id, businessId, Number(amount), note)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    await onSaved()
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {booking.customer?.isGuest && <Text style={styles.guest}>зочин</Text>}
          </View>
          <Text style={styles.when}>
            {mnDateLabel(at)} · {mnTimeLabel(at)}
          </Text>
        </View>
        <View style={[styles.pill, statusStyle(booking.status, colors)]}>
          <Text style={styles.pillText}>{STATUS_LABEL[booking.status]}</Text>
        </View>
      </View>

      {booking.customer?.phone && (
        <Pressable
          style={styles.phoneRow}
          onPress={() => void Linking.openURL(`tel:${booking.customer!.phone}`)}
        >
          <Ionicons name="call-outline" size={13} color={colors.primary} />
          <Text style={styles.phone}>{booking.customer.phone}</Text>
        </Pressable>
      )}

      <View style={styles.noteBox}>
        <Text style={styles.noteLabel}>ХҮСЭЛТ</Text>
        <Text style={styles.noteText}>{booking.note?.trim() || "Тайлбар бичээгүй."}</Text>
      </View>

      {booking.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={styles.imageRow}>
            {booking.images.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.thumb} contentFit="cover" />
            ))}
          </View>
        </ScrollView>
      )}

      {/* ⚠️ Туршилтын нэхэмжлэх — бодит төлбөр тооцоо хийгддэггүй. */}
      {booking.status === "completed" && (
        <View style={styles.invoice}>
          <View style={styles.invoiceHead}>
            <Ionicons name="receipt-outline" size={14} color={colors.primary} />
            <Text style={styles.invoiceLabel}>Нэхэмжлэх</Text>
            <Text style={styles.invoiceTest}>туршилтын</Text>
          </View>
          <View style={styles.invoiceRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Дүн (₮)"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              style={[styles.input, { width: 110 }]}
            />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Тайлбар"
              placeholderTextColor={colors.muted}
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          <Pressable onPress={onSaveInvoice} disabled={busy} style={styles.invoiceButton}>
            <Text style={styles.invoiceButtonText}>
              {busy ? "Хадгалж байна..." : booking.invoice ? "Дүнг шинэчлэх" : "Нэхэмжлэх үүсгэх"}
            </Text>
          </Pressable>
          {error && <Text style={styles.cardError}>{error}</Text>}
        </View>
      )}

      {steps.length > 0 && (
        <View style={styles.actions}>
          {steps.map((s) => (
            <Pressable
              key={s.status}
              onPress={() => void onStatus(booking.id, s.status)}
              style={[styles.action, s.primary ? styles.actionPrimary : styles.actionGhost]}
            >
              <Text style={[styles.actionText, s.primary && styles.actionTextPrimary]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

function statusStyle(status: BookingStatus, colors: BrandPalette) {
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

    statRow: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginTop: 14 },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 2 },
    statValue: { fontSize: 18, fontWeight: "700", color: colors.ink },
    statLabel: { fontSize: 10, color: colors.muted },

    filterScroll: { marginTop: 14, maxHeight: 44 },
    filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20 },
    chip: {
      height: 34,
      justifyContent: "center",
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    chipTextActive: { color: colors.onPrimary },

    error: { marginHorizontal: 20, marginTop: 10, fontSize: 12, color: colors.danger },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 32 },
    emptyText: { fontSize: 13, color: colors.muted, textAlign: "center" },
    list: { padding: 20, gap: 12, paddingBottom: 110 },

    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    name: { fontSize: 14, fontWeight: "700", color: colors.ink },
    guest: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.muted,
      backgroundColor: colors.surfaceTint,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    when: { fontSize: 12, color: colors.body, marginTop: 2 },
    pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    pillText: { fontSize: 10, fontWeight: "700", color: colors.ink },

    phoneRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
    phone: { fontSize: 12, fontWeight: "600", color: colors.primary },

    noteBox: { marginTop: 10, backgroundColor: colors.surfaceTint, borderRadius: 12, padding: 12 },
    noteLabel: { fontSize: 9, fontWeight: "700", color: colors.muted, letterSpacing: 0.6 },
    noteText: { fontSize: 12, color: colors.ink, lineHeight: 18, marginTop: 3 },

    imageRow: { flexDirection: "row", gap: 8 },
    thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.surfaceTint2 },

    invoice: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outline,
      padding: 12,
      gap: 8,
    },
    invoiceHead: { flexDirection: "row", alignItems: "center", gap: 6 },
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
    invoiceRow: { flexDirection: "row", gap: 8 },
    input: {
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 12,
      fontSize: 13,
      color: colors.ink,
    },
    invoiceButton: {
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    invoiceButtonText: { fontSize: 12, fontWeight: "700", color: colors.onPrimary },
    cardError: { fontSize: 11, color: colors.danger },

    actions: { flexDirection: "row", gap: 8, marginTop: 12 },
    action: { flex: 1, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionPrimary: { backgroundColor: colors.primary },
    actionGhost: { backgroundColor: colors.surfaceTint },
    actionText: { fontSize: 12, fontWeight: "700", color: colors.ink },
    actionTextPrimary: { color: colors.onPrimary },
  })
}
