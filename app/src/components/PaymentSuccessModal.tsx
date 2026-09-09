import { Ionicons } from "@expo/vector-icons"
import { useEffect, useMemo, useState } from "react"
import { Animated, Modal, Platform, Pressable, StyleSheet, Text } from "react-native"

import type { BrandPalette } from "@/constants/theme"
import { onNotification } from "@/lib/notifications"
import { onPaymentNotice, type PaymentNotice } from "@/lib/payment-notice"
import { useAppTheme } from "@/lib/theme-context"

/** `InAppNotice`-той ижил шалтгаан: web дээр native driver ажиллахгүй. */
const NATIVE_DRIVER = Platform.OS !== "web"

/**
 * "Төлбөр амжилттай төлөгдлөө" цонх — үйлчлүүлэгч болон артист хоёуланд.
 *
 * Яагаад самбар (`InAppNotice`) биш цонх вэ: төлбөр бол урсгалын ТӨГСГӨЛ.
 * Хоёр тал хоёулаа "болсон уу?" гэдгийг эргэлзээгүй мэдэх ёстой тул
 * 5 секундын дараа өөрөө алга болдог самбар хангалтгүй — хэрэглэгч
 * өөрөө хаах хүртэл дэлгэц дээр үлдэнэ.
 *
 * Хоёр эх сурвалжийг сонсоно (`payment-notice.ts`-ийн тайлбарыг үзнэ үү):
 * төлсөн хүнд шууд, нөгөө талд нь DB-ийн `invoice_paid` мэдэгдлээр.
 *
 * ⚠️ Мөнгө ШИЛЖИХГҮЙ. Төлбөрийн систем хойшлогдсон тул энэ цонх нь
 * зөвхөн `invoices.status` нь `paid` болсныг дуурайлган харуулна (0023).
 * Тиймээс доор "туршилтын" гэдгийг ил бичив — хэрэглэгч бодит гүйлгээ
 * болсон гэж эндүүрч болохгүй.
 */
export function PaymentSuccessModal() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const [notice, setNotice] = useState<PaymentNotice | null>(null)
  // Render дотор `useRef(...).current` унших нь хориотой (react-hooks/refs) —
  // тогтмолыг useState-ийн залхуу эхлүүлэгчээр үүсгэнэ.
  const [pop] = useState(() => new Animated.Value(0))

  useEffect(() => onPaymentNotice(setNotice), [])

  useEffect(
    () =>
      onNotification((n) => {
        if (n.kind !== "invoice_paid") return
        setNotice({ detail: n.body })
      }),
    [],
  )

  useEffect(() => {
    if (!notice) return
    pop.setValue(0)
    Animated.spring(pop, { toValue: 1, useNativeDriver: NATIVE_DRIVER, friction: 6 }).start()
    // `pop` нь эхлүүлэгчээс ирдэг тул хэзээ ч солигдохгүй.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice])

  function close() {
    setNotice(null)
  }

  return (
    <Modal visible={notice != null} transparent animationType="fade" onRequestClose={close}>
      {/* Гадна талд дарахад хаагдана — цонх нь мэдээлэл өгөхөөс өөр
          үүрэггүй тул хаах замыг хязгаарлах шаардлагагүй. */}
      <Pressable style={styles.backdrop} onPress={close}>
        {/* Картыг дарахад дэвсгэрийн onPress хүрэхээс сэргийлнэ. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Animated.View style={[styles.badge, { transform: [{ scale: pop }] }]}>
            <Ionicons name="checkmark" size={34} color={colors.onPrimary} />
          </Animated.View>

          <Text style={styles.title}>Төлбөр амжилттай төлөгдлөө</Text>
          {notice?.detail ? <Text style={styles.detail}>{notice.detail}</Text> : null}

          <Text style={styles.testNote}>Туршилтын горим — бодит гүйлгээ хийгдээгүй.</Text>

          <Pressable onPress={close} style={styles.button}>
            <Text style={styles.buttonText}>Болсон</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    card: {
      width: "100%",
      maxWidth: 340,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 20,
      gap: 10,
    },
    badge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.success,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.ink, textAlign: "center" },
    detail: { fontSize: 13, color: colors.body, textAlign: "center" },
    testNote: {
      alignSelf: "stretch",
      marginTop: 2,
      borderRadius: 10,
      backgroundColor: colors.surfaceTint,
      paddingVertical: 7,
      paddingHorizontal: 10,
      fontSize: 11,
      lineHeight: 15,
      color: colors.muted,
      textAlign: "center",
    },
    button: {
      marginTop: 8,
      alignSelf: "stretch",
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: { fontSize: 14, fontWeight: "700", color: colors.onPrimary },
  })
}
