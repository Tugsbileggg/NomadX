import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"

const STEPS = ["Мэдээлэл", "Баримт", "Гэрээ"]

/** Бүртгэлийн явцын заагч — хэд дэх алхам дээр байгааг харуулна. */
export function RegisterSteps({ current }: { current: 1 | 2 | 3 }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <View style={styles.row}>
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, (done || active) && styles.dotOn]}>
              <Text style={[styles.dotText, (done || active) && styles.dotTextOn]}>{step}</Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            {i < STEPS.length - 1 && <View style={[styles.line, done && styles.lineOn]} />}
          </View>
        )
      })}
    </View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 6 },
    item: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.surfaceTint2,
      alignItems: "center",
      justifyContent: "center",
    },
    dotOn: { backgroundColor: colors.primary },
    dotText: { fontSize: 11, fontWeight: "700", color: colors.muted },
    dotTextOn: { color: colors.onPrimary },
    label: { fontSize: 11, fontWeight: "600", color: colors.muted },
    labelActive: { color: colors.ink },
    line: { width: 16, height: 1, backgroundColor: colors.outlineSoft, marginHorizontal: 2 },
    lineOn: { backgroundColor: colors.primary },
  })
}
