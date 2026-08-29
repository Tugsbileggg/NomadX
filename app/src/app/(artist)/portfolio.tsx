import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import {
  deleteArtistMedia,
  fetchArtistMedia,
  uploadArtistMedia,
  type ArtistMedia,
} from "@/lib/artist-catalog"
import { useAppTheme } from "@/lib/theme-context"

const TILE = (Dimensions.get("window").width - 40 - 10) / 2

/** Бүтээлийн зургууд — үйлчлүүлэгчийн профайл дээр харагдана. */
export default function ArtistPortfolioScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const [items, setItems] = useState<ArtistMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setItems(await fetchArtistMedia())
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  async function onAdd() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) {
      setError("Зураг сонгохын тулд зургийн сангийн зөвшөөрөл өгнө үү.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // Бүтээл харуулах зориулалттай тул чанарыг арай өндөр авав.
      quality: 0.8,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    if (!asset?.base64) {
      setError("Зургийг уншиж чадсангүй. Дахин оролдоно уу.")
      return
    }

    setBusy(true)
    setError(null)
    const failed = await uploadArtistMedia(
      { base64: asset.base64, mime: asset.mimeType ?? "image/jpeg" },
      "",
    )
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    await load()
  }

  async function onDelete(id: string) {
    const previous = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    const failed = await deleteArtistMedia(id)
    if (failed) {
      setItems(previous)
      setError(failed)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Бүтээлүүд</Text>
        <Pressable onPress={onAdd} disabled={busy} hitSlop={8} style={{ marginLeft: "auto" }}>
          {busy ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Ionicons name="add" size={24} color={colors.primary} />
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.hint}>
          Хийсэн ажлынхаа зургийг нэмээрэй — профайл дээр тань харагдана.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={36} color={colors.primaryLight} />
            <Text style={styles.emptyText}>Одоогоор зураг алга. Дээрх + товчоор нэмнэ үү.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={styles.tile}>
                {item.url && (
                  <Image source={{ uri: item.url }} style={styles.image} contentFit="cover" />
                )}
                <Pressable onPress={() => void onDelete(item.id)} hitSlop={6} style={styles.remove}>
                  <Ionicons name="close" size={14} color={colors.onPrimary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    hint: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 14 },
    error: { fontSize: 12, color: colors.danger, marginBottom: 10 },

    empty: { alignItems: "center", gap: 10, marginTop: 40 },
    emptyText: { fontSize: 12, color: colors.muted, textAlign: "center" },

    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    tile: {
      width: TILE,
      height: TILE,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: colors.surfaceTint2,
    },
    image: { width: "100%", height: "100%" },
    remove: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  })
}
