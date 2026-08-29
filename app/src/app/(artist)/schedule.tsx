import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import {
  fetchArtistSchedule,
  saveArtistSchedule,
  SLOT_OPTIONS,
  WEEKDAY_LABELS,
  type ArtistSchedule,
} from "@/lib/artist-catalog"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Ажлын цагийн тохиргоо.
 *
 * Энд хадгалсан зүйл нь үйлчлүүлэгчийн аппад харагдах цагийн жагсаалтыг
 * ШУУД тодорхойлно — DB-ийн `validate_booking()` триггер ижил дүрмээр
 * шалгадаг тул энд буруу тавьбал захиалга орохгүй болно.
 */
export default function ArtistScheduleScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const [schedule, setSchedule] = useState<ArtistSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useEffect(() => {
    fetchArtistSchedule().then((s) => {
      setSchedule(s)
      setLoading(false)
    })
  }, [])

  function updateDay(weekday: number, patch: Partial<ArtistSchedule["days"][number]>) {
    setSchedule((prev) =>
      prev
        ? { ...prev, days: prev.days.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)) }
        : prev,
    )
  }

  async function onSave() {
    if (!schedule) return
    setBusy(true)
    setMessage(null)
    const failed = await saveArtistSchedule(schedule)
    setBusy(false)
    setMessage(
      failed ? { text: failed, isError: true } : { text: "Хуваарийг хадгаллаа.", isError: false },
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Хуваарь</Text>
      </View>

      {loading || !schedule ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.hint}>
            Энд тохируулсан цаг үйлчлүүлэгчийн аппад шууд харагдана. Амарна гэж
            тэмдэглэсэн өдөр захиалга авахгүй.
          </Text>

          <View style={styles.card}>
            {schedule.days.map((d) => (
              <View key={d.weekday} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{WEEKDAY_LABELS[d.weekday]}</Text>

                <Pressable
                  onPress={() => updateDay(d.weekday, { isClosed: !d.isClosed })}
                  style={styles.closedToggle}
                >
                  <View style={[styles.checkbox, d.isClosed && styles.checkboxOn]}>
                    {d.isClosed && <Ionicons name="checkmark" size={12} color={colors.onPrimary} />}
                  </View>
                  <Text style={styles.closedText}>Амарна</Text>
                </Pressable>

                {d.isClosed ? (
                  <View style={{ flex: 1 }} />
                ) : (
                  <View style={styles.timeRow}>
                    <TextInput
                      value={d.open}
                      onChangeText={(v) => updateDay(d.weekday, { open: v })}
                      placeholder="09:00"
                      placeholderTextColor={colors.muted}
                      maxLength={5}
                      style={styles.timeInput}
                    />
                    <Text style={styles.dash}>–</Text>
                    <TextInput
                      value={d.close}
                      onChangeText={(v) => updateDay(d.weekday, { close: v })}
                      placeholder="18:00"
                      placeholderTextColor={colors.muted}
                      maxLength={5}
                      style={styles.timeInput}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.section}>Нэг цагийн урт</Text>
          <View style={styles.chipRow}>
            {SLOT_OPTIONS.map((m) => {
              const active = schedule.slotMinutes === m
              return (
                <Pressable
                  key={m}
                  onPress={() => setSchedule({ ...schedule, slotMinutes: m })}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{m} мин</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.section}>Нэг цагт зэрэг үйлчлэх тоо</Text>
          <TextInput
            value={String(schedule.slotCapacity)}
            onChangeText={(v) =>
              setSchedule({ ...schedule, slotCapacity: Math.max(1, Number(v) || 1) })
            }
            keyboardType="number-pad"
            style={[styles.timeInput, { width: 90, marginTop: 8 }]}
          />
          <Text style={styles.subHint}>
            Ганцаараа ажилладаг бол 1. Дүүрсэн цагийг үйлчлүүлэгчид харуулахгүй.
          </Text>

          {message && (
            <Text style={[styles.message, message.isError && styles.messageError]}>
              {message.text}
            </Text>
          )}

          <View style={{ marginTop: 20 }}>
            <AuthButton label="Хадгалах" onPress={onSave} busy={busy} />
          </View>
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
      paddingBottom: 10,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink },
    page: { padding: 20, paddingTop: 4, paddingBottom: 48 },
    hint: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 14 },

    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 12 },
    dayRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    dayLabel: { width: 58, fontSize: 12, fontWeight: "600", color: colors.ink },
    closedToggle: { flexDirection: "row", alignItems: "center", gap: 6 },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    closedText: { fontSize: 11, color: colors.body },
    timeRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 },
    timeInput: {
      height: 38,
      width: 66,
      borderRadius: 10,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 10,
      fontSize: 13,
      color: colors.ink,
      textAlign: "center",
    },
    dash: { fontSize: 13, color: colors.body },

    section: { fontSize: 12, fontWeight: "600", color: colors.body, marginTop: 22 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    chipTextActive: { color: colors.onPrimary },
    subHint: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 6 },

    message: { marginTop: 16, fontSize: 12, color: colors.success },
    messageError: { color: colors.danger },
  })
}
