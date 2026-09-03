import { Ionicons } from "@expo/vector-icons"
import { TabsStateContext, type TabTriggerSlotProps } from "expo-router/ui"
import { forwardRef, useContext, useMemo, useState, type ReactNode } from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path } from "react-native-svg"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

/** Цэсний биеийн өндөр — өргөгдсөн тойргийг оруулаагүй. */
const BAR_HEIGHT = 64

/** Биеийн булангийн радиус. */
const BAR_RADIUS = 24

/** Дэлгэцийн хажуу талаас хөвөх зай. */
const SIDE_MARGIN = 14

/** Идэвхтэй таб-ын өргөгдсөн тойргийн диаметр. */
const LIFT_SIZE = 50

/**
 * Тойргийн доор сийлэгдэх ховилын хэмжээ.
 *
 * Тойргоос арай том байх ёстой — эс тэгвэл тойрог ховилын хананд наалдаж,
 * хооронд нь хуудасны өнгө харагдахгүй. Гэхдээ хэт өргөн байж ч болохгүй:
 * харилцагчийн цэс 5 табтай тул нэг табд ноогдох өргөн ~69px.
 */
const NOTCH_HALF_WIDTH = 33
const NOTCH_DEPTH = 26

/** Тойргийн төв биений дээд ирмэгээс хэр дээш байх. */
const LIFT_OFFSET = -6

/**
 * Аппын доод цэс — хөвөгч бараан бие, идэвхтэй таб нь дээш өргөгдсөн
 * тойрог дотор сууна.
 *
 * `<TabList asChild>`-ийн хүүхэд болж ажиллана: expo-router нь табуудынхаа
 * төлөвийг `TabsStateContext`-ээр дамжуулдаг тул идэвхтэй индексийг эндээс
 * шууд уншиж ховилоо байрлуулна.
 *
 * ⚠️ Яагаад `Tabs`-ийн `tabBar` prop-ыг ашиглаагүй вэ: SDK 57-д тэр prop
 * үйлчлэхээ больсон (энгийн хайрцаг буцаадаг tabBar-аар туршиж баталсан).
 * Өөрийн цэс зурах албан ёсны зам нь `expo-router/ui`-ийн headless tabs.
 */
export const FloatingTabBar = forwardRef<View, { children?: ReactNode }>(
  function FloatingTabBar({ children }, ref) {
    const { colors } = useAppTheme()
    const styles = useMemo(() => makeStyles(colors), [colors])
    const insets = useSafeAreaInsets()
    const state = useContext(TabsStateContext)

    // Ховилын байрлалыг тооцоход биений бодит өргөн хэрэгтэй.
    const [width, setWidth] = useState(0)

    const count = state.routes.length
    const activeCenter = count > 0 ? (width / count) * (state.index + 0.5) : 0

    return (
      <View
        ref={ref}
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <Svg width={width} height={BAR_HEIGHT} style={StyleSheet.absoluteFill}>
              <Path d={barPath(width, activeCenter)} fill={colors.tabBar} />
            </Svg>
          )}

          <View style={styles.row}>{children}</View>
        </View>
      </View>
    )
  },
)

/**
 * Нэг таб. `<TabTrigger asChild>` нь дарах үйлдэл болон `isFocused`-ийг
 * энэ рүү дамжуулна — өөрөө навигаци хийхгүй.
 */
export const TabButton = forwardRef<
  View,
  TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap }
>(function TabButton({ icon, isFocused, ...pressable }, ref) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <Pressable
      ref={ref}
      {...pressable}
      accessibilityState={{ selected: isFocused }}
      style={styles.item}
    >
      {isFocused ? (
        <View style={styles.lift}>
          <Ionicons name={icon} size={24} color={colors.onPrimary} />
        </View>
      ) : (
        <Ionicons name={icon} size={22} color={colors.tabBarMuted} />
      )}
    </Pressable>
  )
})

/**
 * Биений хэлбэр: булан нь бөөрөнхий тэгш өнцөгт, идэвхтэй таб-ын дээр
 * доош сийлэгдсэн ховилтой.
 *
 * Ховилын ГҮНИЙ цэг тойргийн яг доор байх ёстой тул төвийг нь шилжүүлэхгүй
 * — зөвхөн хоёр үзүүрийг булангийн нумын дотор оруулахгүйгээр хязгаарлана.
 * Захын табууд дээр ховил нэг талдаа арай эгц болох ч тойргоосоо салахгүй.
 */
function barPath(width: number, center: number): string {
  const h = BAR_HEIGHT
  const r = BAR_RADIUS
  const cx = Math.min(Math.max(center, r), width - r)
  const startX = Math.max(cx - NOTCH_HALF_WIDTH, r)
  const endX = Math.min(cx + NOTCH_HALF_WIDTH, width - r)
  const nd = NOTCH_DEPTH

  return [
    `M ${r} 0`,
    `L ${startX} 0`,
    `C ${cx - (cx - startX) * 0.45} 0 ${cx - (cx - startX) * 0.62} ${nd} ${cx} ${nd}`,
    `C ${cx + (endX - cx) * 0.62} ${nd} ${cx + (endX - cx) * 0.45} 0 ${endX} 0`,
    `L ${width - r} 0`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `L ${width} ${h - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${h}`,
    `L ${r} ${h}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ")
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: SIDE_MARGIN,
    },
    bar: {
      height: BAR_HEIGHT,
      // Өргөгдсөн тойрог биенээс дээш гардаг тул хайрцгаа тайрахгүй.
      overflow: "visible",
    },
    row: { flexDirection: "row", height: BAR_HEIGHT },
    item: { flex: 1, alignItems: "center", justifyContent: "center" },
    lift: {
      position: "absolute",
      top: LIFT_OFFSET - LIFT_SIZE / 2,
      width: LIFT_SIZE,
      height: LIFT_SIZE,
      borderRadius: LIFT_SIZE / 2,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 6 },
        default: {},
      }),
    },
  })
}
