import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import { fetchArtistBookings, STATUS_LABEL, type ArtistBooking } from "@/lib/artist-bookings"
import { mnTimeLabel } from "@/lib/mn-date"
import { dateKey, weekdayIndex } from "@/lib/ub-time"
import { useAppTheme } from "@/lib/theme-context"

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"]
const WEEKDAY_FULL = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"]

/** Даваагаар эхэлсэн, 7-гийн үржвэр урттай сарын нүднүүд. */
function buildGrid(year: number, monthIdx: number) {
  const cells: { date: Date; muted: boolean }[] = []
  const first = weekdayIndex(new Date(year, monthIdx, 1))
  const days = new Date(year, monthIdx + 1, 0).getDate()

  for (let i = first; i > 0; i--) cells.push({ date: new Date(year, monthIdx, 1 - i), muted: true })
  for (let d = 1; d <= days; d++) cells.push({ date: new Date(year, monthIdx, d), muted: false })
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true })
  }
  return cells
}

/** Артистын календарь — сарын сүлжээ, сонгосон өдрийн захиалгууд. */
export default function ArtistCalendarScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => ({ year: today.getFullYear(), monthIdx: today.getMonth() }))
  const [selected, setSelected] = useState(() => dateKey(today))
  const [bookings, setBookings] = useState<ArtistBooking[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchArtistBookings().then((data) => {
        if (!active) return
        setBookings(data.bookings)
        setLoading(false)
      })
      return () => {
        active = false
      }
    }, []),
  )

  // Цуцлагдсан захиалга өдрийг "завгүй" болгохгүй.
  const busy = useMemo(
    () => new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => dateKey(new Date(b.scheduledAt)))),
    [bookings],
  )
  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => dateKey(new Date(b.scheduledAt)) === selected)
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [bookings, selected],
  )

  const grid = useMemo(() => buildGrid(month.year, month.monthIdx), [month])
  const todayKey = dateKey(today)
  const selectedDate = new Date(`${selected}T00:00:00`)

  function shift(by: number) {
    setMonth((m) => {
      const next = new Date(m.year, m.monthIdx + by, 1)
      return { year: next.getFullYear(), monthIdx: next.getMonth() }
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>Календарь</Text>

        <View style={styles.card}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => shift(-1)} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={colors.body} />
            </Pressable>
            <Text style={styles.monthText}>
              {month.year} оны {month.monthIdx + 1}-р сар
            </Text>
            <Pressable onPress={() => shift(1)} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={colors.body} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={styles.weekday}>
                {d}
              </Text>
            ))}
            {grid.map((c) => {
              const key = dateKey(c.date)
              const isToday = key === todayKey && !c.muted
              const isSelected = key === selected && !c.muted
              return (
                <Pressable
                  key={key}
                  onPress={() => !c.muted && setSelected(key)}
                  style={[styles.cell, isToday && styles.cellToday, isSelected && !isToday && styles.cellSelected]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      c.muted && styles.cellTextMuted,
                      isToday && styles.cellTextToday,
                    ]}
                  >
                    {c.date.getDate()}
                  </Text>
                  {!c.muted && busy.has(key) && !isToday && <View style={styles.dot} />}
                </Pressable>
              )
            })}
          </View>
        </View>

        <Text style={styles.dayTitle}>
          {selectedDate.getMonth() + 1}-р сарын {selectedDate.getDate()},{" "}
          {WEEKDAY_FULL[weekdayIndex(selectedDate)]}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : dayBookings.length === 0 ? (
          <Text style={styles.empty}>Энэ өдөр захиалга алга.</Text>
        ) : (
          <View style={{ gap: 10, marginTop: 10 }}>
            {dayBookings.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.push("/(artist)/(panel)/bookings")}
                style={styles.slot}
              >
                <Text style={styles.slotTime}>{mnTimeLabel(new Date(b.scheduledAt))}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotName}>
                    {b.customer?.name?.trim() || "Нэргүй хэрэглэгч"}
                  </Text>
                  {b.note?.trim() && (
                    <Text style={styles.slotNote} numberOfLines={2}>
                      {b.note}
                    </Text>
                  )}
                </View>
                <Text style={styles.slotStatus}>{STATUS_LABEL[b.status]}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 20, paddingBottom: 110 },
    title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 14 },

    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
    monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    monthText: { fontSize: 14, fontWeight: "700", color: colors.ink },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
    weekday: {
      width: `${100 / 7}%`,
      textAlign: "center",
      fontSize: 10,
      fontWeight: "600",
      color: colors.muted,
      paddingVertical: 6,
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
    cellToday: { backgroundColor: colors.primary },
    cellSelected: { borderWidth: 1.5, borderColor: colors.primary },
    cellText: { fontSize: 12, color: colors.ink },
    cellTextMuted: { color: colors.muted, opacity: 0.5 },
    cellTextToday: { color: colors.onPrimary, fontWeight: "700" },
    dot: { position: "absolute", bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },

    dayTitle: { fontSize: 13, fontWeight: "700", color: colors.ink, marginTop: 20 },
    empty: { fontSize: 12, color: colors.muted, marginTop: 14, textAlign: "center" },

    slot: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 12,
    },
    slotTime: { width: 46, fontSize: 13, fontWeight: "700", color: colors.primary },
    slotName: { fontSize: 13, fontWeight: "600", color: colors.ink },
    slotNote: { fontSize: 11, color: colors.body, marginTop: 2, lineHeight: 16 },
    slotStatus: { fontSize: 10, fontWeight: "600", color: colors.muted },
  })
}
