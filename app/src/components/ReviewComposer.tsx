import { Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"
import { deleteMyReview, saveReview, type ReviewEligibility } from "@/lib/reviews"

/**
 * Сэтгэгдэл бичих / засах.
 *
 * Зөвхөн тухайн бизнест дууссан захиалгатай хүнд харагдана — DB-ийн дүрэм
 * ч мөн адил (0017). Эрхгүй хүнд юу ч харуулахгүй: "танд боломжгүй" гэж
 * сануулах нь ач холбогдолгүй.
 */
export function ReviewComposer({
  businessId,
  eligibility,
  onSaved,
}: {
  businessId: string
  eligibility: ReviewEligibility
  onSaved: () => void
}) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { canReview, bookingId, mine } = eligibility
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(mine?.rating ?? 0)
  const [body, setBody] = useState(mine?.body ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canReview) return null

  function start() {
    setRating(mine?.rating ?? 0)
    setBody(mine?.body ?? "")
    setError(null)
    setOpen(true)
  }

  async function onSubmit() {
    setBusy(true)
    setError(null)
    const failed = await saveReview(businessId, rating, body, bookingId)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    setOpen(false)
    onSaved()
  }

  async function onDelete() {
    if (!mine) return
    setBusy(true)
    setError(null)
    const failed = await deleteMyReview(mine.id)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    setOpen(false)
    onSaved()
  }

  return (
    <>
      <Pressable onPress={start} style={styles.prompt}>
        <Ionicons
          name={mine ? "create-outline" : "star-outline"}
          size={16}
          color={colors.primary}
        />
        <Text style={styles.promptText}>
          {mine ? "Сэтгэгдлээ засах" : "Үйлчилгээний талаар сэтгэгдэл үлдээх"}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.muted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{mine ? "Сэтгэгдэл засах" : "Сэтгэгдэл үлдээх"}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={styles.label}>Үнэлгээ</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Pressable key={i} onPress={() => setRating(i + 1)} hitSlop={6}>
                  <Ionicons
                    name={i < rating ? "star" : "star-outline"}
                    size={32}
                    color={colors.gold}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 18 }]}>Тайлбар (заавал биш)</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Үйлчилгээ ямар байсан бэ? Бусад хүмүүст тус болох зүйлээ бичээрэй."
              placeholderTextColor={colors.muted}
              multiline
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={onSubmit}
              disabled={busy || rating === 0}
              style={[styles.submit, (busy || rating === 0) && styles.submitDisabled]}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.submitText}>{mine ? "Хадгалах" : "Илгээх"}</Text>
              )}
            </Pressable>

            {mine && (
              <Pressable onPress={onDelete} disabled={busy} style={styles.delete}>
                <Text style={styles.deleteText}>Сэтгэгдлээ устгах</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    prompt: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
    },
    promptText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.ink },

    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.surfacePage,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
    },
    sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },

    label: { fontSize: 12, fontWeight: "600", color: colors.body, marginTop: 16 },
    starsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    input: {
      marginTop: 8,
      minHeight: 96,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 14,
      fontSize: 13,
      color: colors.ink,
      textAlignVertical: "top",
    },
    error: { marginTop: 12, fontSize: 12, color: colors.danger },

    submit: {
      marginTop: 20,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    submitDisabled: { opacity: 0.5 },
    submitText: { fontSize: 14, fontWeight: "700", color: colors.onPrimary },

    delete: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
    deleteText: { fontSize: 12, fontWeight: "600", color: colors.danger },
  })
}
