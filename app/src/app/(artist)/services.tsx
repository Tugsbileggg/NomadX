import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/AuthButton"
import type { BrandPalette } from "@/constants/theme"
import {
  deleteArtistService,
  fetchArtistServices,
  saveArtistService,
  type ArtistService,
} from "@/lib/artist-catalog"
import { useAppTheme } from "@/lib/theme-context"

/**
 * Үйлчилгээний үнийн цэс.
 *
 * ⚠️ Эдгээр нь захиалгад ШУУД холбогддоггүй — үйлчлүүлэгч хүслээ чөлөөтэй
 * бичдэг урсгалтай. Энэ жагсаалт нь профайл дээр үнийн цэс болж харагдана.
 */
export default function ArtistServicesScreen() {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const router = useRouter()

  const [services, setServices] = useState<ArtistService[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ArtistService | "new" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setServices(await fetchArtistServices())
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  async function onDelete(id: string) {
    setError(null)
    const failed = await deleteArtistService(id)
    if (failed) {
      setError(failed)
      return
    }
    await load()
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Үйлчилгээ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.hint}>
          Эдгээр нь профайл дээр үнийн цэс болж харагдана. Үйлчлүүлэгч захиалахдаа
          хүслээ чөлөөтэй бичдэг тул үйлчилгээ сонгодоггүй.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {editing && (
          <ServiceForm
            service={editing === "new" ? null : editing}
            styles={styles}
            colors={colors}
            onDone={async () => {
              setEditing(null)
              await load()
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : services.length === 0 && !editing ? (
          <Text style={styles.empty}>Одоогоор үйлчилгээ бүртгээгүй байна.</Text>
        ) : (
          services.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{s.name}</Text>
                  {!s.isActive && <Text style={styles.off}>идэвхгүй</Text>}
                </View>
                {s.description && <Text style={styles.desc}>{s.description}</Text>}
                <Text style={styles.meta}>
                  {s.price.toLocaleString("en-US")}₮ · {s.durationMin} мин
                </Text>
              </View>
              <Pressable onPress={() => setEditing(s)} hitSlop={6} style={styles.iconButton}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => void onDelete(s.id)} hitSlop={6} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}

        {!editing && (
          <View style={{ marginTop: 18 }}>
            <AuthButton label="Үйлчилгээ нэмэх" onPress={() => setEditing("new")} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ServiceForm({
  service,
  styles,
  colors,
  onDone,
  onCancel,
}: {
  service: ArtistService | null
  styles: ReturnType<typeof makeStyles>
  colors: BrandPalette
  onDone: () => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(service?.name ?? "")
  const [price, setPrice] = useState(service ? String(service.price) : "")
  const [duration, setDuration] = useState(String(service?.durationMin ?? 60))
  const [description, setDescription] = useState(service?.description ?? "")
  const [isActive, setIsActive] = useState(service?.isActive ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setBusy(true)
    setError(null)
    const failed = await saveArtistService({
      id: service?.id,
      name,
      price: Number(price),
      durationMin: Number(duration),
      description,
      isActive,
    })
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    await onDone()
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{service ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ"}</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Нэр (жишээ: Гель маникюр)"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <View style={styles.row}>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Үнэ (₮)"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={[styles.input, { flex: 1 }]}
        />
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Минут"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={[styles.input, { width: 100 }]}
        />
      </View>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Тайлбар (заавал биш)"
        placeholderTextColor={colors.muted}
        multiline
        style={[styles.input, { minHeight: 70, textAlignVertical: "top", paddingTop: 12 }]}
      />

      <Pressable onPress={() => setIsActive((v) => !v)} style={styles.toggleRow}>
        <View style={[styles.checkbox, isActive && styles.checkboxOn]}>
          {isActive && <Ionicons name="checkmark" size={13} color={colors.onPrimary} />}
        </View>
        <Text style={styles.toggleText}>Идэвхтэй — профайл дээр харагдана</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ gap: 4, marginTop: 8 }}>
        <AuthButton label="Хадгалах" onPress={onSave} busy={busy} />
        <Pressable onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>Болих</Text>
        </Pressable>
      </View>
    </View>
  )
}

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surfaceTint },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 10,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.ink },
    page: { padding: 20, paddingTop: 4, paddingBottom: 48 },
    hint: { fontSize: 12, color: colors.body, lineHeight: 18, marginBottom: 14 },
    error: { fontSize: 12, color: colors.danger, marginBottom: 10 },
    empty: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 24 },

    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    name: { fontSize: 13, fontWeight: "700", color: colors.ink },
    off: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.muted,
      backgroundColor: colors.surfaceTint2,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    desc: { fontSize: 11, color: colors.body, marginTop: 2, lineHeight: 16 },
    meta: { fontSize: 12, fontWeight: "600", color: colors.primary, marginTop: 4 },
    iconButton: { padding: 4 },

    form: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10, marginBottom: 16 },
    formTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
    row: { flexDirection: "row", gap: 10 },
    input: {
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.surfaceTint,
      paddingHorizontal: 14,
      fontSize: 13,
      color: colors.ink,
    },
    toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    toggleText: { flex: 1, fontSize: 12, color: colors.body },
    cancel: { alignItems: "center", paddingVertical: 10 },
    cancelText: { fontSize: 13, fontWeight: "600", color: colors.body },
  })
}
