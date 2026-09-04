import { Ionicons } from "@expo/vector-icons"
import { TabsStateContext, type TabTriggerSlotProps } from "expo-router/ui"
import { forwardRef, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, {
  SnappySpringConfig,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

/** Цэсний өндөр. Булангийн радиус нь үүний яг хагас — бүтэн капсул. */
const BAR_HEIGHT = 62

/** Дэлгэцийн хажуу талаас хөвөх зай. */
const SIDE_MARGIN = 16

/** Идэвхтэй табын доор гүйх дугуй тэмдэглэгээний хэмжээ. */
const INDICATOR_SIZE = 44

/**
 * Тэмдэглэгээний гулсалт — Reanimated-ийн өөрийнх нь тохируулсан хувилбар
 * (ζ≈0.92, `overshootClamping`), ойролцоогоор 300мс-д тогтоно.
 *
 * ⚠️ Гараар тоо бичихээс болгоомжил: Reanimated 4-ийн пүршний масштаб 3-аас
 * тэс өөр (анхдагч нь mass 4 / damping 120 / stiffness 900, өмнө нь
 * 1 / 10 / 100). RN3-ын зуршлаар бичсэн тоо энд савлаж унана.
 */
const SLIDE = SnappySpringConfig

/** Дүрсний өнгө солигдох хугацаа. Гулсалттай ойролцоо байх ёстой. */
const FADE = { duration: 180 }

/**
 * Аппын доод цэс — хөвөгч бараан капсул, идэвхтэй таб нь доогуураа
 * гулсдаг дугуй тэмдэглэгээгээр тэмдэглэгдэнэ.
 *
 * `<TabList asChild>`-ийн хүүхэд болж ажиллана: expo-router нь табуудынхаа
 * төлөвийг `TabsStateContext`-ээр дамжуулдаг тул идэвхтэй индексийг эндээс
 * шууд уншиж тэмдэглэгээгээ байрлуулна.
 *
 * ⚠️ Яагаад `Tabs`-ийн `tabBar` prop-ыг ашиглаагүй вэ: SDK 57-д тэр prop
 * үйлчлэхээ больсон. Өөрийн цэс зурах албан ёсны зам нь `expo-router/ui`-ийн
 * headless tabs.
 *
 * Тэмдэглэгээ нь биенээс ГАДАГШ цухуйхгүй — өмнө нь өргөгдсөн тойрог
 * ховилтойгоо таарахгүй завсар үлдээж, дундуур нь хуудасны дэвсгэр
 * харагддаг байв. Одоо капсул дотроо бүрэн багтах тул тийм завсар
 * үүсэх боломжгүй.
 */
export const FloatingTabBar = forwardRef<View, { children?: ReactNode }>(
  function FloatingTabBar({ children }, ref) {
    const { colors } = useAppTheme()
    const styles = useMemo(() => makeStyles(colors), [colors])
    const insets = useSafeAreaInsets()
    const state = useContext(TabsStateContext)

    // Тэмдэглэгээг байрлуулахад биений бодит өргөн хэрэгтэй.
    const [width, setWidth] = useState(0)

    const count = state.routes.length
    const slot = count > 0 ? width / count : 0

    // Пикселээр биш ИНДЕКСЭЭР хөдөлгөнө: дэлгэц эргэх зэргээр өргөн
    // өөрчлөгдөхөд тэмдэглэгээ хажуу тийш харайлгүй шинэ байрандаа шууд
    // тохирно.
    //
    // React-ийн prop-оос анимаци хөтлөх тодорхой хэлбэр нь shared value +
    // effect. `useDerivedValue` ч ажиллах боловч түүний хамаарлыг Babel
    // plugin таамаглаж илрүүлдэг тул энд илүү шууд хэлбэрийг сонгов.
    const progress = useSharedValue(state.index)

    useEffect(() => {
      progress.value = withSpring(state.index, SLIDE)
    }, [state.index, progress])

    const indicator = useAnimatedStyle(
      () => ({
        // Хэмжилт хийгдэх хүртэл нуугдана — эс тэгвэл зүүн ирмэг дээр
        // нэг агшин анивчина.
        opacity: slot > 0 ? 1 : 0,
        transform: [{ translateX: progress.value * slot + (slot - INDICATOR_SIZE) / 2 }],
      }),
      [slot],
    )

    return (
      <View
        ref={ref}
        // Home indicator-тай утсан дээр бүтэн inset нь цэсийг хэт өндөрт
        // өргөж, доогуураа хоосон зай үлдээдэг тул бага зэрэг татав.
        style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 8, 12) }]}
      >
        <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <Animated.View style={[styles.indicator, indicator]} />

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

  // Дээрхтэй адил хэлбэр: prop-оос хөтлөх тул shared value + effect.
  const active = useSharedValue(isFocused ? 1 : 0)

  useEffect(() => {
    active.value = withTiming(isFocused ? 1 : 0, FADE)
  }, [isFocused, active])

  const lift = useAnimatedStyle(() => ({ transform: [{ scale: 1 + active.value * 0.1 }] }))
  const overlay = useAnimatedStyle(() => ({ opacity: active.value }))

  return (
    <Pressable
      ref={ref}
      {...pressable}
      accessibilityState={{ selected: isFocused }}
      style={styles.item}
    >
      {/*
        Өнгийг шууд солихын оронд хоёр дүрсийг давхарлаж бүдгэрүүлнэ.
        Vector icon нь эцсийн дүндээ Text тул өнгийг нь worklet-ээс
        хөдөлгөх найдваргүй; давхарлах нь хямд бөгөөд гулсалттай яг
        зэрэгцэж өнгө нь ормогцоо цагаан болно.
      */}
      <Animated.View style={[styles.iconStack, lift]}>
        <Ionicons name={icon} size={23} color={colors.tabBarMuted} />

        <Animated.View style={[StyleSheet.absoluteFill, styles.iconStack, overlay]}>
          <Ionicons name={icon} size={23} color={colors.onPrimary} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
})

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: SIDE_MARGIN,
      // Цэсний хажуугийн хоосон зай доорх хуудсыг даралгүй өнгөрөөнө.
      pointerEvents: "box-none",
    },
    bar: {
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: colors.tabBar,
      // Тэмдэглэгээ капсулын нумаас гадагш гарахгүй.
      overflow: "hidden",
      // RN 0.86-д `shadow*` хуучирсан — `boxShadow` нь гурван талдаа нэг
      // адил ажиллана.
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
    },
    row: { flexDirection: "row", height: BAR_HEIGHT },
    item: { flex: 1, alignItems: "center", justifyContent: "center" },
    iconStack: { alignItems: "center", justifyContent: "center" },
    indicator: {
      position: "absolute",
      top: (BAR_HEIGHT - INDICATOR_SIZE) / 2,
      left: 0,
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      borderRadius: INDICATOR_SIZE / 2,
      backgroundColor: colors.primary,
    },
  })
}
