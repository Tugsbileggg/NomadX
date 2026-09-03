import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from "expo-router/ui";
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaxContentWidth, Spacing, type BrandPalette } from "@/constants/theme";
import { useAppTheme } from "@/lib/theme-context";

/** Хөвөгч tab bar-ын хэмжээсүүд — идэвхтэй tab нь дугуй "бөмбөлөг" болж дээшээ гарна. */
const BAR_HEIGHT = 54;
const BUBBLE_SIZE = 47;
const NOTCH_SIZE = 66;
/** Bar нь ямар ч theme дээр үргэлж цагаан pill хэвээр байна (загварын дагуу). */
const BAR_COLOR = "#ffffff";

const ITEMS: {
  name: string;
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    name: "home",
    href: "/",
    label: "Нүүр",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "search",
    href: "/search",
    label: "Хайх",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "ai-advisor",
    href: "/ai-advisor",
    label: "AI Зөвлөгөө",
    icon: "sparkles-outline",
    activeIcon: "sparkles",
  },
  {
    name: "bookings",
    href: "/bookings",
    label: "Захиалга",
    icon: "calendar-outline",
    activeIcon: "calendar",
  },
  {
    name: "profile",
    href: "/profile",
    label: "Профайл",
    icon: "person-outline",
    activeIcon: "person",
  },
];

/**
 * TabTrigger нь `isFocused`-ийг найдвартай, шууд tab navigator-ын state-ээс
 * гаргаж өгдөг (`TabButton` доторх prop) — тэгэхээр идэвхтэй индексийг доороос
 * дээш нь энэ context-оор дамжуулж авна.
 */
const ActiveIndexContext = createContext<(index: number) => void>(() => {});

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          {ITEMS.map((item, index) => (
            <TabTrigger
              key={item.name}
              name={item.name}
              href={item.href}
              asChild
            >
              <TabButton
                index={index}
                icon={item.icon}
                activeIcon={item.activeIcon}
                label={item.label}
              />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  index,
  icon,
  activeIcon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  index: number;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { colors } = useAppTheme();
  const setActiveIndex = useContext(ActiveIndexContext);

  useEffect(() => {
    if (isFocused) setActiveIndex(index);
  }, [isFocused, index, setActiveIndex]);

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={({ pressed }) => [
        staticStyles.tabButtonView,
        pressed && staticStyles.pressed,
      ]}
    >
      {/* Идэвхтэй tab-ын дүрс дэвсгэрээс дээш гарсан "бөмбөлөг" дотор харагдана. */}
      {!isFocused && <Ionicons name={icon} size={19} color={colors.muted} />}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = ITEMS[activeIndex] ?? ITEMS[0];
  const itemCount = Children.count(props.children);

  const [barWidth, setBarWidth] = useState(0);
  const centerX = useSharedValue(0);

  useEffect(() => {
    if (barWidth <= 0) return;
    const itemWidth = barWidth / itemCount;
    const target = itemWidth * activeIndex + itemWidth / 2;
    // Savчилгүй, гөлгөр гулсалт — bounce/overshoot-гүй тул эргэн тойрноо хэлбэлздэггүй.
    centerX.value = withTiming(target, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, barWidth, itemCount, centerX]);

  const notchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - NOTCH_SIZE / 2 }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - BUBBLE_SIZE / 2 }],
  }));

  return (
    <View
      {...props}
      style={[
        staticStyles.tabListContainer,
        { paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}
    >
      <View style={staticStyles.innerContainer}>
        <View
          style={styles.pill}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        >
          <ActiveIndexContext.Provider value={setActiveIndex}>
            {props.children}
          </ActiveIndexContext.Provider>
        </View>
        {barWidth > 0 && (
          <>
            <Animated.View style={[styles.notch, notchStyle]} />
            <Animated.View style={[styles.bubble, bubbleStyle]}>
              <Ionicons
                name={activeItem.activeIcon}
                size={21}
                color="#ffffff"
              />
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
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
});

// Theme-ийн өнгөнөөс хамаарах хэсгүүд.
function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    pill: {
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: BAR_COLOR,
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
  });
}
