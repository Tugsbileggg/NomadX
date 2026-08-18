import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { Brand } from "@/constants/theme"
import { createBooking } from "@/lib/bookings"
import { fetchBusiness, type BusinessCard } from "@/lib/businesses"
import { mnWeekdayShort } from "@/lib/mn-date"

const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i) // 09:00 .. 19:00

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + i)
    return d
  })
}

function dayLabel(d: Date, index: number) {
  if (index === 0) return "Өнөөдөр"
  if (index === 1) return "Маргааш"
  return `${mnWeekdayShort(d)}, ${d.getDate()}`
}

export default function BookScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [business, setBusiness] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [dayIndex, setDayIndex] = useState(0)
  const [hour, setHour] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const days = useMemo(() => nextDays(7), [])

  useEffect(() => {
    fetchBusiness(id).then((b) => {
      setBusiness(b)
      setLoading(false)
    })
  }, [id])

  async function onConfirm() {
    if (hour == null) {
      setError("Цагаа сонгоно уу.")
      return
    }
    setBusy(true)
    setError(null)
    const scheduled = new Date(days[dayIndex])
    scheduled.setHours(hour, 0, 0, 0)
    const failed = await createBooking(id, scheduled, note)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Захиалга илгээгдлээ</Text>
          <Text style={styles.successBody}>
            {business?.name} таны захиалгыг удахгүй баталгаажуулна. &ldquo;Захиалга&rdquo;
            tab-аас хянах боломжтой.
          </Text>
          <AuthButton label="Захиалгууд руу очих" onPress={() => router.replace("/bookings")} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Brand.primary} />
      </Pressable>

      {loading ? (
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.title}>Цаг захиалах</Text>
          <Text style={styles.subtitle}>{business?.name}</Text>

          <Text style={styles.sectionLabel}>Өдөр сонгох</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={styles.dayRow}>
              {days.map((d, i) => {
                const active = i === dayIndex
                return (
                  <Pressable
                    key={d.toISOString()}
                    onPress={() => setDayIndex(i)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                      {dayLabel(d, i)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Цаг сонгох</Text>
          <View style={styles.hourGrid}>
            {HOURS.map((h) => {
              const active = h === hour
              return (
                <Pressable
                  key={h}
                  onPress={() => setHour(h)}
                  style={[styles.hourChip, active && styles.hourChipActive]}
                >
                  <Text style={[styles.hourChipText, active && styles.hourChipTextActive]}>
                    {String(h).padStart(2, "0")}:00
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Нэмэлт тэмдэглэл (заавал биш)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Жишээ: Хумсны засалт хийлгэмээр байна"
            placeholderTextColor={Brand.muted}
            multiline
            style={styles.noteInput}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: 20 }}>
            <AuthButton label="Захиалгаа баталгаажуулах" onPress={onConfirm} busy={busy} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  back: { marginTop: 8, marginLeft: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  page: { padding: 20, paddingBottom: 64 },
  title: { fontSize: 22, fontWeight: "700", color: Brand.ink },
  subtitle: { fontSize: 13, color: Brand.body, marginTop: 2, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  dayRow: { flexDirection: "row", gap: 8 },
  dayChip: { paddingHorizontal: 14, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  dayChipActive: { backgroundColor: Brand.primary },
  dayChipText: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  dayChipTextActive: { color: "#fff" },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  hourChip: { width: "22%", height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  hourChipActive: { backgroundColor: Brand.primary },
  hourChipText: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  hourChipTextActive: { color: "#fff" },
  noteInput: { marginTop: 8, minHeight: 72, borderRadius: 14, backgroundColor: "#fff", padding: 14, fontSize: 13, color: Brand.ink, textAlignVertical: "top" },
  error: { marginTop: 12, fontSize: 12, color: Brand.danger, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.success, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  successTitle: { fontSize: 18, fontWeight: "700", color: Brand.ink, textAlign: "center" },
  successBody: { fontSize: 13, color: Brand.body, textAlign: "center", lineHeight: 19, marginBottom: 12 },
})
