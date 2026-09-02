import { useMemo } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, type GestureResponderEvent } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

type Props = {
  label: string
  onPress: (event: GestureResponderEvent) => void
  busy?: boolean
  disabled?: boolean
  variant?: "solid" | "outline"
}

/** Бөмбөлөг хэлбэрийн товч — ачааллаж буй үед spinner харуулна. */
export function AuthButton({ label, onPress, busy, disabled, variant = "solid" }: Props) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const isOutline = variant === "outline"

  return (
    <Pressable
      onPress={onPress}
      disabled={busy || disabled}
      style={({ pressed }) => [
        styles.button,
        isOutline && styles.buttonOutline,
        (pressed || busy || disabled) && styles.buttonPressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.text, isOutline && styles.textOutline]}>{label}</Text>
      )}
    </Pressable>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    button: {
      height: 52,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      // Ихэнх дэлгэц дээр товч бүтэн өргөнөөр сунадаг тул энэ зай
      // мэдэгддэггүй. Харин голлуулсан (`alignItems: "center"`) эцэг дотор
      // товч нь текстийнхээ яг өргөнөөр агшдаг — тэр үед 999-ийн радиус
      // хоёр үзүүрээсээ текст рүү орж, бичиг таслагдсан мэт харагдана.
      paddingHorizontal: 28,
    },
    buttonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonPressed: { opacity: 0.75 },
    text: { color: colors.onPrimary, fontSize: 16, fontWeight: "600" },
    textOutline: { color: colors.primary },
  })
}
