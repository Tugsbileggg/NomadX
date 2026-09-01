import { Ionicons } from "@expo/vector-icons"
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

import { AppHeader } from "@/components/AppHeader"
import { BusinessCard, BusinessThumb, HeartButton } from "@/components/BusinessCard"
import { BusinessMap, type MapMarker } from "@/components/BusinessMap"
import type { BrandPalette } from "@/constants/theme"
import { distanceMeters, formatDistance } from "@/lib/distance"
import { MAP_ZOOM_OVERVIEW, UB_CENTER } from "@/lib/map-style"
import { fetchSearchBusinesses, toggleFavourite, type SearchBusiness } from "@/lib/search"
import { useAppTheme } from "@/lib/theme-context"

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
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [tab, setTab] = useState<Tab>("list")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortId | null>(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [businesses, setBusinesses] = useState<SearchBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  // Хоосон эхэлнэ — газрын зураг эхлээд өөрийн байршил дээр төвлөрч,
  // доод карт нь зөвхөн салон сонгосон үед л гарна.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Төв нь өөрчлөгдөөгүй ч (зураг чирсний дараа) дахин голлуулах түлхүүр.
  const [recenterKey, setRecenterKey] = useState(0)

  useEffect(() => {
    fetchSearchBusinesses().then((rows) => {
      setBusinesses(rows)
      setLoading(false)
    })
  }, [])

  /** Зөвшөөрөл асууж, өөрийн байршлыг тогтооно. Татгалзвал null. */
  const locate = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") return null

    const pos = await Location.getCurrentPositionAsync({})
    const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    setMyLocation(next)
    return next
  }, [])

  useEffect(() => {
    void locate()
  }, [locate])

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

  // Зөвхөн хэрэглэгч цэг дээр дарсан үед л сонголт үүснэ — эхний удаад
  // ямар ч салон сонгогдохгүй тул доод карт зай эзлэхгүй.
  const selected = selectedId ? (mapped.find((b) => b.id === selectedId) ?? null) : null

  const mapCenter =
    selected?.lat != null && selected.lng != null
      ? { lat: selected.lat, lng: selected.lng }
      : (myLocation ?? UB_CENTER)

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

  /** Сонголтыг цуцалж, өөрийн байршил руу буцна. */
  async function recenterOnMe() {
    setSelectedId(null)
    setRecenterKey((n) => n + 1)
    await locate()
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Салон эсвэл мастер хайх..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setOpenOnly((v) => !v)}
          style={[styles.filterButton, openOnly && styles.filterButtonActive]}
        >
          <Ionicons name="options-outline" size={18} color={openOnly ? colors.onPrimary : colors.primary} />
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
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
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
            center={mapCenter}
            // Салон сонгоход ойртолтыг хэвээр үлдээж зөвхөн зөөнө — эс тэгвэл
            // ойртсоноос болж бусад салонууд дэлгэцээс гарч алга болно.
            zoom={selected ? undefined : MAP_ZOOM_OVERVIEW}
            markers={markers}
            myLocation={myLocation}
            recenterKey={recenterKey}
            onMarkerPress={setSelectedId}
            onMapPress={() => setSelectedId(null)}
          />

          <Pressable
            onPress={recenterOnMe}
            style={styles.locateButton}
            accessibilityLabel="Миний байршил"
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </Pressable>

          {selected && (
            <View style={styles.sheet}>
              {/* Мэдээллийн мөр нь дэлгэрэнгүй рүү, товч нь захиалга руу
                  тусад нь ордог — Pressable-ууд давхарлахгүй. */}
              <Pressable style={styles.sheetTop} onPress={() => openBusiness(selected.id)}>
                <View style={styles.sheetThumb}>
                  <BusinessThumb business={selected} />
                </View>

                <View style={styles.sheetBody}>
                  <View style={styles.sheetTitleRow}>
                    <Text style={styles.sheetName} numberOfLines={1}>
                      {selected.name}
                    </Text>
                    {selected.rating != null && (
                      <View style={styles.sheetRating}>
                        <Ionicons name="star" size={10} color={colors.gold} />
                        <Text style={styles.ratingText}>{selected.rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={colors.body} />
                    <Text style={styles.metaText} numberOfLines={2}>
                      {selected.address ?? "Хаяг оруулаагүй"}
                    </Text>
                  </View>

                  {(selected.distance != null || selected.openUntil) && (
                    <Text style={styles.subMeta} numberOfLines={1}>
                      {[
                        selected.distance != null
                          ? `${formatDistance(selected.distance)} зайд`
                          : null,
                        selected.openUntil ? `өнөөдөр ${selected.openUntil} хүртэл` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  )}
                </View>

                <HeartButton
                  active={selected.isFavourite}
                  onPress={() => onToggleFavourite(selected.id, !selected.isFavourite)}
                />
              </Pressable>

              <Pressable
                style={styles.sheetButton}
                onPress={() => router.push({ pathname: "/book/[id]", params: { id: selected.id } })}
              >
                <Text style={styles.sheetButtonText}>ЗАХИАЛАХ</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.onPrimary} />
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

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    // Газрын зургийн доод хуудас нь картын жижиг хувилбар — эдгээр гурав
    // BusinessCard-той хуваалцах хэмжээний биш тул энд үлдээв.
    ratingText: { fontSize: 12, fontWeight: "700", color: colors.ink },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { flex: 1, fontSize: 12, color: colors.body },
    safe: { flex: 1, backgroundColor: colors.surfacePage },


    searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 14 },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 14,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.ink },
    filterButton: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    filterButtonActive: { backgroundColor: colors.primary },

    segment: {
      flexDirection: "row",
      gap: 4,
      marginHorizontal: 20,
      marginTop: 12,
      padding: 4,
      borderRadius: 999,
      backgroundColor: colors.surfaceTint,
    },
    segmentItem: { flex: 1, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    segmentItemActive: { backgroundColor: colors.primary },
    segmentText: { fontSize: 13, fontWeight: "600", color: colors.body },
    segmentTextActive: { color: colors.onPrimary },

    // Хэвтээ ScrollView нь баганан эцэг дотор өндрөө алдаж нурдаг тул
    // чипийн өндрөөр нь тогтоов.
    chipScroll: { flexGrow: 0, flexShrink: 0, height: 34, marginTop: 14 },
    chipRow: { gap: 8, paddingHorizontal: 20 },
    chip: {
      height: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      justifyContent: "center",
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.body },
    chipTextActive: { color: colors.onPrimary },

    list: { padding: 20, paddingTop: 16, gap: 16, paddingBottom: 96 },
    empty: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 32 },



    mapWrap: { flex: 1, marginTop: 14 },

    // Leaflet-ийн pane-ууд 400-800 z-index-тэй тул зургийн дээрх бүх зүйл
    // түүнээс дээгүүр байх ёстой.
    locateButton: {
      position: "absolute",
      right: 16,
      top: 16,
      zIndex: 900,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    /* Салон сонгосон үед л гарах товч карт — дэлгэрэнгүй рүү орох гарц. */
    sheet: {
      position: "absolute",
      left: 16,
      right: 16,
      // Доод табын дээгүүр гарна.
      bottom: 92,
      zIndex: 900,
      gap: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 12,
    },
    sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    sheetThumb: {
      width: 56,
      height: 56,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: colors.surfaceTint2,
    },
    sheetBody: { flex: 1, gap: 3 },
    sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    sheetName: { flexShrink: 1, fontSize: 15, fontWeight: "700", color: colors.ink },
    sheetRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderRadius: 999,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    subMeta: { fontSize: 11, color: colors.muted },
    sheetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    sheetButtonText: { fontSize: 13, fontWeight: "700", color: colors.onPrimary, letterSpacing: 0.5 },
  })
}
