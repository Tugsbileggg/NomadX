import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AppHeader } from "@/components/AppHeader"
import { AuthButton } from "@/components/auth/AuthButton"
import { BusinessCard } from "@/components/BusinessCard"
import { SelfieCamera, type SelfiePhoto } from "@/components/SelfieCamera"
import type { BrandPalette } from "@/constants/theme"
import {
  analyzeSkin,
  CONCERN_LABEL,
  CONFIDENCE_LABEL,
  fetchMatchingBusinesses,
  SKIN_TYPE_LABEL,
  type SkinAnalysis,
} from "@/lib/ai-advisor"
import type { SearchBusiness } from "@/lib/search"
import { toggleFavourite } from "@/lib/search"
import { useAppTheme } from "@/lib/theme-context"

const CONSENT_KEY = "ai_advisor_consent_seen"

type Step = "intro" | "loading" | "result" | "error"
type PickedImage = { base64: string; mime: string; uri: string }

const TIPS = [
  "Гэрэл сайтай, нүүрэн рүү чиглэсэн орчинд авна уу",
  "Нүүрээ бүрхэлгүй, камер руу шууд харна уу",
  "Гэрэл, будаг хэт хүчтэй биш байхад дүн илүү үнэн зөв гарна",
]

export default function AiAdvisorScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const [step, setStep] = useState<Step>("intro")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<PickedImage | null>(null)
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null)
  const [businesses, setBusinesses] = useState<SearchBusiness[]>([])
  const [businessesLoading, setBusinessesLoading] = useState(false)

  const [consentSeen, setConsentSeen] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [pendingSource, setPendingSource] = useState<"camera" | "library" | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((v) => setConsentSeen(v === "1"))
  }, [])

  function onPressSource(source: "camera" | "library") {
    if (busy) return
    if (!consentSeen) {
      setPendingSource(source)
      setShowConsent(true)
      return
    }
    openSource(source)
  }

  async function onConfirmConsent() {
    await AsyncStorage.setItem(CONSENT_KEY, "1")
    setConsentSeen(true)
    setShowConsent(false)
    if (pendingSource) openSource(pendingSource)
    setPendingSource(null)
  }

  function openSource(source: "camera" | "library") {
    if (source === "camera") {
      // Систем камер сонгогч (ImagePicker) биш өөрийн SelfieCamera-г ашиглана:
      // тэр нь урьдчилан харах ба эцсийн зургаа ХОЁУЛАНГ нь ижил (толин)
      // чиглэлтэй хадгалдаг тул авсан зураг "эргэчихсэн" мэт харагдахгүй.
      setShowCamera(true)
    } else {
      void pickFromLibrary()
    }
  }

  async function pickFromLibrary() {
    setBusy(true)
    setError(null)

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    })

    setBusy(false)
    if (result.canceled) return

    const asset = result.assets[0]
    if (!asset?.base64) {
      setError("Зургийг уншиж чадсангүй. Дахин оролдоно уу.")
      setStep("error")
      return
    }

    const picked: PickedImage = {
      base64: asset.base64,
      mime: asset.mimeType ?? "image/jpeg",
      uri: asset.uri,
    }
    setImage(picked)
    await runAnalysis(picked)
  }

  async function onCameraCapture(photo: SelfiePhoto) {
    setShowCamera(false)
    const picked: PickedImage = { base64: photo.base64, mime: photo.mime, uri: photo.uri }
    setImage(picked)
    await runAnalysis(picked)
  }

  async function runAnalysis(picked: PickedImage) {
    setStep("loading")
    const result = await analyzeSkin({ base64: picked.base64, mime: picked.mime })
    if (!result.ok) {
      setError(result.error)
      setStep("error")
      return
    }

    setAnalysis(result.data)
    setStep("result")

    setBusinessesLoading(true)
    const location = await locateSilently()
    const matches = await fetchMatchingBusinesses(result.data.recommendedCategories, location)
    setBusinesses(matches)
    setBusinessesLoading(false)
  }

  function reset() {
    setStep("intro")
    setImage(null)
    setAnalysis(null)
    setBusinesses([])
    setError(null)
  }

  async function onToggleFavourite(id: string, next: boolean) {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isFavourite: next } : b)))
    const result = await toggleFavourite(id, next)
    if (result === null) {
      setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isFavourite: !next } : b)))
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.page}>
        {step === "intro" && (
          <>
            <View style={styles.iconBox}>
              <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>AI Гоо сайхны зөвлөгөө</Text>
            <Text style={styles.description}>
              Царайныхаа зургаар чанарын ерөнхий ажиглалт аваад, танд тохирсон салон,
              артистуудыг санал болгоно.
            </Text>

            <View style={styles.tipCard}>
              {TIPS.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <AuthButton
                label="Камераар авах"
                onPress={() => onPressSource("camera")}
                busy={busy}
              />
              <AuthButton
                label="Сангаас сонгох"
                onPress={() => onPressSource("library")}
                busy={busy}
                variant="outline"
              />
            </View>

            <Text style={styles.disclaimer}>
              ⚠️ Энэ бол эмнэлгийн онош БИШ — зөвхөн гоо сайхны чанарын ерөнхий зөвлөмж.
            </Text>
          </>
        )}

        {step === "loading" && (
          <View style={styles.center}>
            {image && (
              <Image
                source={{ uri: image.uri }}
                style={styles.previewLarge}
                contentFit="cover"
              />
            )}
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            <Text style={styles.loadingText}>Шинжилж байна…</Text>
          </View>
        )}

        {step === "error" && (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <AuthButton label="Дахин оролдох" onPress={reset} />
          </View>
        )}

        {step === "result" && analysis && (
          <>
            {image && (
              <Image
                source={{ uri: image.uri }}
                style={styles.previewSmall}
                contentFit="cover"
              />
            )}

            <View style={styles.resultCard}>
              <View style={styles.resultHeaderRow}>
                <Text style={styles.resultSkinType}>{SKIN_TYPE_LABEL[analysis.skinType]}</Text>
                <View style={styles.confidencePill}>
                  <Text style={styles.confidenceText}>{CONFIDENCE_LABEL[analysis.confidence]}</Text>
                </View>
              </View>

              {analysis.concerns.length > 0 && (
                <View style={styles.chipRow}>
                  {analysis.concerns.map((c) => (
                    <View key={c} style={styles.chip}>
                      <Text style={styles.chipText}>{CONCERN_LABEL[c]}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.summary}>{analysis.summary}</Text>
            </View>

            <View style={styles.medicalNotice}>
              <Ionicons name="information-circle-outline" size={16} color={colors.body} />
              <Text style={styles.medicalNoticeText}>
                Энэ бол эмнэлгийн зөвлөгөө биш — ноцтой санаа зовоосон зүйл байвал мэргэжлийн
                эмчид хандана уу.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Танд тохирох санал</Text>

            {businessesLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
            ) : businesses.length === 0 ? (
              <Text style={styles.empty}>Тохирох салон одоогоор олдсонгүй.</Text>
            ) : (
              <View style={styles.businessList}>
                {businesses.map((b) => (
                  <BusinessCard
                    key={b.id}
                    business={b}
                    onPress={() => router.push({ pathname: "/business/[id]", params: { id: b.id } })}
                    onToggleFavourite={() => onToggleFavourite(b.id, !b.isFavourite)}
                  />
                ))}
              </View>
            )}

            <View style={styles.retryRow}>
              <AuthButton label="Дахин шинжлүүлэх" onPress={reset} variant="outline" />
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={showConsent} transparent animationType="fade" onRequestClose={() => setShowConsent(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.primary} />
            <Text style={styles.modalTitle}>Нууцлалын мэдэгдэл</Text>
            <Text style={styles.modalBody}>
              Таны зургийг зөвхөн энэ шинжилгээнд ашиглана. Зургийг ХАДГАЛАХГҮЙ — сервер
              шинжилгээ хийсний дараа шууд устгана. Зөвхөн текст үр дүнг (арьсны төрөл гэх мэт)
              түүхэнд хадгална.
            </Text>
            <AuthButton label="Ойлголоо, үргэлжлүүлэх" onPress={() => void onConfirmConsent()} />
            <Pressable onPress={() => { setShowConsent(false); setPendingSource(null) }} hitSlop={8}>
              <Text style={styles.modalCancel}>Цуцлах</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <SelfieCamera
        visible={showCamera}
        onCancel={() => setShowCamera(false)}
        onCapture={(photo) => void onCameraCapture(photo)}
      />
    </SafeAreaView>
  )
}

/** Байршлын зөвшөөрөл асууж, амжилтгүй бол зүгээр `null` буцаана. */
async function locateSilently(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== "granted") return null
  const pos = await Location.getCurrentPositionAsync({})
  return { lat: pos.coords.latitude, lng: pos.coords.longitude }
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfacePage },
    page: { padding: 20, paddingTop: 8, paddingBottom: 96, alignItems: "center" },

    iconBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      marginBottom: 4,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink, textAlign: "center" },
    description: {
      fontSize: 13,
      color: colors.body,
      textAlign: "center",
      lineHeight: 19,
      marginTop: 8,
      marginBottom: 18,
    },

    tipCard: {
      width: "100%",
      gap: 10,
      borderRadius: 16,
      backgroundColor: colors.surfaceTint,
      padding: 16,
      marginBottom: 20,
    },
    tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    tipText: { flex: 1, fontSize: 12, color: colors.body, lineHeight: 17 },

    actions: { width: "100%", gap: 10 },
    disclaimer: {
      fontSize: 11,
      color: colors.muted,
      textAlign: "center",
      marginTop: 18,
      lineHeight: 16,
    },

    center: { alignItems: "center", justifyContent: "center", marginTop: 48, gap: 10, width: "100%" },
    loadingText: { fontSize: 13, color: colors.body, marginTop: 4 },
    errorText: { fontSize: 13, color: colors.ink, textAlign: "center", marginBottom: 6 },

    previewLarge: {
      width: 180,
      height: 180,
      borderRadius: 20,
      backgroundColor: colors.surfaceTint2,
    },
    previewSmall: {
      width: 96,
      height: 96,
      borderRadius: 16,
      backgroundColor: colors.surfaceTint2,
      marginBottom: 14,
    },
    resultCard: {
      width: "100%",
      borderRadius: 18,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 12,
    },
    resultHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    resultSkinType: { fontSize: 17, fontWeight: "700", color: colors.ink },
    confidencePill: {
      borderRadius: 999,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    confidenceText: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      borderRadius: 999,
      backgroundColor: colors.primaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
    summary: { fontSize: 13, color: colors.body, lineHeight: 19 },

    medicalNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      width: "100%",
      borderRadius: 14,
      backgroundColor: colors.warningSoft,
      padding: 12,
      marginTop: 14,
    },
    medicalNoticeText: { flex: 1, fontSize: 11, color: colors.body, lineHeight: 16 },

    sectionTitle: {
      width: "100%",
      fontSize: 15,
      fontWeight: "700",
      color: colors.ink,
      marginTop: 22,
      marginBottom: 12,
    },
    empty: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 12 },
    businessList: { width: "100%", gap: 16 },
    retryRow: { width: "100%", marginTop: 24 },

    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 22,
      alignItems: "center",
      gap: 10,
    },
    modalTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
    modalBody: { fontSize: 13, color: colors.body, textAlign: "center", lineHeight: 19, marginBottom: 8 },
    modalCancel: { fontSize: 12, color: colors.muted, marginTop: 4 },
  })
}
