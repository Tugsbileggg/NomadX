import { Ionicons } from "@expo/vector-icons"
import {
  TabListProps,
  TabTriggerSlotProps,
} from "expo-router/ui"
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { MaxContentWidth, Spacing, type BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Хөвөгч доод цэс — харилцагч, артист хоёр талын tab bar ХОЁУЛАА үүнийг
 * хуваалцана (`app-tabs.tsx`, `(artist)/(panel)/_layout.tsx`). Идэвхтэй
 * tab нь дугуй "бөмбөлөг" болж цэснээс дээш гарна.
 */
const BAR_HEIGHT = 54
const BUBBLE_SIZE = 47
const NOTCH_SIZE = 66

export type TabBarItem = {
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
  label: string
}

/**
 * TabTrigger нь `isFocused`-ийг найдвартай, шууд tab navigator-ын state-ээс
 * гаргаж өгдөг (`TabButton` доторх prop) — тэгэхээр идэвхтэй индексийг доороос
 * дээш нь энэ context-оор дамжуулж авна.
 */
const ActiveIndexContext = createContext<(index: number) => void>(() => {})

export function TabButton({
  index,
  icon,
  activeIcon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  index: number
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
  label: string
}) {
  const { colors } = useAppTheme()
  const setActiveIndex = useContext(ActiveIndexContext)

  useEffect(() => {
    if (isFocused) setActiveIndex(index)
  }, [isFocused, index, setActiveIndex])

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={({ pressed }) => [staticStyles.tabButtonView, pressed && staticStyles.pressed]}
    >
      {/* Идэвхтэй tab-ын дүрс дэвсгэрээс дээш гарсан "бөмбөлөг" дотор харагдана. */}
      {!isFocused && <Ionicons name={icon} size={19} color={colors.muted} />}
    </Pressable>
  )
}

export function FloatingTabBar(props: TabListProps & { items: TabBarItem[] }) {
  const { items, ...tabListProps } = props
  const { colors } = useAppTheme()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = items[activeIndex] ?? items[0]
  const itemCount = Children.count(tabListProps.children)

  const [barWidth, setBarWidth] = useState(0)
  const centerX = useSharedValue(0)

  useEffect(() => {
    if (barWidth <= 0) return
    const itemWidth = barWidth / itemCount
    const target = itemWidth * activeIndex + itemWidth / 2
    // Савчилгүй, гөлгөр гулсалт — bounce/overshoot-гүй тул эргэн тойрноо хэлбэлздэггүй.
    centerX.value = withTiming(target, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    })
  }, [activeIndex, barWidth, itemCount, centerX])

  const notchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - NOTCH_SIZE / 2 }],
  }))
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - BUBBLE_SIZE / 2 }],
  }))

  return (
    <View
      {...tabListProps}
      style={[staticStyles.tabListContainer, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}
    >
      <View style={staticStyles.innerContainer}>
        <View style={styles.pill} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          <ActiveIndexContext.Provider value={setActiveIndex}>
            {tabListProps.children}
          </ActiveIndexContext.Provider>
        </View>
        {barWidth > 0 && activeItem && (
          <>
            <Animated.View style={[styles.notch, notchStyle]} />
            <Animated.View style={[styles.bubble, bubbleStyle]}>
              <Ionicons name={activeItem.activeIcon} size={21} color="#ffffff" />
            </Animated.View>
          </>
        )}
      </View>
    </View>
  )
}

// Theme-ээс хамаардаггүй, зөвхөн байрлал/хэмжээтэй холбоотой хэсгүүд.
const staticStyles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: Spacing.three,
    alignItems: "center",
  },
  innerContainer: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  tabButtonView: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
})

// Theme-ийн өнгөнөөс хамаарах хэсгүүд.
function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    pill: {
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineSoft,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
    // Дэвсгэр (surfacePage) өнгөтэйгээ таарч, pill-ийн ирмэгээс "хазагдсан" мэт харагдана.
    notch: {
      position: "absolute",
      top: -(NOTCH_SIZE / 2 - 4),
      left: 0,
      width: NOTCH_SIZE,
      height: NOTCH_SIZE,
      borderRadius: NOTCH_SIZE / 2,
      backgroundColor: colors.surfacePage,
    },
    bubble: {
      position: "absolute",
      top: -(NOTCH_SIZE / 2 - 4) + (NOTCH_SIZE - BUBBLE_SIZE) / 2,
      left: 0,
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 12,
    },
  })
}
