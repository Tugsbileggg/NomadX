import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Brand } from "@/constants/theme"
import { fetchBusiness, type BusinessCard } from "@/lib/businesses"
import { publicAssetUrl } from "@/lib/storage"

export default function BusinessDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [business, setBusiness] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchBusiness(id).then((b) => {
      if (active) {
        setBusiness(b)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [id])

  const logoUrl = publicAssetUrl(business?.logoPath)
  const coverUrl = publicAssetUrl(business?.coverPath)
  const initial = (business?.name ?? "L").trim().charAt(0).toUpperCase()

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Brand.primary} />
      </Pressable>

      {loading ? (
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 48 }} />
      ) : !business ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Бизнес олдсонгүй.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.cover}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : null}
          </View>

          <View style={styles.headerCard}>
            <View style={styles.logo}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} contentFit="cover" />
              ) : (
                <Text style={styles.logoInitial}>{initial}</Text>
              )}
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {business.type === "salon" ? "Салон" : "Хувиараа артист"}
              </Text>
            </View>
            <Text style={styles.name}>{business.name}</Text>
            {business.categories.length > 0 && (
              <Text style={styles.categories}>{business.categories.join(" · ")}</Text>
            )}
            {business.address && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={Brand.body} />
                <Text style={styles.address}>{business.address}</Text>
              </View>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Танилцуулга</Text>
            <Text style={styles.panelBody}>
              {business.about || "Одоогоор танилцуулга бичээгүй байна."}
            </Text>
          </View>

          <Pressable
            style={styles.bookButton}
            onPress={() => router.push({ pathname: "/book/[id]", params: { id: business.id } })}
          >
            <Text style={styles.bookButtonText}>Цаг авах</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  back: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: Brand.muted },
  page: { paddingBottom: 48 },
  cover: { height: 160, backgroundColor: Brand.primaryContainer },
  headerCard: {
    marginTop: -32,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: -48,
    borderWidth: 4,
    borderColor: "#fff",
  },
  logoImage: { width: "100%", height: "100%" },
  logoInitial: { fontSize: 24, fontWeight: "700", color: Brand.primaryDark },
  typeBadge: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint2,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 11, fontWeight: "600", color: Brand.primary },
  name: { fontSize: 20, fontWeight: "700", color: Brand.ink, marginTop: 6, textAlign: "center" },
  categories: { fontSize: 13, color: Brand.body, marginTop: 2 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  address: { fontSize: 12, color: Brand.body },
  panel: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 20,
  },
  panelTitle: { fontSize: 14, fontWeight: "700", color: Brand.ink, marginBottom: 8 },
  panelBody: { fontSize: 13, lineHeight: 20, color: Brand.body },
  bookButton: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 52,
    borderRadius: 999,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
})
