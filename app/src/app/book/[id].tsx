import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import { Brand } from "@/constants/theme"
import { createBooking, uploadBookingImages } from "@/lib/bookings"
import { fetchBusiness, type BusinessCard } from "@/lib/businesses"
import { mnWeekdayShort } from "@/lib/mn-date"
import { fetchSlotDays, type SlotDay } from "@/lib/slots"

/** Хэт олон зураг илгээвэл base64 нь санах ойд хүндрэх тул хязгаарлав. */
const MAX_IMAGES = 4

type PickedImage = { uri: string; base64: string; mime: string }

function dayLabel(d: Date, index: number) {
  if (index === 0) return "Өнөөдөр"
  if (index === 1) return "Маргааш"
  return `${mnWeekdayShort(d)}, ${d.getDate()}`
}

export default function BookScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [business, setBusiness] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [dayIndex, setDayIndex] = useState(0)
  const [days, setDays] = useState<SlotDay[]>([])
  /** Сонгосон цагийн бодит мөч — өдөр солиход тэглэгдэнэ. */
  const [slotAt, setSlotAt] = useState<Date | null>(null)
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<PickedImage[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    Promise.all([fetchBusiness(id), fetchSlotDays(id)]).then(([b, d]) => {
      setBusiness(b)
      setDays(d)
      // Эхний боломжтой өдөр рүү шилжинэ — өнөөдөр амарч байвал хоосон
      // жагсаалт харуулах нь утгагүй.
      const first = d.findIndex((day) => day.slots.some((slot) => !slot.full))
      setDayIndex(first === -1 ? 0 : first)
      setLoading(false)
    })
  }, [id])

  const activeDay = days[dayIndex]

  async function onPickImages() {
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) return

    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) {
      setError("Зураг хавсаргахын тулд зургийн сангийн зөвшөөрөл өгнө үү.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      // Байршуулалт нь base64-аар явдаг тул чанарыг бууруулж хэмжээг барина.
      quality: 0.6,
      base64: true,
    })

    if (result.canceled) return

    const picked = result.assets
      .filter((a) => a.base64)
      .map((a) => ({
        uri: a.uri,
        base64: a.base64 as string,
        mime: a.mimeType ?? "image/jpeg",
      }))

    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES))
    setError(null)
  }

  async function onConfirm() {
    if (!slotAt) {
      setError("Цагаа сонгоно уу.")
      return
    }
    if (description.trim().length < 5) {
      setError("Ямар үйлчилгээ авахаа бичнэ үү.")
      return
    }

    setBusy(true)
    setError(null)

    const booking = await createBooking(id, slotAt, description)
    if ("error" in booking) {
      setBusy(false)
      setError(booking.error)
      return
    }

    // Захиалга үүссэн — зураг унасан ч захиалгыг хүчингүй болгохгүй,
    // зөвхөн мэдэгдээд үргэлжлүүлнэ.
    const uploadError = await uploadBookingImages(booking.id, images)
    setBusy(false)

    if (uploadError) {
      setError(`Захиалга илгээгдсэн ч зураг хавсаргаж чадсангүй: ${uploadError}`)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Захиалга илгээгдлээ</Text>
          <Text style={styles.successBody}>
            {business?.name} таны хүсэлтийг хараад баталгаажуулна. Үнийн дүнг үйлчилгээ
            дууссаны дараа тэд оруулна. &ldquo;Захиалга&rdquo; tab-аас хянана.
          </Text>
          <AuthButton label="Захиалгууд руу очих" onPress={() => router.replace("/bookings")} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Brand.primary} />
      </Pressable>

      {loading ? (
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.title}>Цаг захиалах</Text>
          <Text style={styles.subtitle}>{business?.name}</Text>

          <Text style={styles.sectionLabel}>Өдөр сонгох</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={styles.dayRow}>
              {days.map((day, i) => {
                const active = i === dayIndex
                // Амарч байгаа болон бүх цаг нь дүүрсэн өдрийг бүдэг харуулна.
                const unavailable = day.slots.every((slot) => slot.full)
                return (
                  <Pressable
                    key={day.date.toISOString()}
                    onPress={() => {
                      setDayIndex(i)
                      setSlotAt(null)
                    }}
                    style={[
                      styles.dayChip,
                      active && styles.dayChipActive,
                      !active && unavailable && styles.dayChipDisabled,
                    ]}
                  >
                    <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                      {dayLabel(day.date, i)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Цаг сонгох</Text>
          {activeDay && activeDay.slots.length === 0 ? (
            <Text style={styles.emptySlots}>
              {activeDay.closed
                ? "Энэ өдөр амарна. Өөр өдөр сонгоно уу."
                : "Энэ өдөр захиалга авах цаг алга."}
            </Text>
          ) : (
            <View style={styles.hourGrid}>
              {activeDay?.slots.map((slot) => {
                const active = slotAt?.getTime() === slot.at.getTime()
                return (
                  <Pressable
                    key={slot.at.toISOString()}
                    disabled={slot.full}
                    onPress={() => setSlotAt(slot.at)}
                    style={[
                      styles.hourChip,
                      active && styles.hourChipActive,
                      slot.full && styles.hourChipFull,
                    ]}
                  >
                    <Text
                      style={[
                        styles.hourChipText,
                        active && styles.hourChipTextActive,
                        slot.full && styles.hourChipTextFull,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Ямар үйлчилгээ авах вэ?</Text>
          <Text style={styles.sectionHint}>
            Хүссэн зүйлээ аль болох дэлгэрэнгүй бичнэ үү. Үнийн дүнг {business?.name} үйлчилгээ
            дууссаны дараа тооцож оруулна.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Жишээ: Мөрний урттай үсээ 10 см тайруулж, доод талыг нь давхаргатай болгомоор байна. Өнгө өөрчлөхгүй."
            placeholderTextColor={Brand.muted}
            multiline
            style={styles.noteInput}
          />

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
            Жишээ зураг {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
          </Text>
          <Text style={styles.sectionHint}>
            Хүсч буй загвараа зургаар харуулбал илүү ойлгомжтой. Заавал биш.
          </Text>

          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={img.uri} style={styles.thumb}>
                <Image source={{ uri: img.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                <Pressable
                  onPress={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  hitSlop={6}
                  style={styles.thumbRemove}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </View>
            ))}

            {images.length < MAX_IMAGES && (
              <Pressable onPress={onPickImages} style={styles.addThumb}>
                <Ionicons name="add" size={22} color={Brand.primary} />
                <Text style={styles.addThumbText}>Нэмэх</Text>
              </Pressable>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: 20 }}>
            <AuthButton label="Захиалгаа илгээх" onPress={onConfirm} busy={busy} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  back: { marginTop: 8, marginLeft: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  page: { padding: 20, paddingBottom: 64 },
  title: { fontSize: 22, fontWeight: "700", color: Brand.ink },
  subtitle: { fontSize: 13, color: Brand.body, marginTop: 2, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  sectionHint: { fontSize: 11, color: Brand.muted, lineHeight: 16, marginTop: 3 },
  dayRow: { flexDirection: "row", gap: 8 },
  dayChip: { paddingHorizontal: 14, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  dayChipActive: { backgroundColor: Brand.primary },
  dayChipText: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  dayChipTextActive: { color: "#fff" },
  dayChipDisabled: { backgroundColor: Brand.surfaceTint, opacity: 0.6 },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  hourChip: { width: "22%", height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  hourChipActive: { backgroundColor: Brand.primary },
  hourChipText: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  hourChipTextActive: { color: "#fff" },
  hourChipFull: { backgroundColor: Brand.surfaceTint2 },
  hourChipTextFull: { color: Brand.muted, textDecorationLine: "line-through" },
  emptySlots: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 12,
    color: Brand.muted,
    textAlign: "center",
  },
  noteInput: { marginTop: 8, minHeight: 96, borderRadius: 14, backgroundColor: "#fff", padding: 14, fontSize: 13, lineHeight: 19, color: Brand.ink, textAlignVertical: "top" },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  thumb: { width: 76, height: 76, borderRadius: 12, overflow: "hidden", backgroundColor: Brand.surfaceTint2 },
  thumbRemove: { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(33,26,27,0.7)", alignItems: "center", justifyContent: "center" },
  addThumb: { width: 76, height: 76, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: Brand.outline, alignItems: "center", justifyContent: "center", gap: 2 },
  addThumbText: { fontSize: 10, fontWeight: "600", color: Brand.primary },
  error: { marginTop: 12, fontSize: 12, color: Brand.danger, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.success, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  successTitle: { fontSize: 18, fontWeight: "700", color: Brand.ink, textAlign: "center" },
  successBody: { fontSize: 13, color: Brand.body, textAlign: "center", lineHeight: 19, marginBottom: 12 },
})
