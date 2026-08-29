import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { RegisterSteps } from "@/components/artist/RegisterSteps"
import type { BrandPalette } from "@/constants/theme"
import { ARTIST_CATEGORIES, fetchArtistDraft, saveArtistInfo } from "@/lib/artist-registration"
import { useAuth } from "@/lib/auth-context"
import { useAppTheme } from "@/lib/theme-context"

/** 1-р алхам — хэн болох, хаана ажилладаг, ямар чиглэлээр. */
export default function ArtistInfoScreen() {
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Буцаж ирээд засах боломжтой — өмнө оруулсныг нь дүүргэнэ.
  useEffect(() => {
    fetchArtistDraft().then((draft) => {
      if (draft) {
        setName(draft.name)
        setPhone(draft.phone)
        setAddress(draft.address)
        setAbout(draft.about)
        setCategories(draft.categories)
      }
      setLoading(false)
    })
  }, [])

  function toggle(category: string) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  async function onNext() {
    setBusy(true)
    setError(null)
    const failed = await saveArtistInfo({ name, phone, address, about, categories })
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    await refreshAccount()
    router.push("/(artist)/register/documents")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <RegisterSteps current={1} />

        <Text style={styles.title}>Таны тухай</Text>
        <Text style={styles.subtitle}>
          Эдгээр мэдээлэл үйлчлүүлэгчид харагдана. Дараа нь засаж болно.
        </Text>

        <View style={styles.card}>
          <AuthInput
            label="Ажлын нэр"
            icon="color-palette-outline"
            placeholder="Жишээ: М. Уянга Nails"
            value={name}
            onChangeText={setName}
          />
          <AuthInput
            label="Утасны дугаар"
            icon="call-outline"
            placeholder="9911 2233"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <AuthInput
            label="Хаяг"
            icon="location-outline"
            placeholder="Дүүрэг, хороо, байр"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <Text style={styles.label}>Ямар чиглэлээр ажилладаг вэ?</Text>
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

        <Text style={styles.label}>Танилцуулга (заавал биш)</Text>
        <TextInput
          value={about}
          onChangeText={setAbout}
          placeholder="Туршлага, онцлог үйлчилгээгээ товч бичнэ үү."
          placeholderTextColor={colors.muted}
          multiline
          style={styles.textArea}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.action}>
          <AuthButton label="Үргэлжлүүлэх" onPress={onNext} busy={busy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingBottom: 48, gap: 4 },
    title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginTop: 20 },
    subtitle: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 8 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 12, marginTop: 8 },
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
    error: { marginTop: 14, fontSize: 12, color: colors.danger },
    action: { marginTop: 24 },
  })
}
