import { Ionicons } from "@expo/vector-icons"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useMemo, useState, type ReactNode } from "react"
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
 * Өргөн нь тойргоос арай том байх ёстой — эс тэгвэл тойрог ховилын
 * хананд наалдаж, хооронд нь хуудасны өнгө харагдахгүй болно. Гэхдээ
 * хэт өргөн байж ч болохгүй: харилцагчийн цэс 5 табтай тул нэг таб-д
 * ноогдох өргөн ~69px, ховил түүнээс хэтэрвэл хөрш табуудыг иднэ.
 */
const NOTCH_HALF_WIDTH = 33
const NOTCH_DEPTH = 26

/**
 * Тойрог хэр өндөрт сууна.
 *
 * 0 бол төв нь биений дээд ирмэг дээр. Сөрөг утга нь дээш өргөнө —
 * ховилын гүнтэй хамт тойргийг бүрэн тойрсон зай үлдээнэ.
 */
const LIFT_OFFSET = -6

/**
 * Аппын доод цэс — хөвөгч бараан бие, идэвхтэй таб нь дээш өргөгдсөн
 * тойрог дотор сууна.
 *
 * Урьд нь `NativeTabs` (платформын өөрийн цэс) ашиглаж байсан бөгөөд тэр
 * нь дүрсний өнгө, өндөр, хэлбэрийг л тохируулах боломж өгдөг — ховил
 * сийлэх, таб өргөх зэрэг нь боломжгүй. Тиймээс энэ цэсийг бүхэлд нь JS
 * талд зурав.
 *
 * ⚠️ Үүний хариуд платформын өөрийн зан төлөг (iOS 26-гийн цэс жижигрэх,
 * гүйлгэлтийн ирмэг дэх тунгалаг байдал) алдагдана. Тэдгээрийг гараар
 * дуурайх шаардлагагүй гэж үзсэн — цэс нь хөвдөг тул агуулгын ард
 * ордоггүй.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()

  // Ховилын байрлалыг тооцоход биений бодит өргөн хэрэгтэй.
  const [width, setWidth] = useState(0)

  const count = state.routes.length
  const itemWidth = width / count
  const activeCenter = itemWidth * (state.index + 0.5)

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View
        style={styles.bar}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <Svg
            width={width}
            height={BAR_HEIGHT}
            // Ховил нь биений дээд ирмэгээс сийлэгддэг тул зураг нь
            // View-гийн хил дотор багтана.
            style={StyleSheet.absoluteFill}
          >
            <Path d={barPath(width, activeCenter)} fill={colors.tabBar} />
          </Svg>
        )}

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]
            const focused = state.index === index
            const icon = (options.tabBarIcon ?? null) as unknown

            function onPress() {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.title ?? route.name}
                style={styles.item}
              >
                {focused ? (
                  <View style={styles.lift}>
                    <TabIcon icon={icon} color={colors.onPrimary} size={24} />
                  </View>
                ) : (
                  <TabIcon icon={icon} color={colors.tabBarMuted} size={22} />
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

/**
 * `tabBarIcon` нь дүрсийг өөрөө буцаадаг функц. Энд зөвхөн өнгө, хэмжээг
 * дамжуулна — аль дүрс болохыг дэлгэц бүр өөрөө шийднэ.
 */
function TabIcon({ icon, color, size }: { icon: unknown; color: string; size: number }) {
  if (typeof icon !== "function") {
    return <Ionicons name="ellipse-outline" size={size} color={color} />
  }
  const render = icon as (props: { color: string; size: number; focused: boolean }) => ReactNode
  return <>{render({ color, size, focused: false })}</>
}

/**
 * Биений хэлбэр: булан нь бөөрөнхий тэгш өнцөгт, идэвхтэй таб-ын дээр
 * доош сийлэгдсэн ховилтой.
 *
 * Ховилыг хоёр bezier муруйгаар татна — нэг нь дээд ирмэгээс доош,
 * нөгөө нь буцаж дээш. Хяналтын цэгүүд нь ирмэг дээр огцом өнцөг
 * үүсэхээс сэргийлж, тойргийг зөөлөн тэвэрч буй мэт харагдуулна.
 */
function barPath(width: number, center: number): string {
  const h = BAR_HEIGHT
  const r = BAR_RADIUS
  const nw = NOTCH_HALF_WIDTH
  const nd = NOTCH_DEPTH

  // Ховилын ГҮНИЙ цэг нь тойргийн яг доор байх ёстой тул төвийг нь
  // шилжүүлж болохгүй. Оронд нь ховилын хоёр үзүүрийг булангийн нумын
  // дотор оруулахгүйгээр хязгаарлана: захын табууд дээр ховил нэг талдаа
  // арай эгц болох ч тойргоосоо салахгүй.
  //
  // (Эхлээд төвийг нь `r + nw` хүртэл шахаж байсан нь алдаа байв: 5 табтай
  // үед эхний таб-ын төв 34px дээр байдаг ба шахалт нь ховилыг 57px дээр
  // зурж, тойрог ховилгүй хоосон дээр хөвж үлддэг.)
  const cx = Math.min(Math.max(center, r), width - r)
  const startX = Math.max(cx - nw, r)
  const endX = Math.min(cx + nw, width - r)

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
