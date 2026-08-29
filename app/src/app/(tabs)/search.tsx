import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
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

import { BusinessCard, BusinessThumb, HeartButton } from "@/components/BusinessCard"
import { BusinessMap, type MapMarker } from "@/components/BusinessMap"
import { Brand } from "@/constants/theme"
import { distanceMeters, formatDistance } from "@/lib/distance"
import {
  fetchSearchBusinesses,
  formatFromPrice,
  toggleFavourite,
  type SearchBusiness,
} from "@/lib/search"
import { publicAssetUrl } from "@/lib/storage"

const UB_CENTER = { lat: 47.9184, lng: 106.9177 }

/** Эрэмбэлэх сонголтууд — нэг нь л идэвхтэй байна. */
const SORTS = [
  { id: "price", label: "Үнэ" },
  { id: "near", label: "Ойр зайд" },
  { id: "rating", label: "Үнэлгээ" },
] as const

type SortId = (typeof SORTS)[number]["id"]
type Tab = "list" | "map"

type WithDistance = SearchBusiness & { distance: number | null }

export default function SearchScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("list")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortId | null>(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [businesses, setBusinesses] = useState<SearchBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchSearchBusinesses().then((rows) => {
      setBusinesses(rows)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (status !== "granted") return
      const pos = await Location.getCurrentPositionAsync({})
      setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  const visible = useMemo<WithDistance[]>(() => {
    const q = query.trim().toLowerCase()

    const rows = businesses
      .filter((b) => !q || b.name?.toLowerCase().includes(q) || b.categories.some((c) => c.toLowerCase().includes(q)))
      .filter((b) => !openOnly || b.openUntil !== null)
      .map((b) => ({
        ...b,
        distance:
          myLocation && b.lat != null && b.lng != null
            ? distanceMeters(myLocation, { lat: b.lat, lng: b.lng })
            : null,
      }))

    // Утга байхгүй мөрүүдийг үргэлж ард нь тавина — эс тэгвэл үнэгүй,
    // оноогүй бизнесүүд эхэнд гарч ирнэ.
    const last = Number.POSITIVE_INFINITY
    if (sort === "price") rows.sort((a, b) => (a.minPrice ?? last) - (b.minPrice ?? last))
    if (sort === "near") rows.sort((a, b) => (a.distance ?? last) - (b.distance ?? last))
    if (sort === "rating") rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))

    return rows
  }, [businesses, query, sort, openOnly, myLocation])

  const mapped = useMemo(
    () => visible.filter((b) => b.lat != null && b.lng != null),
    [visible],
  )

  const selected = mapped.find((b) => b.id === selectedId) ?? mapped[0] ?? null

  const markers: MapMarker[] = mapped.map((b) => ({
    id: b.id,
    lat: b.lat as number,
    lng: b.lng as number,
    title: b.name ?? "",
    selected: b.id === selected?.id,
  }))

  const onToggleFavourite = useCallback(async (id: string, next: boolean) => {
    // Шууд харуулаад, амжилтгүй бол буцаана.
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isFavourite: next } : b)))
    const result = await toggleFavourite(id, next)
    if (result === null) {
      setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isFavourite: !next } : b)))
    }
  }, [])

  function openBusiness(id: string) {
    router.push({ pathname: "/business/[id]", params: { id } })
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Brand.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Салон эсвэл мастер хайх..."
            placeholderTextColor={Brand.muted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setOpenOnly((v) => !v)}
          style={[styles.filterButton, openOnly && styles.filterButtonActive]}
        >
          <Ionicons name="options-outline" size={18} color={openOnly ? "#fff" : Brand.primary} />
        </Pressable>
      </View>

      <View style={styles.segment}>
        {(["list", "map"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.segmentItem, tab === t && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === "list" ? "Жагсаалт" : "Газрын зураг"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 32 }} />
      ) : tab === "list" ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipRow}
          >
            {SORTS.map((s) => {
              const active = sort === s.id
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSort(active ? null : s.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                </Pressable>
              )
            })}
            <Pressable
              onPress={() => setOpenOnly((v) => !v)}
              style={[styles.chip, openOnly && styles.chipActive]}
            >
              <Text style={[styles.chipText, openOnly && styles.chipTextActive]}>Нээлттэй</Text>
            </Pressable>
          </ScrollView>

          <ScrollView contentContainerStyle={styles.list}>
            {visible.length === 0 ? (
              <Text style={styles.empty}>Тохирох үр дүн олдсонгүй.</Text>
            ) : (
              visible.map((b) => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  onPress={() => openBusiness(b.id)}
                  onToggleFavourite={() => onToggleFavourite(b.id, !b.isFavourite)}
                />
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <View style={styles.mapWrap}>
          <BusinessMap
            center={
              selected?.lat != null && selected.lng != null
                ? { lat: selected.lat, lng: selected.lng }
                : (myLocation ?? UB_CENTER)
            }
            markers={markers}
            onMarkerPress={setSelectedId}
          />

          {selected && (
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Pressable style={styles.sheetTop} onPress={() => openBusiness(selected.id)}>
                <View style={styles.sheetThumb}>
                  <BusinessThumb business={selected} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.sheetTitleRow}>
                    <View style={{ flex: 1, gap: 3 }}>
                      {selected.rating != null && (
                        <View style={styles.sheetRating}>
                          <Ionicons name="star" size={11} color={Brand.gold} />
                          <Text style={styles.ratingText}>{selected.rating.toFixed(1)}</Text>
                        </View>
                      )}
                      <Text style={styles.sheetName} numberOfLines={1}>
                        {selected.name}
                      </Text>
                    </View>
                    <HeartButton
                      active={selected.isFavourite}
                      onPress={() => onToggleFavourite(selected.id, !selected.isFavourite)}
                    />
                  </View>
                  {selected.distance != null && (
                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={12} color={Brand.body} />
                      <Text style={styles.metaText}>{formatDistance(selected.distance)} зайд</Text>
                    </View>
                  )}
                  {selected.minPrice != null && (
                    <>
                      <Text style={styles.sheetPriceLabel}>Үнэ</Text>
                      <Text style={styles.sheetPrice}>
                        {selected.minPrice.toLocaleString("en-US")}₮-с
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>

              <Pressable
                style={styles.sheetButton}
                onPress={() => router.push({ pathname: "/book/[id]", params: { id: selected.id } })}
              >
                <Text style={styles.sheetButtonText}>ЗАХИАЛАХ</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

/* ------------------------------------------------------------- pieces */

/* -------------------------------------------------------------- styles */

const styles = StyleSheet.create({
  // Газрын зургийн доод хуудас нь картын жижиг хувилбар — эдгээр гурав
  // BusinessCard-той хуваалцах хэмжээний биш тул энд үлдээв.
  ratingText: { fontSize: 12, fontWeight: "700", color: Brand.ink },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { flex: 1, fontSize: 12, color: Brand.body },
  safe: { flex: 1, backgroundColor: Brand.surfacePage },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 17, fontWeight: "700", color: Brand.primary },

  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 14 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    borderRadius: 14,
    backgroundColor: Brand.surfaceTint,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 14, color: Brand.ink },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Brand.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: { backgroundColor: Brand.primary },

  segment: {
    flexDirection: "row",
    gap: 4,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 4,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint,
  },
  segmentItem: { flex: 1, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  segmentItemActive: { backgroundColor: Brand.primary },
  segmentText: { fontSize: 13, fontWeight: "600", color: Brand.body },
  segmentTextActive: { color: "#fff" },

  // Хэвтээ ScrollView нь баганан эцэг дотор өндрөө алдаж нурдаг тул
  // чипийн өндрөөр нь тогтоов.
  chipScroll: { flexGrow: 0, flexShrink: 0, height: 34, marginTop: 14 },
  chipRow: { gap: 8, paddingHorizontal: 20 },
  chip: {
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.outlineSoft,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: Brand.body },
  chipTextActive: { color: "#fff" },

  list: { padding: 20, paddingTop: 16, gap: 16, paddingBottom: 96 },
  empty: { fontSize: 13, color: Brand.muted, textAlign: "center", marginTop: 32 },



  mapWrap: { flex: 1, marginTop: 14 },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    // Доод табын дээгүүр гарна.
    bottom: 92,
    // Leaflet-ийн pane-ууд 400-800 z-index-тэй тул түүнээс дээгүүр.
    zIndex: 900,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.outlineSoft,
  },
  sheetTop: { flexDirection: "row", gap: 12 },
  sheetThumb: {
    width: 76,
    height: 76,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Brand.surfaceTint2,
  },
  sheetTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  sheetName: { fontSize: 17, fontWeight: "700", color: Brand.ink },
  sheetRating: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sheetPriceLabel: { fontSize: 11, color: Brand.muted, marginTop: 6 },
  sheetPrice: { fontSize: 15, fontWeight: "700", color: Brand.primary },
  sheetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: Brand.primary,
  },
  sheetButtonText: { fontSize: 14, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
})
