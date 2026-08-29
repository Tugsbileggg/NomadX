import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
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

import { BusinessMap, type MapMarker } from "@/components/BusinessMap"
import type { BrandPalette } from "@/constants/theme"
import { fetchApprovedBusinesses, type BusinessCard } from "@/lib/businesses"
import { distanceMeters, formatDistance } from "@/lib/distance"
import { publicAssetUrl } from "@/lib/storage"
import { useAppTheme } from "@/lib/theme-context"

const UB_CENTER = { lat: 47.9184, lng: 106.9177 }

type WithDistance = BusinessCard & { distance: number | null }

export default function SearchScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [query, setQuery] = useState("")
  const [businesses, setBusinesses] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)

  useEffect(() => {
    fetchApprovedBusinesses().then((rows) => {
      setBusinesses(rows)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (status !== "granted") {
        setLocationDenied(true)
        return
      }
      const pos = await Location.getCurrentPositionAsync({})
      setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  const q = query.trim().toLowerCase()

  const salons = useMemo(
    () =>
      businesses.filter(
        (b) => b.type === "salon" && (!q || b.name?.toLowerCase().includes(q)),
      ),
    [businesses, q],
  )

  const artists = useMemo<WithDistance[]>(() => {
    const filtered = businesses.filter(
      (b) => b.type === "artist" && (!q || b.name?.toLowerCase().includes(q)),
    )
    const withDist = filtered.map((b) => ({
      ...b,
      distance:
        myLocation && b.lat != null && b.lng != null
          ? distanceMeters(myLocation, { lat: b.lat, lng: b.lng })
          : null,
    }))
    withDist.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    return q ? withDist : withDist.slice(0, 5)
  }, [businesses, q, myLocation])

  const salonMarkers: MapMarker[] = salons
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({ id: s.id, lat: s.lat as number, lng: s.lng as number, title: s.name ?? "" }))

  function openBusiness(id: string) {
    router.push({ pathname: "/business/[id]", params: { id } })
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Салон эсвэл артистын нэрээр хайх"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={styles.mapWrap}>
            <BusinessMap
              center={myLocation ?? UB_CENTER}
              markers={salonMarkers}
              onMarkerPress={openBusiness}
            />
            <View style={styles.mapLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Салонууд ({salonMarkers.length})</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.listPage}>
            <Text style={styles.sectionTitle}>
              {q ? "Хувиараа артистууд" : "Хамгийн ойрхон артистууд"}
            </Text>
            {locationDenied && (
              <Text style={styles.hint}>
                Байршлын зөвшөөрөл өгвөл танд хамгийн ойрхон артистуудыг харуулна.
              </Text>
            )}
            {artists.length === 0 ? (
              <Text style={styles.hint}>Одоогоор олдсонгүй.</Text>
            ) : (
              artists.map((a) => (
                <ArtistRow key={a.id} artist={a} onPress={() => openBusiness(a.id)} />
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Нууцлалын тухай</Text>
            <Text style={styles.hint}>
              Хувиараа артистууд нэвтэрсэн хэрэглэгчид газрын зураг дээр яг байрлалаараа
              харагдахгүй — захиалга баталгаажсны дараа л дэлгэрэнгүй байршил солилцоно.
            </Text>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

function ArtistRow({ artist, onPress }: { artist: WithDistance; onPress: () => void }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const logoUrl = publicAssetUrl(artist.logoPath)
  const initial = (artist.name ?? "L").trim().charAt(0).toUpperCase()

  return (
    <Pressable onPress={onPress} style={styles.artistRow}>
      <View style={styles.artistLogo}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.artistLogoImage} contentFit="cover" />
        ) : (
          <Text style={styles.artistInitial}>{initial}</Text>
        )}
      </View>
      <View style={styles.artistBody}>
        <Text style={styles.artistName}>{artist.name}</Text>
        {artist.categories.length > 0 && (
          <Text style={styles.artistCategories}>{artist.categories.join(", ")}</Text>
        )}
      </View>
      {artist.distance != null && (
        <View style={styles.distancePill}>
          <Ionicons name="navigate-outline" size={11} color={colors.primary} />
          <Text style={styles.distanceText}>{formatDistance(artist.distance)}</Text>
        </View>
      )}
    </Pressable>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 8,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.ink },
    mapWrap: { height: 220, marginHorizontal: 20, borderRadius: 18, overflow: "hidden" },
    mapLegend: {
      position: "absolute",
      left: 10,
      bottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    legendText: { fontSize: 11, fontWeight: "600", color: colors.ink },
    listPage: { padding: 20, paddingTop: 16, gap: 10, paddingBottom: 96 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
    hint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
    artistRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      padding: 10,
    },
    artistLogo: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    artistLogoImage: { width: "100%", height: "100%" },
    artistInitial: { fontSize: 16, fontWeight: "700", color: colors.primaryDark },
    artistBody: { flex: 1 },
    artistName: { fontSize: 13, fontWeight: "700", color: colors.ink },
    artistCategories: { fontSize: 11, color: colors.body },
    distancePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderRadius: 999,
      backgroundColor: colors.surfaceTint2,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    distanceText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  })
}
