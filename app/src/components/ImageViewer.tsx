import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useEffect, useRef } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native"

/**
 * Зургийг бүтэн дэлгэцээр харуулах цонх — хажуу тийш шудран сольж,
 * зураг эсвэл × дээр дарвал хаагдана.
 *
 * `urls` доторх `null` нь байрлалаа хадгална (хоосон хуудас болно) —
 * татагдаагүй зургийг жагсаалтаас хасвал `index` бусад зурагтай зөрж,
 * хэрэглэгч дарсан зургаасаа өөрийг нь харна.
 */
export function ImageViewer({
  urls,
  index,
  onClose,
}: {
  urls: (string | null)[]
  /** null бол цонх хаалттай. */
  index: number | null
  onClose: () => void
}) {
  const { width, height } = useWindowDimensions()
  const scroller = useRef<ScrollView>(null)

  // `contentOffset` нь Android дээр үл хэрэгсэгддэг тул нээгдэх бүрд
  // сонгосон зураг руу нь гараар үсэргэнэ.
  useEffect(() => {
    if (index == null) return
    // Modal-ын агуулга гарч ирсний дараа хэмжээ нь тогтдог тул нэг frame хүлээнэ.
    const id = setTimeout(() => {
      scroller.current?.scrollTo({ x: index * width, animated: false })
    }, 0)
    return () => clearTimeout(id)
  }, [index, width])

  return (
    <Modal visible={index != null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {urls.map((url, i) => (
            <Pressable key={i} onPress={onClose} style={{ width, height }}>
              {url ? (
                <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="contain" />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>

        <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  )
}

// Дэвсгэр нь үргэлж бараан тул theme-ээс хамаарахгүй — өнгө нь тогтмол.
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  close: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
})
