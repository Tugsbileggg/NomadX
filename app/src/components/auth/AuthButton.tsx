import { ActivityIndicator, Pressable, StyleSheet, Text, type GestureResponderEvent } from "react-native"

import { Brand } from "@/constants/theme"

type Props = {
  label: string
  onPress: (event: GestureResponderEvent) => void
  busy?: boolean
  disabled?: boolean
  variant?: "solid" | "outline"
}

/** Бөмбөлөг хэлбэрийн товч — ачааллаж буй үед spinner харуулна. */
export function AuthButton({ label, onPress, busy, disabled, variant = "solid" }: Props) {
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
        <ActivityIndicator color={isOutline ? Brand.primary : "#fff"} />
      ) : (
        <Text style={[styles.text, isOutline && styles.textOutline]}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 999,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Brand.primary,
  },
  buttonPressed: { opacity: 0.75 },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
  textOutline: { color: Brand.primary },
})
