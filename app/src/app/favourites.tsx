import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BusinessCard } from "@/components/BusinessCard"
import { useAppTheme } from "@/lib/theme-context"
import type { BrandPalette } from "@/constants/theme"
import { fetchFavouriteBusinesses, toggleFavourite, type SearchBusiness } from "@/lib/search"

/**
 * Дуртай газрууд.
 *
 * Зүрхэн товч нь Хайх дэлгэц дээр 0013-оос хойш байсан ч тэмдэглэсэн
 * газраа хаанаас ч харах боломжгүй байв.
 */
export default function FavouritesScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const [items, setItems] = useState<SearchBusiness[]>([])
  const [loading, setLoading] = useState(true)

  // Профайлаас буцаж ирэх бүрд шинэчилнэ — өөр дэлгэцээс зүрхийг
  // унтраасан байж болно.
  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchFavouriteBusinesses().then((rows) => {
        if (!active) return
        setItems(rows)
        setLoading(false)
      })
      return () => {
        active = false
      }
    }, []),
  )

  async function onRemove(id: string) {
    // Хариу ирэхээс өмнө жагсаалтаас хасна — буцаж унтарвал сэргээнэ.
    const previous = items
    setItems((prev) => prev.filter((b) => b.id !== id))

    const failed = await toggleFavourite(id, false)
    if (failed) setItems(previous)
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Дуртай газрууд</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color={colors.primaryLight} />
          <Text style={styles.emptyTitle}>Одоогоор дуртай газар алга</Text>
          <Text style={styles.emptyBody}>
            Хайх дэлгэц дээрх зүрхэн товчоор дуртай салон, артистаа тэмдэглээрэй.
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => router.replace("/search")}>
            <Text style={styles.emptyButtonText}>Хайх руу очих</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              onPress={() => router.push({ pathname: "/business/[id]", params: { id: b.id } })}
              onToggleFavourite={() => onRemove(b.id)}
            />
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
    list: { padding: 20, paddingTop: 4, gap: 16, paddingBottom: 40 },

    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
    emptyTitle: { fontSize: 15, fontWeight: "700", color: colors.ink, marginTop: 6 },
    emptyBody: { fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },
    emptyButton: {
      marginTop: 10,
      height: 44,
      paddingHorizontal: 24,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyButtonText: { fontSize: 13, fontWeight: "700", color: colors.onPrimary },
  })
}
