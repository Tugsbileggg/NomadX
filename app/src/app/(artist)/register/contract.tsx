import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { AuthInput } from "@/components/auth/AuthInput"
import { RegisterSteps } from "@/components/artist/RegisterSteps"
import type { BrandPalette } from "@/constants/theme"
import { submitArtistRegistration } from "@/lib/artist-registration"
import { useAuth } from "@/lib/auth-context"
import { useAppTheme } from "@/lib/theme-context"

/** Гэрээний гол заалтууд — бүтэн эх нь баталгаажсаны дараа профайлаас. */
const TERMS = [
  "Үйлчлүүлэгчээс ирсэн захиалгыг цаг тухайд нь хариулж, баталгаажуулсан цагаа сахина.",
  "Профайлдаа оруулсан мэдээлэл, зураг нь өөрийн бодит ажил байх ёстой.",
  "Үйлчилгээний үнийг үйлчлүүлэгчид урьдчилан ойлгомжтой мэдэгдэнэ.",
  "Lumina нь бүртгэлийг шалгах, зөрчил гарвал түдгэлзүүлэх эрхтэй.",
]

/** 3-р алхам — гэрээ зөвшөөрч, бүртгэлээ илгээх. */
export default function ArtistContractScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const { account, refreshAccount } = useAuth()

  const [agreed, setAgreed] = useState(false)
  const [signedName, setSignedName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    const businessId = account?.business?.id
    if (!businessId) {
      setError("Бүртгэл олдсонгүй. Эхний алхмаас эхэлнэ үү.")
      return
    }
    if (!agreed) {
      setError("Гэрээний нөхцөлийг зөвшөөрнө үү.")
      return
    }

    setBusy(true)
    setError(null)
    const failed = await submitArtistRegistration(businessId, signedName)
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    await refreshAccount()
    // Илгээсний дараа буцах утгагүй — төлвийн дэлгэц рүү бүрмөсөн шилжинэ.
    router.replace("/(artist)")
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <RegisterSteps current={3} />

        <Text style={styles.title}>Гэрээ</Text>
        <Text style={styles.subtitle}>
          Доорх нөхцөлийг уншиж, зөвшөөрснөө цахим гарын үсгээр баталгаажуулна уу.
        </Text>

        <View style={styles.card}>
          {TERMS.map((t, i) => (
            <View key={t} style={styles.term}>
              <Text style={styles.termNumber}>{i + 1}</Text>
              <Text style={styles.termText}>{t}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => setAgreed((v) => !v)} style={styles.agreeRow}>
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
          </View>
          <Text style={styles.agreeText}>Дээрх нөхцөлийг зөвшөөрч байна.</Text>
        </Pressable>

        <View style={styles.card}>
          <AuthInput
            label="Цахим гарын үсэг"
            icon="create-outline"
            placeholder="Овог нэрээ бүтнээр бичнэ үү"
            value={signedName}
            onChangeText={setSignedName}
          />
        </View>

        <View style={styles.warning}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.warningText}>
            Илгээсний дараа мэдээллээ өөрөө засах боломжгүй болно. Шалгагч
            нэмэлт мэдээлэл хүсвэл дахин нээгдэнэ.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.action}>
          <AuthButton label="Бүртгэлээ илгээх" onPress={onSubmit} busy={busy} />
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
    subtitle: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 8 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 12, marginTop: 12 },
    term: { flexDirection: "row", gap: 10 },
    termNumber: {
      width: 20,
      height: 20,
      borderRadius: 10,
      textAlign: "center",
      lineHeight: 20,
      fontSize: 11,
      fontWeight: "700",
      color: colors.primaryDark,
      backgroundColor: colors.primaryContainer,
    },
    termText: { flex: 1, fontSize: 12, color: colors.body, lineHeight: 18 },
    agreeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    agreeText: { flex: 1, fontSize: 13, color: colors.ink },
    warning: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      backgroundColor: colors.surfaceTint2,
      borderRadius: 14,
      padding: 14,
      marginTop: 16,
    },
    warningText: { flex: 1, fontSize: 11, color: colors.body, lineHeight: 17 },
    error: { marginTop: 14, fontSize: 12, color: colors.danger },
    action: { marginTop: 24, gap: 4 },
    back: { alignItems: "center", paddingVertical: 12 },
    backText: { fontSize: 13, fontWeight: "600", color: colors.body },
  })
}
