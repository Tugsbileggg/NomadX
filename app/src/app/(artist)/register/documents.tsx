import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { RegisterSteps } from "@/components/artist/RegisterSteps"
import type { BrandPalette } from "@/constants/theme"
import type { DocumentKind } from "@/lib/db-types"
import {
  DOC_LABEL,
  OPTIONAL_DOCS,
  REQUIRED_DOCS,
  fetchArtistDocuments,
  uploadArtistDocument,
} from "@/lib/artist-registration"
import { useAuth } from "@/lib/auth-context"
import { useAppTheme } from "@/lib/theme-context"

/** 2-р алхам — баримт бичиг. Зөвхөн үнэмлэх заавал. */
export default function ArtistDocumentsScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const { account, refreshAccount } = useAuth()
  const businessId = account?.business?.id

  const [uploaded, setUploaded] = useState<Set<DocumentKind>>(new Set())
  const [loading, setLoading] = useState(true)
  const [busyKind, setBusyKind] = useState<DocumentKind | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) {
      setLoading(false)
      return
    }
    fetchArtistDocuments(businessId).then((set) => {
      setUploaded(set)
      setLoading(false)
    })
  }, [businessId])

  async function onPick(kind: DocumentKind) {
    if (!businessId) return

    // Зургийн сангаас сонгоход зөвшөөрөл ШААРДЛАГАГҮЙ — iOS нь системийн
    // сонгогчийг ашигладаг тул апп зургийн санд хандахгүй. Урьд нь энд
    // `requestMediaLibraryPermissionsAsync()` дуудаж байсан нь эсрэгээрээ
    // хааж байв: нэг удаа татгалзсан хэрэглэгчид iOS дахин асуухгүй, шууд
    // `granted: false` буцаадаг тул сонгогч хэзээ ч нээгдэхгүй болдог.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // Баримт бичиг тод байх ёстой тул чанарыг захиалгын зургаас өндөр авав.
      quality: 0.8,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    if (!asset?.base64) {
      setError("Зургийг уншиж чадсангүй. Дахин оролдоно уу.")
      return
    }

    setBusyKind(kind)
    setError(null)
    const failed = await uploadArtistDocument(businessId, kind, {
      base64: asset.base64,
      mime: asset.mimeType ?? "image/jpeg",
    })
    setBusyKind(null)

    if (failed) {
      setError(failed)
      return
    }
    setUploaded((prev) => new Set(prev).add(kind))
    await refreshAccount()
  }

  const missing = REQUIRED_DOCS.filter((k) => !uploaded.has(k))

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
        <RegisterSteps current={2} />

        <Text style={styles.title}>Баримт бичиг</Text>
        <Text style={styles.subtitle}>
          Эдгээрийг зөвхөн Lumina-гийн шалгагч харна — үйлчлүүлэгчид харагдахгүй.
        </Text>

        {[...REQUIRED_DOCS, ...OPTIONAL_DOCS].map((kind) => {
          const done = uploaded.has(kind)
          const required = REQUIRED_DOCS.includes(kind)
          return (
            <Pressable
              key={kind}
              onPress={() => void onPick(kind)}
              disabled={busyKind !== null}
              style={[styles.docCard, done && styles.docCardDone]}
            >
              <View style={[styles.docIcon, done && styles.docIconDone]}>
                {busyKind === kind ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons
                    name={done ? "checkmark" : "camera-outline"}
                    size={20}
                    color={done ? colors.onPrimary : colors.primary}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>
                  {DOC_LABEL[kind].title}
                  {!required && <Text style={styles.optional}> · заавал биш</Text>}
                </Text>
                <Text style={styles.docHint}>
                  {done ? "Хавсаргасан. Дарж солино." : DOC_LABEL[kind].hint}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          )
        })}

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.action}>
          <AuthButton
            label={missing.length ? "Үнэмлэхээ хавсаргана уу" : "Үргэлжлүүлэх"}
            onPress={() => router.push("/(artist)/register/contract")}
            disabled={missing.length > 0}
          />
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Буцах</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingBottom: 48 },
    title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginTop: 20 },
    subtitle: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 16 },
    docCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.outlineSoft,
    },
    docCardDone: { borderColor: colors.primary },
    docIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    docIconDone: { backgroundColor: colors.primary },
    docTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
    optional: { fontSize: 11, fontWeight: "500", color: colors.muted },
    docHint: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 2 },
    error: { marginTop: 14, fontSize: 12, color: colors.danger },
    action: { marginTop: 28, gap: 4 },
    back: { alignItems: "center", paddingVertical: 12 },
    backText: { fontSize: 13, fontWeight: "600", color: colors.body },
  })
}
