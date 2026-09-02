import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { fetchUnreadCount, onNotification } from "@/lib/notifications"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Мэдэгдлийн хонх — уншаагүй тоотой, дарахад мэдэгдлийн төв рүү орно.
 *
 * Мэдэгдлийг DB-ийн триггерүүд аль хэдийн үүсгэдэг (0020) бөгөөд шинэ
 * захиалга ирэхэд бизнесийн эзэнд буюу ганцаараа ажилладаг артистад
 * очдог. Гэвч артистын панел дээр хонх байхгүй байсан тул тэдгээр
 * мэдэгдэл Профайл доторх цэсээр орж байж л харагддаг байв.
 */
export function NotificationBell({ size = 20 }: { size?: number }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  // Мэдэгдлийн дэлгэцээс буцаж ирэхэд тоолуур шинэчлэгдэнэ.
  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchUnreadCount().then((n) => {
        if (active) setUnread(n)
      })
      return () => {
        active = false
      }
    }, []),
  )

  // Апп нээлттэй байхад шинэ мэдэгдэл ирвэл дэлгэцээ дахин нээх хүртэл
  // хүлээлгүй тоолуур шууд өснө — самбар гарч ирээд хонх хөдөлгөөнгүй
  // байвал хоёр нь зөрчилдөнө.
  useEffect(() => onNotification(() => setUnread((n) => n + 1)), [])

  return (
    <Pressable hitSlop={8} onPress={() => router.push("/notifications")}>
      <Ionicons name="notifications-outline" size={size} color={colors.body} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </Pressable>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    badge: {
      position: "absolute",
      top: -4,
      right: -6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 4,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { fontSize: 9, fontWeight: "700", color: colors.onPrimary },
  })
}
