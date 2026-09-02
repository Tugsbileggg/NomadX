import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { BusinessMap } from "@/components/BusinessMap"
import type { BrandPalette } from "@/constants/theme"
import { MAP_ZOOM_OVERVIEW, MAP_ZOOM_PIN, UB_CENTER } from "@/lib/map-style"
import {
  ARTIST_CATEGORIES,
  fetchArtistProfile,
  saveArtistProfile,
  uploadArtistImage,
} from "@/lib/artist-profile"
import { useAuth } from "@/lib/auth-context"
import { useAppTheme } from "@/lib/theme-context"

/** Батлагдсаны дараа ч мэдээллээ шинэчилж болно (0003-ийн дүрэм). */
export default function ArtistProfileEditScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const { refreshAccount } = useAuth()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [about, setAbout] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  // Газрын зураг дээрх цэг. `pinMoved` нь энэ удаагийн засварт эзэн нь
  // өөрөө хөдөлгөсөн эсэхийг заана — хөдөлгөөгүй бол хаяг өөрчлөгдөхөд
  // geocode-д даатгана.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [pinMoved, setPinMoved] = useState(false)
  // Зургийн харагдацыг ачаалах үед нэг л удаа тогтооно — цэг тавих бүрд
  // төвлөрүүлбэл зураг үсэрч, ажиллахад эвгүй болно. Хадгалсан цэгтэй бол
  // түүн дээр ойртоно, үгүй бол хот бүхэлдээ харагдаж хайх боломж өгнө.
  const [mapView, setMapView] = useState<{
    center: { lat: number; lng: number }
    zoom: number
  } | null>(null)

  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    const p = await fetchArtistProfile()
    if (p) {
      setName(p.name)
      setPhone(p.phone)
      setAddress(p.address)
      setAbout(p.about)
      setCategories(p.categories)
      setLogoUrl(p.logoUrl)
      setCoverUrl(p.coverUrl)

      const saved = p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null
      setCoords(saved)
      setMapView(
        saved
          ? { center: saved, zoom: MAP_ZOOM_PIN }
          : { center: UB_CENTER, zoom: MAP_ZOOM_OVERVIEW },
      )
    }
    setLoading(false)
  }

  function toggle(category: string) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  async function onPickImage(kind: "logo" | "cover") {
    // Зургийн сангаас сонгоход зөвшөөрөл ШААРДЛАГАГҮЙ — iOS нь системийн
    // сонгогчийг ашигладаг тул апп зургийн санд хандахгүй. Урьд нь энд
    // `requestMediaLibraryPermissionsAsync()` дуудаж байсан нь эсрэгээрээ
    // хааж байв: нэг удаа татгалзсан хэрэглэгчид iOS дахин асуухгүй, шууд
    // `granted: false` буцаадаг тул сонгогч хэзээ ч нээгдэхгүй болдог.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // Лого дөрвөлжин, ковер өргөн — хэрэглэгч өөрөө тайрна.
      allowsEditing: true,
      aspect: kind === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    if (!asset?.base64) {
      setMessage({ text: "Зургийг уншиж чадсангүй.", isError: true })
      return
    }

    setUploading(kind)
    setMessage(null)
    const failed = await uploadArtistImage(kind, {
      base64: asset.base64,
      mime: asset.mimeType ?? "image/jpeg",
    })
    setUploading(null)

    if (failed) {
      setMessage({ text: failed, isError: true })
      return
    }
    await load()
  }

  async function onSave() {
    setBusy(true)
    setMessage(null)
    const failed = await saveArtistProfile({
      name,
      phone,
      address,
      about,
      categories,
      coords: pinMoved ? coords : null,
    })
    setBusy(false)
    if (failed) {
      setMessage({ text: failed, isError: true })
      return
    }
    // Толгойд харагдах нэр өөрчлөгдсөн байж болзошгүй.
    await refreshAccount()
    setMessage({ text: "Хадгалагдлаа.", isError: false })
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Профайл засах</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <Pressable onPress={() => void onPickImage("cover")} style={styles.cover}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : null}
            <View style={styles.coverOverlay}>
              {uploading === "cover" ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={16} color={colors.onPrimary} />
                  <Text style={styles.coverText}>Ковер зураг</Text>
                </>
              )}
            </View>
          </Pressable>

          <Pressable onPress={() => void onPickImage("logo")} style={styles.logoRow}>
            <View style={styles.logo}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <Ionicons name="person-outline" size={22} color={colors.primary} />
              )}
              {uploading === "logo" && (
                <View style={styles.logoBusy}>
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                </View>
              )}
            </View>
            <Text style={styles.logoHint}>Профайл зураг солих</Text>
          </Pressable>

          <View style={styles.card}>
            <AuthInput
              label="Ажлын нэр"
              icon="color-palette-outline"
              value={name}
              onChangeText={setName}
            />
            <AuthInput
              label="Утасны дугаар"
              icon="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <AuthInput
              label="Хаяг"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <Text style={styles.label}>Байршил</Text>
          <View style={styles.mapBox}>
            <BusinessMap
              center={mapView?.center ?? UB_CENTER}
              zoom={mapView?.zoom ?? MAP_ZOOM_OVERVIEW}
              markers={
                coords
                  ? [{ id: "pin", lat: coords.lat, lng: coords.lng, title: name || "Байршил", selected: true }]
                  : []
              }
              onMarkerPress={() => {}}
              onMapPress={(c) => {
                setCoords(c)
                setPinMoved(true)
              }}
            />
          </View>
          <Text style={styles.subHint}>
            {coords
              ? `Газрын зураг дээр дарж цэгээ зөөнө. Одоогийн цэг: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : "Газрын зураг дээр дарж байршлаа тэмдэглэнэ үү."}
            {"\n"}Тэмдэглээгүй бол хаягаас чинь хайхыг оролдох бөгөөд олдохгүй байж болно.
          </Text>

          <Text style={styles.label}>Чиглэл</Text>
          <View style={styles.chipRow}>
            {ARTIST_CATEGORIES.map((c) => {
              const active = categories.includes(c)
              return (
                <Pressable
                  key={c}
                  onPress={() => toggle(c)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  {active && <Ionicons name="checkmark" size={13} color={colors.onPrimary} />}
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.label}>Танилцуулга</Text>
          <TextInput
            value={about}
            onChangeText={setAbout}
            placeholder="Туршлага, онцлог үйлчилгээгээ товч бичнэ үү."
            placeholderTextColor={colors.muted}
            multiline
            style={styles.textArea}
          />

          {message && (
            <Text style={[styles.message, message.isError && styles.messageError]}>
              {message.text}
            </Text>
          )}

          <View style={{ marginTop: 20 }}>
            <AuthButton label="Хадгалах" onPress={onSave} busy={busy} />
          </View>
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
      paddingBottom: 10,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink },
    page: { padding: 20, paddingTop: 4, paddingBottom: 48 },

    cover: {
      height: 140,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.surfaceTint2,
      justifyContent: "flex-end",
    },
    coverOverlay: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingVertical: 8,
    },
    coverText: { fontSize: 12, fontWeight: "600", color: colors.onPrimary },

    logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    logoBusy: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    logoHint: { fontSize: 12, fontWeight: "600", color: colors.primary },

    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 12, marginTop: 18 },
    mapBox: {
      height: 220,
      marginTop: 8,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.surfaceTint2,
    },
    subHint: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 8 },
    label: { fontSize: 12, fontWeight: "600", color: colors.body, marginTop: 20 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.ink },
    chipTextActive: { color: colors.onPrimary },
    textArea: {
      marginTop: 8,
      minHeight: 96,
      borderRadius: 14,
      backgroundColor: colors.surface,
      padding: 14,
      fontSize: 13,
      lineHeight: 19,
      color: colors.ink,
      textAlignVertical: "top",
    },
    message: { marginTop: 16, fontSize: 12, color: colors.success },
    messageError: { color: colors.danger },
  })
}
