import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import type { BusinessStatus } from "@/lib/db-types"
import { useAuth, signOut } from "@/lib/auth-context"
import { useAppTheme } from "@/lib/theme-context"

type Panel = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  body: string
  /** Товч байвал — бүртгэлээ үргэлжлүүлэх/засах. */
  action?: string
}

/**
 * Бүртгэлийн төлөв бүрт харуулах агуулга.
 *
 * `needs_info`, `rejected` хоёрт засах боломж нээгддэг — `businesses_update_own`
 * (0003) яг эдгээр төлөвт л засварыг зөвшөөрдөг.
 */
const BY_STATUS: Record<BusinessStatus, Panel> = {
  draft: {
    icon: "create-outline",
    title: "Бүртгэлээ дуусгана уу",
    body: "Та бүртгэлээ эхлүүлсэн ч илгээгээгүй байна.",
    action: "Үргэлжлүүлэх",
  },
  submitted: {
    icon: "hourglass-outline",
    title: "Хянагдаж байна",
    body: "Таны бүртгэлийг шалгаж байна. Шийдвэр гармагц мэдэгдэл ирнэ.",
  },
  under_review: {
    icon: "hourglass-outline",
    title: "Хянагдаж байна",
    body: "Таны бүртгэлийг шалгаж байна. Шийдвэр гармагц мэдэгдэл ирнэ.",
  },
  needs_info: {
    icon: "alert-circle-outline",
    title: "Нэмэлт мэдээлэл шаардлагатай",
    body: "Шалгагч тодруулга хүсжээ. Мэдээллээ засаад дахин илгээнэ үү.",
    action: "Мэдээллээ засах",
  },
  rejected: {
    icon: "close-circle-outline",
    title: "Бүртгэл татгалзагдсан",
    body: "Дараах шалтгаанаар татгалзсан байна.",
    action: "Дахин илгээх",
  },
  approved: {
    icon: "checkmark-circle-outline",
    title: "Бүртгэл баталгаажсан",
    body: "Таны профайл үйлчлүүлэгчдэд харагдаж байна.",
  },
}

/**
 * Артистын нүүр — бүртгэлийн төлвөөс хамаарч чиглүүлнэ.
 *
 * ⚠️ Ажлын самбар (захиалга, календарь, хуваарь) 3-р шатанд нэмэгдэнэ.
 * Түүнийг дуустал баталгаажсан артистыг вэб рүү чиглүүлж байна — вэб
 * панелыг 4-р шатанд л хаана.
 */
export default function ArtistHomeScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const { account } = useAuth()

  const business = account?.business ?? null
  const panel: Panel = business
    ? BY_STATUS[business.status]
    : {
        icon: "rocket-outline",
        title: "Артистаар бүртгүүлэх",
        body: "Гурван богино алхмаар бүртгэлээ илгээгээд шалгуулна уу.",
        action: "Бүртгэл эхлүүлэх",
      }

  /** Хаана зогссоноос нь хамаарч зөв алхам руу буцаана. */
  function resume() {
    const step = business?.currentStep ?? 1
    if (step >= 3) router.push("/(artist)/register/contract")
    else if (step === 2) router.push("/(artist)/register/documents")
    else router.push("/(artist)/register/info")
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.icon}>
          <Ionicons name={panel.icon} size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>{panel.title}</Text>
        {business?.name ? <Text style={styles.business}>{business.name}</Text> : null}
        <Text style={styles.body}>{panel.body}</Text>

        {panel.action && (
          <View style={styles.action}>
            <AuthButton label={panel.action} onPress={resume} />
          </View>
        )}

        {business?.status === "approved" && (
          <View style={styles.notice}>
            <Ionicons name="construct-outline" size={16} color={colors.primary} />
            <Text style={styles.noticeText}>
              Захиалга, календарь, хуваарийн дэлгэцийг апп руу шилжүүлж байна.
              Дуустал вэб хуудсаар ажиллана уу.
            </Text>
          </View>
        )}

        <Pressable style={styles.link} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <Text style={styles.linkText}>Мэдэгдэл</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.signOut}>
          <AuthButton
            label="Гарах"
            variant="outline"
            onPress={() => void signOut()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingTop: 60, alignItems: "center", gap: 8 },
    icon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: 8, textAlign: "center" },
    business: { fontSize: 13, fontWeight: "600", color: colors.primary },
    body: { fontSize: 13, color: colors.body, textAlign: "center", lineHeight: 19 },
    action: { alignSelf: "stretch", marginTop: 16 },
    notice: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginTop: 12,
    },
    noticeText: { flex: 1, fontSize: 12, color: colors.body, lineHeight: 18 },
    link: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      alignSelf: "stretch",
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginTop: 12,
    },
    linkText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.ink },
    signOut: { alignSelf: "stretch", marginTop: 16 },
  })
}
