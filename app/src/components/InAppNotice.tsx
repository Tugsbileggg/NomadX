import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import { useAuth } from "@/lib/auth-context"
import {
  NOTIFICATION_ICON,
  onNotification,
  subscribeToNotifications,
  type AppNotification,
} from "@/lib/notifications"
import { useAppTheme } from "@/lib/theme-context"

/** Хэр удаан харагдах. Уншаад ойлгоход хангалттай, замд саад болохооргүй. */
const VISIBLE_MS = 5000

/**
 * react-native-web нь native driver-ийг дэмждэггүй — тэнд шаардвал
 * анимаци эхлээд дундаа тээглэж, самбар дэлгэцийн гадна үлдэнэ.
 */
const NATIVE_DRIVER = Platform.OS !== "web"

/**
 * Нуугдсан үеийн шилжилт.
 *
 * Зориуд бага: самбар нь харагдах эсэх нь анимаци төгсөхөөс хамаарах
 * ёсгүй. Хэрэв анимаци ямар нэг шалтгаанаар дуусахгүй бол (хөдөлгөөн
 * багасгах тохиргоо, driver-ийн зөрүү) энэ утга бага байснаар самбар
 * байрандаа хэвээр харагдана — том утга байсан бол дэлгэцээс гарна.
 */
const HIDDEN_OFFSET = -16

/**
 * Апп нээлттэй байхад дэлгэцийн дээд талд гарч ирэх мэдэгдэл.
 *
 * Утас руу түлхэх push (0021) нь iOS дээр Apple-ийн төлбөртэй бүртгэл
 * шаарддаг тул түүнээс үл хамааран ажилладаг суваг хэрэгтэй байв: артист
 * аппаа онгойлгосон байхад шинэ захиалга ирвэл дэлгэц дээр нь шууд
 * харагдана.
 *
 * Мэдэгдлийг DB өөрөө үүсгэдэг (0020) тул энэ нь ямар үйл явдал болсныг
 * мэдэх шаардлагагүй — зүгээр л `notifications`-д орсон мөрөө сонсоно.
 * Ингэснээр push-той яг ижил агуулга, ижил төрлүүд дамжина.
 *
 * Realtime суваг нь ЗӨВХӨН энд нээгддэг; хонхны тоолуур зэрэг бусад
 * сонсогчид `onNotification()`-оор дамжин үүнийг хуваалцана.
 */
export function InAppNotice() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { session } = useAuth()

  const [notice, setNotice] = useState<AppNotification | null>(null)
  // `useRef(...).current`-ийг render дотор уншиж болохгүй (react-hooks/refs).
  // Тогтмол утга үүсгэхэд зориулагдсан хэлбэр нь `useState`-ийн залхуу
  // эхлүүлэгч — нэг л удаа дуудагдана.
  const [slide] = useState(() => new Animated.Value(0))
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Нэвтэрсэн үед л сонсоно. Хэрэглэгч солигдвол суваг дахин нээгдэнэ.
  useEffect(() => {
    const uid = session?.user.id
    if (!uid) return
    return subscribeToNotifications(uid)
  }, [session])

  useEffect(() => onNotification(setNotice), [])

  useEffect(() => {
    if (!notice) return

    if (hideTimer.current) clearTimeout(hideTimer.current)
    Animated.spring(slide, { toValue: 1, useNativeDriver: NATIVE_DRIVER, friction: 9 }).start()

    hideTimer.current = setTimeout(() => {
      Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: NATIVE_DRIVER }).start(
        () => setNotice(null),
      )
    }, VISIBLE_MS)

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
    // `slide` нь ref-ээс ирдэг тул хэзээ ч солигдохгүй.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice])

  if (!notice) return null

  function open() {
    setNotice(null)
    router.push("/notifications")
  }

  return (
    <Animated.View
      // Дэлгэцийн бусад бүх зүйлийн дээгүүр, гэхдээ хажуу тал нь дарагдахгүй.
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { top: insets.top + 8 },
        {
          opacity: slide,
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [HIDDEN_OFFSET, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable onPress={open} style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons
            name={NOTIFICATION_ICON[notice.kind] as never}
            size={17}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {notice.title}
          </Text>
          {notice.body && (
            <Text style={styles.body} numberOfLines={2}>
              {notice.body}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </Pressable>
    </Animated.View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    wrap: { position: "absolute", left: 12, right: 12, zIndex: 1000 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 18,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 14,
      // Ард нь ямар ч дэлгэц байсан ялгарч харагдана.
      shadowColor: colors.ink,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceTint,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 14, fontWeight: "700", color: colors.ink },
    body: { fontSize: 12, color: colors.body, marginTop: 1 },
  })
}
