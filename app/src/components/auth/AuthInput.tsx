import { Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

type Props = TextInputProps & {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  isPassword?: boolean
}

/** Гарчигтай текст оруулах талбар — сонголтоор баруун талд нууц үг харах/нуух товчтой. */
export function AuthInput({ label, icon, isPassword, style, ...inputProps }: Props) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [show, setShow] = useState(false)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={styles.icon} /> : null}
        <TextInput
          placeholderTextColor="rgba(133,115,116,0.5)"
          secureTextEntry={isPassword && !show}
          style={[styles.input, icon ? styles.inputWithIcon : null, style]}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShow((s) => !s)}
            hitSlop={8}
            style={styles.toggle}
            accessibilityLabel={show ? "Нууц үг нуух" : "Нууц үг харах"}
          >
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    field: { gap: 8 },
    label: { fontSize: 13, fontWeight: "600", color: colors.body },
    row: { position: "relative", justifyContent: "center" },
    icon: { position: "absolute", left: 16, zIndex: 1 },
    input: {
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.surfaceTint,
      borderWidth: 1,
      borderColor: "transparent",
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.ink,
    },
    inputWithIcon: { paddingLeft: 44 },
    toggle: { position: "absolute", right: 14, padding: 4 },
  })
}
