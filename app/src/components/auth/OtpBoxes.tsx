import { useMemo, useRef, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

const LENGTH = 8

type Props = {
  value: string
  onChange: (code: string) => void
}

/** 4 тусдаа нүд бүхий OTP оруулах хэсэг — бичих бүрд фокус дараагийнхаа руу шилжинэ. */
export function OtpBoxes({ value, onChange }: Props) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "")
  const refs = useRef<(TextInput | null)[]>([])
  const [focused, setFocused] = useState(-1)

  function setDigit(index: number, char: string) {
    const next = digits.slice()
    next[index] = char
    onChange(next.join(""))
    if (char && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          onChangeText={(text) => setDigit(i, text.slice(-1).replace(/\D/g, ""))}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !digits[i] && i > 0) {
              refs.current[i - 1]?.focus()
            }
          }}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(-1)}
          keyboardType="number-pad"
          maxLength={1}
          style={[styles.box, focused === i && styles.boxFocused]}
        />
      ))}
    </View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
    box: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      color: colors.ink,
    },
    boxFocused: { borderColor: colors.primary },
  })
}
