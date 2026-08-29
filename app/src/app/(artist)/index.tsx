import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useAppTheme } from "@/lib/theme-context"

/** Бүртгэлийн төлөв бүрт харуулах текст. */
const STATUS_COPY: Record<string, { title: string; body: string }> = {
  draft: {
    title: "Бүртгэлээ дуусгана уу",
    body: "Та бүртгэлээ эхлүүлсэн ч дуусгаагүй байна. Одоохондоо вэб хуудсаар үргэлжлүүлж болно.",
  },
  submitted: {
    title: "Хянагдаж байна",
    body: "Таны бүртгэлийг шалгаж байна. Шийдвэр гармагц мэдэгдэнэ.",
  },
  under_review: {
    title: "Хянагдаж байна",
    body: "Таны бүртгэлийг шалгаж байна. Шийдвэр гармагц мэдэгдэнэ.",
  },
  needs_info: {
    title: "Нэмэлт мэдээлэл шаардлагатай",
    body: "Бүртгэлд тань засах зүйл байна. Дэлгэрэнгүйг вэб хуудаснаас харна уу.",
  },
  rejected: {
    title: "Бүртгэл татгалзагдсан",
    body: "Шалтгааныг вэб хуудаснаас харна уу.",
  },
  approved: {
    title: "Бүртгэл баталгаажсан",
    body: "Таны ажлын самбарыг аппад шилжүүлж байна. Одоохондоо вэб хуудсаар ажиллана уу.",
  },
}

/**
 * Артистын түр дэлгэц.
 *
 * ⚠️ 1-р шат: аппад role-оор чиглүүлэх суурийг тавьж байгаа бөгөөд
 * артистын бүртгэл (2-р шат), панел (3-р шат) хараахан бэлэн биш.
 * Тиймээс энд вэб рүү чиглүүлнэ — вэб панелыг 4-р шатанд л хаана.
 */
export default function ArtistHomeScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { account } = useAuth()
  const router = useRouter()

  const status = account?.business?.status
  const copy = status
    ? STATUS_COPY[status]
    : {
        title: "Артистын бүртгэл эхлээгүй байна",
        body: "Бүртгэлээ эхлүүлэхийн тулд одоохондоо вэб хуудсыг ашиглана уу.",
      }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.icon}>
          <Ionicons name="briefcase-outline" size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>{copy.title}</Text>
        {account?.business?.name ? (
          <Text style={styles.business}>{account.business.name}</Text>
        ) : null}
        <Text style={styles.body}>{copy.body}</Text>

        <View style={styles.notice}>
          <Ionicons name="construct-outline" size={16} color={colors.primary} />
          <Text style={styles.noticeText}>
            Артистын ажлын самбарыг апп руу шилжүүлж байна. Дуустал вэб хуудас
            хэвийн ажиллана.
          </Text>
        </View>

        <Pressable style={styles.link} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <Text style={styles.linkText}>Мэдэгдэл</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.signOut}>
          <AuthButton
            label="Гарах"
            variant="outline"
            onPress={() => void supabase.auth.signOut()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    page: { padding: 24, paddingTop: 60, alignItems: "center", gap: 10 },
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
      marginTop: 4,
    },
    linkText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.ink },
    signOut: { alignSelf: "stretch", marginTop: 16 },
  })
}
