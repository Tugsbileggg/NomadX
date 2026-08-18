import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Brand } from "@/constants/theme"
import { fetchApprovedBusinesses, type BusinessCard } from "@/lib/businesses"
import { publicAssetUrl } from "@/lib/storage"

const CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Гоо сайхан", icon: "sparkles-outline" },
  { label: "Үсчин", icon: "cut-outline" },
  { label: "Хумс", icon: "hand-left-outline" },
  { label: "Спа, Массаж", icon: "flower-outline" },
  { label: "Арьс арчилгаа", icon: "water-outline" },
]

export default function HomeScreen() {
  const router = useRouter()
  const [category, setCategory] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedBusinesses().then((rows) => {
      setBusinesses(rows)
      setLoading(false)
    })
  }, [])

  const artists = useMemo(
    () =>
      businesses.filter(
        (b) => b.type === "artist" && (!category || b.categories.includes(category)),
      ),
    [businesses, category],
  )
  const salons = useMemo(
    () =>
      businesses.filter(
        (b) => b.type === "salon" && (!category || b.categories.includes(category)),
      ),
    [businesses, category],
  )

  function openBusiness(id: string) {
    router.push({ pathname: "/business/[id]", params: { id } })
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf-outline" size={16} color={Brand.primary} />
            </View>
            <Text style={styles.brandText}>Lumina</Text>
          </View>
          <Pressable hitSlop={8}>
            <Ionicons name="notifications-outline" size={20} color={Brand.body} />
          </Pressable>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Тавтай морил!</Text>
          <Text style={styles.bannerSubtitle}>
            Мэргэжлийн үйлчилгээ, танд тухтай орчинд танд зориулж байна.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((c) => {
            const active = category === c.label
            return (
              <Pressable
                key={c.label}
                onPress={() => setCategory(active ? null : c.label)}
                style={styles.categoryItem}
              >
                <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
                  <Ionicons name={c.icon} size={20} color={active ? "#fff" : Brand.primary} />
                </View>
                <Text style={styles.categoryLabel}>{c.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <View style={styles.aiCard}>
          <View style={styles.aiIconBox}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View style={styles.aiTextBox}>
            <Text style={styles.aiTitle}>Хиймэл оюунаар арьсаа оношлуулах уу?</Text>
            <Text style={styles.aiSubtitle}>Тун удахгүй — тохирох үйлчилгээгээ олоход тусална.</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
        ) : (
          <>
            <BusinessSection title="Онцлох артистууд" businesses={artists} onOpen={openBusiness} />
            <BusinessSection title="Онцлох салонууд" businesses={salons} onOpen={openBusiness} />
          </>
        )}

        <Text style={styles.sectionTitle}>Сэтгэгдлүүд</Text>
        <View style={styles.emptyReviews}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={Brand.muted} />
          <Text style={styles.emptyReviewsText}>Одоогоор сэтгэгдэл алга.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function BusinessSection({
  title,
  businesses,
  onOpen,
}: {
  title: string
  businesses: BusinessCard[]
  onOpen: (id: string) => void
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {businesses.length === 0 ? (
        <Text style={styles.emptyText}>Одоогоор энэ ангилалд бүртгэл алга.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {businesses.map((b) => (
            <BusinessCardTile key={b.id} business={b} onPress={() => onOpen(b.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

function BusinessCardTile({
  business,
  onPress,
}: {
  business: BusinessCard
  onPress: () => void
}) {
  const logoUrl = publicAssetUrl(business.logoPath)
  const initial = (business.name ?? "L").trim().charAt(0).toUpperCase()

  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <View style={styles.tileImage}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.tileImageInner} contentFit="cover" />
        ) : (
          <Text style={styles.tileInitial}>{initial}</Text>
        )}
      </View>
      <Text style={styles.tileName} numberOfLines={1}>
        {business.name}
      </Text>
      {business.categories.length > 0 && (
        <Text style={styles.tileCategories} numberOfLines={1}>
          {business.categories.join(", ")}
        </Text>
      )}
      {business.address && (
        <View style={styles.tileAddressRow}>
          <Ionicons name="location-outline" size={11} color={Brand.muted} />
          <Text style={styles.tileAddress} numberOfLines={1}>
            {business.address}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { padding: 20, paddingBottom: 96, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 18, fontWeight: "700", color: Brand.primary },
  banner: {
    borderRadius: 20,
    backgroundColor: Brand.primary,
    padding: 20,
    gap: 4,
  },
  bannerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  bannerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  categoryRow: { gap: 20, paddingVertical: 4 },
  categoryItem: { alignItems: "center", gap: 6, width: 60 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconActive: { backgroundColor: Brand.primary },
  categoryLabel: { fontSize: 11, color: Brand.body, textAlign: "center" },
  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: Brand.surfaceTint2,
    padding: 16,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTextBox: { flex: 1 },
  aiTitle: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  aiSubtitle: { fontSize: 11, color: Brand.body, marginTop: 2 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Brand.ink },
  emptyText: { fontSize: 12, color: Brand.muted },
  cardRow: { gap: 12, paddingRight: 8 },
  tile: {
    width: 148,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 10,
    gap: 4,
  },
  tileImage: {
    width: "100%",
    height: 96,
    borderRadius: 12,
    backgroundColor: Brand.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 4,
  },
  tileImageInner: { width: "100%", height: "100%" },
  tileInitial: { fontSize: 24, fontWeight: "700", color: Brand.primaryDark },
  tileName: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  tileCategories: { fontSize: 11, color: Brand.body },
  tileAddressRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  tileAddress: { fontSize: 10, color: Brand.muted, flexShrink: 1 },
  emptyReviews: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 16,
  },
  emptyReviewsText: { fontSize: 12, color: Brand.muted },
})
