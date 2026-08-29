import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { formatDistance } from "@/lib/distance"
import { formatFromPrice, type SearchBusiness } from "@/lib/search"
import { publicAssetUrl } from "@/lib/storage"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Бизнесийн карт — Хайх дэлгэц болон Дуртай жагсаалт хоёулаа ашиглана.
 *
 * Зай нь заавал биш: байршлын зөвшөөрөл өгөөгүй үед, мөн дуртай
 * жагсаалтад тооцогдохгүй.
 */
export type CardBusiness = SearchBusiness & { distance?: number | null }

export function BusinessCard({
  business,
  onPress,
  onToggleFavourite,
}: {
  business: CardBusiness
  onPress: () => void
  onToggleFavourite: () => void
}) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardCover}>
        <BusinessThumb business={business} />

        {business.rating != null && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={colors.gold} />
            <Text style={styles.ratingText}>{business.rating.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.cardHeart}>
          <HeartButton active={business.isFavourite} onPress={onToggleFavourite} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {business.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.body} />
          <Text style={styles.metaText} numberOfLines={1}>
            {business.address ?? "Хаяг оруулаагүй"}
            {business.distance != null && ` · ${formatDistance(business.distance)} зайд`}
          </Text>
        </View>

        {business.categories.length > 0 && (
          <View style={styles.tagRow}>
            {business.categories.slice(0, 2).map((c) => (
              <View key={c} style={styles.tag}>
                <Text style={styles.tagText}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            {business.minPrice != null ? formatFromPrice(business.minPrice) : "Үнэ тодорхойгүй"}
          </Text>
          {business.openUntil && (
            <View style={styles.openPill}>
              <Text style={styles.openText}>өнөөдөр нээлттэй</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

/** Ковер байхгүй бол лого, тэр ч байхгүй бол эхний үсэг. */
export function BusinessThumb({ business }: { business: SearchBusiness }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const url = publicAssetUrl(business.coverPath) ?? publicAssetUrl(business.logoPath)
  const initial = (business.name ?? "L").trim().charAt(0).toUpperCase()

  if (url) {
    return <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
  }
  return (
    <View style={styles.thumbFallback}>
      <Text style={styles.thumbInitial}>{initial}</Text>
    </View>
  )
}

export function HeartButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <Pressable
      onPress={(e) => {
        // Карт дээрх дарах үйлдлийг тасална — үгүй бол профайл нээгдэнэ.
        e.stopPropagation()
        onPress()
      }}
      hitSlop={8}
      style={styles.heart}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={18}
        color={active ? colors.primary : colors.primaryLight}
      />
    </Pressable>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    card: { borderRadius: 20, backgroundColor: colors.surface, overflow: "hidden" },
    cardCover: { height: 170, backgroundColor: colors.surfaceTint2 },
    thumbFallback: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryContainer,
    },
    thumbInitial: { fontSize: 28, fontWeight: "700", color: colors.primaryDark },
    ratingBadge: {
      position: "absolute",
      left: 12,
      bottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      backgroundColor: colors.surface,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    ratingText: { fontSize: 12, fontWeight: "700", color: colors.ink },
    cardHeart: { position: "absolute", right: 12, top: 12 },
    heart: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surface, opacity: 0.94,
      alignItems: "center",
      justifyContent: "center",
    },

    cardBody: { padding: 16, gap: 8 },
    cardName: { fontSize: 17, fontWeight: "700", color: colors.ink },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { flex: 1, fontSize: 12, color: colors.body },
    tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    tag: { borderRadius: 8, backgroundColor: colors.surfaceTint, paddingHorizontal: 10, paddingVertical: 5 },
    tagText: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
    cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
    price: { fontSize: 16, fontWeight: "700", color: colors.primary },
    openPill: { borderRadius: 8, backgroundColor: colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 5 },
    openText: { fontSize: 11, fontWeight: "700", color: colors.primaryDark },
  })
}
