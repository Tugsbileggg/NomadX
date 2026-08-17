import { useRef, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"

import { Brand } from "@/constants/theme"

const LENGTH = 4

type Props = {
  value: string
  onChange: (code: string) => void
}

/** 4 тусдаа нүд бүхий OTP оруулах хэсэг — бичих бүрд фокус дараагийнхаа руу шилжинэ. */
export function OtpBoxes({ value, onChange }: Props) {
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

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  box: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Brand.outline,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: Brand.ink,
  },
  boxFocused: { borderColor: Brand.primary },
})
