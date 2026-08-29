import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { Brand } from "@/constants/theme"
import { formatDistance } from "@/lib/distance"
import { formatFromPrice, type SearchBusiness } from "@/lib/search"
import { publicAssetUrl } from "@/lib/storage"

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
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardCover}>
        <BusinessThumb business={business} />

        {business.rating != null && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={Brand.gold} />
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
          <Ionicons name="location-outline" size={12} color={Brand.body} />
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
        color={active ? Brand.primary : Brand.primaryLight}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: "#fff", overflow: "hidden" },
  cardCover: { height: 170, backgroundColor: Brand.surfaceTint2 },
  thumbFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryContainer,
  },
  thumbInitial: { fontSize: 28, fontWeight: "700", color: Brand.primaryDark },
  ratingBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#fff",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ratingText: { fontSize: 12, fontWeight: "700", color: Brand.ink },
  cardHeart: { position: "absolute", right: 12, top: 12 },
  heart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBody: { padding: 16, gap: 8 },
  cardName: { fontSize: 17, fontWeight: "700", color: Brand.ink },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { flex: 1, fontSize: 12, color: Brand.body },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: { borderRadius: 8, backgroundColor: Brand.surfaceTint, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 11, fontWeight: "600", color: Brand.primaryDark },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700", color: Brand.primary },
  openPill: { borderRadius: 8, backgroundColor: Brand.primaryContainer, paddingHorizontal: 10, paddingVertical: 5 },
  openText: { fontSize: 11, fontWeight: "700", color: Brand.primaryDark },
})
