import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Brand } from "@/constants/theme"
import { fetchApprovedBusinesses, type BusinessCard } from "@/lib/businesses"
import { publicAssetUrl } from "@/lib/storage"

type Mode = "salon" | "artist" | "mobile"

const MODES: { key: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "salon", label: "Салонд очих", icon: "business-outline" },
  { key: "artist", label: "Артистын гэрт", icon: "home-outline" },
  { key: "mobile", label: "Дуудлагаар", icon: "car-outline" },
]

const CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Гоо сайхан", icon: "sparkles-outline" },
  { label: "Үсчин", icon: "cut-outline" },
  { label: "Хумс", icon: "hand-left-outline" },
  { label: "Спа, Массаж", icon: "flower-outline" },
  { label: "Арьс арчилгаа", icon: "water-outline" },
]

export default function HomeScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("salon")
  const [category, setCategory] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedBusinesses().then((rows) => {
      setBusinesses(rows)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (mode !== "mobile" && b.type !== mode) return false
      if (category && !b.categories.includes(category)) return false
      return true
    })
  }, [businesses, mode, category])

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Brand.primary} />
            <Text style={styles.locationText}>Улаанбаатар хот</Text>
          </View>
          <Ionicons name="notifications-outline" size={20} color={Brand.body} />
        </View>

        <View style={styles.switcher}>
          {MODES.map((m) => {
            const active = mode === m.key
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[styles.switchPill, active && styles.switchPillActive]}
              >
                <Ionicons name={m.icon} size={15} color={active ? "#fff" : Brand.primary} />
                <Text style={[styles.switchLabel, active && styles.switchLabelActive]}>
                  {m.label}
                </Text>
              </Pressable>
            )
          })}
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
            <Text style={styles.aiTitle}>Арьсаа AI-аар оношлуулах уу?</Text>
            <Text style={styles.aiSubtitle}>Тун удахгүй — тохирох үйлчилгээгээ олоход тусална.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {mode === "salon" ? "Салонууд" : mode === "artist" ? "Артистууд" : "Бүх мэргэжилтэн"}
        </Text>

        {loading ? (
          <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>Одоогоор энэ ангилалд бүртгэл алга.</Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((b) => (
              <BusinessRow
                key={b.id}
                business={b}
                onPress={() => router.push({ pathname: "/business/[id]", params: { id: b.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function BusinessRow({
  business,
  onPress,
}: {
  business: BusinessCard
  onPress: () => void
}) {
  const logoUrl = publicAssetUrl(business.logoPath)
  const initial = (business.name ?? "L").trim().charAt(0).toUpperCase()

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardLogo}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.cardLogoImage} contentFit="cover" />
        ) : (
          <Text style={styles.cardLogoInitial}>{initial}</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTypeBadge}>
          <Text style={styles.cardTypeBadgeText}>
            {business.type === "salon" ? "Салон" : "Артист"}
          </Text>
        </View>
        <Text style={styles.cardName}>{business.name}</Text>
        {business.categories.length > 0 && (
          <Text style={styles.cardCategories}>{business.categories.join(", ")}</Text>
        )}
        {business.address && (
          <View style={styles.cardAddressRow}>
            <Ionicons name="location-outline" size={12} color={Brand.muted} />
            <Text style={styles.cardAddress} numberOfLines={1}>
              {business.address}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Brand.muted} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  page: { padding: 20, paddingBottom: 96, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 14, fontWeight: "600", color: Brand.ink },
  switcher: { flexDirection: "row", gap: 8 },
  switchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  switchPillActive: { backgroundColor: Brand.primary },
  switchLabel: { fontSize: 12, fontWeight: "600", color: Brand.primary, textAlign: "center" },
  switchLabelActive: { color: "#fff" },
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
  aiTitle: { fontSize: 14, fontWeight: "700", color: Brand.ink },
  aiSubtitle: { fontSize: 12, color: Brand.body, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Brand.ink, marginTop: 4 },
  emptyText: { fontSize: 13, color: Brand.muted, textAlign: "center", marginTop: 24 },
  list: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 12,
  },
  cardLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Brand.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardLogoImage: { width: "100%", height: "100%" },
  cardLogoInitial: { fontSize: 20, fontWeight: "700", color: Brand.primaryDark },
  cardBody: { flex: 1, gap: 2 },
  cardTypeBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardTypeBadgeText: { fontSize: 10, fontWeight: "600", color: Brand.primary },
  cardName: { fontSize: 14, fontWeight: "700", color: Brand.ink },
  cardCategories: { fontSize: 12, color: Brand.body },
  cardAddressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardAddress: { fontSize: 11, color: Brand.muted, flexShrink: 1 },
})
