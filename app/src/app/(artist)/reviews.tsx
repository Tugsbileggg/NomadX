import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import { fetchArtistReviews, replyToArtistReview, type ArtistReview } from "@/lib/artist-catalog"
import { mnTimeAgo } from "@/lib/mn-date"
import { useAppTheme } from "@/lib/theme-context"

/** Сэтгэгдлүүд — хариу бичих боломжтой. */
export default function ArtistReviewsScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const [reviews, setReviews] = useState<ArtistReview[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setReviews(await fetchArtistReviews())
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Сэтгэгдэл</Text>
        {average != null && (
          <View style={styles.avgPill}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={styles.avgText}>{average.toFixed(1)}</Text>
            <Text style={styles.avgCount}>({reviews.length})</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.primaryLight} />
          <Text style={styles.emptyText}>
            Одоогоор сэтгэгдэл алга. Үйлчилгээ дууссаны дараа үйлчлүүлэгч үлдээх боломжтой.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} styles={styles} colors={colors} onSaved={load} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function ReviewCard({
  review,
  styles,
  colors,
  onSaved,
}: {
  review: ArtistReview
  styles: ReturnType<typeof makeStyles>
  colors: BrandPalette
  onSaved: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(review.reply ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onReply() {
    setBusy(true)
    setError(null)
    const failed = await replyToArtistReview(review.id, text)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    setOpen(false)
    await onSaved()
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{review.authorName}</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Ionicons
                key={i}
                name={i < review.rating ? "star" : "star-outline"}
                size={12}
                color={colors.gold}
              />
            ))}
          </View>
        </View>
        <Text style={styles.age}>{mnTimeAgo(review.createdAt)}</Text>
      </View>

      {review.body && <Text style={styles.body}>{review.body}</Text>}

      {review.reply && !open && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Таны хариу</Text>
          <Text style={styles.replyText}>{review.reply}</Text>
        </View>
      )}

      {open ? (
        <View style={styles.replyForm}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Хариугаа бичнэ үү. Хоосон илгээвэл хариу устана."
            placeholderTextColor={colors.muted}
            multiline
            style={styles.input}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.replyActions}>
            <Pressable onPress={onReply} disabled={busy} style={styles.send}>
              <Text style={styles.sendText}>{busy ? "Илгээж байна..." : "Илгээх"}</Text>
            </Pressable>
            <Pressable onPress={() => setOpen(false)} style={styles.cancel}>
              <Text style={styles.cancelText}>Болих</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setOpen(true)} style={styles.replyLink}>
          <Ionicons name="return-down-forward-outline" size={14} color={colors.primary} />
          <Text style={styles.replyLinkText}>{review.reply ? "Хариуг засах" : "Хариу бичих"}</Text>
        </Pressable>
      )}
    </View>
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
    avgPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginLeft: "auto",
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    avgText: { fontSize: 12, fontWeight: "700", color: colors.ink },
    avgCount: { fontSize: 11, color: colors.muted },

    page: { padding: 20, paddingTop: 4, gap: 12, paddingBottom: 48 },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 40 },
    emptyText: { fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },

    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    author: { fontSize: 13, fontWeight: "700", color: colors.ink },
    stars: { flexDirection: "row", gap: 2, marginTop: 3 },
    age: { fontSize: 11, color: colors.muted },
    body: { fontSize: 12, color: colors.body, lineHeight: 18, marginTop: 8 },

    replyBox: { marginTop: 10, backgroundColor: colors.surfaceTint, borderRadius: 12, padding: 12 },
    replyLabel: { fontSize: 10, fontWeight: "700", color: colors.muted },
    replyText: { fontSize: 12, color: colors.ink, lineHeight: 18, marginTop: 3 },

    replyLink: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
    replyLinkText: { fontSize: 12, fontWeight: "600", color: colors.primary },

    replyForm: { marginTop: 10, gap: 8 },
    input: {
      minHeight: 76,
      borderRadius: 12,
      backgroundColor: colors.surfaceTint,
      padding: 12,
      fontSize: 12,
      color: colors.ink,
      textAlignVertical: "top",
    },
    error: { fontSize: 11, color: colors.danger },
    replyActions: { flexDirection: "row", gap: 8 },
    send: {
      flex: 1,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendText: { fontSize: 12, fontWeight: "700", color: colors.onPrimary },
    cancel: {
      height: 38,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: { fontSize: 12, fontWeight: "600", color: colors.body },
  })
}
