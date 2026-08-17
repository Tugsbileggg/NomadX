import * as Location from "expo-location"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  createPublisher,
  shouldSend,
  type Fix,
} from "@/lib/live-location"

type Publisher = ReturnType<typeof createPublisher>

export default function ShareScreen() {
  const [room, setRoom] = useState("UB-1024")
  const [live, setLive] = useState(false)
  const [status, setStatus] = useState("Байршил хуваалцаагүй байна")
  const [fix, setFix] = useState<Fix | null>(null)
  const [sent, setSent] = useState(0)
  const [busy, setBusy] = useState(false)

  const watcher = useRef<Location.LocationSubscription | null>(null)
  const publisher = useRef<Publisher | null>(null)
  const lastSent = useRef<Fix | null>(null)

  const stop = useCallback(async () => {
    watcher.current?.remove()
    watcher.current = null
    await publisher.current?.close()
    publisher.current = null
    lastSent.current = null
    setLive(false)
    setStatus("Зогслоо")
  }, [])

  useEffect(() => () => void stop(), [stop])

  const start = useCallback(async () => {
    setBusy(true)
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync()
      if (perm !== "granted") {
        setStatus("Байршлын зөвшөөрөл өгөөгүй байна")
        return
      }

      setStatus("Realtime суваг нээж байна…")
      const pub = createPublisher(room)
      publisher.current = pub
      await pub.joined

      setStatus("GPS уншиж байна…")
      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (position) => {
          const next: Fix = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            acc: position.coords.accuracy,
            spd: position.coords.speed,
            t: Date.now(),
          }
          setFix(next)

          if (!shouldSend(lastSent.current, next)) return
          lastSent.current = next
          pub
            .send(next)
            .then(() => setSent((n) => n + 1))
            .catch((error: Error) => setStatus(`Илгээх алдаа: ${error.message}`))
        }
      )

      setLive(true)
      setStatus(`Хуваалцаж байна · өрөө ${room.toUpperCase()}`)
    } catch (error) {
      setStatus(`Алдаа: ${(error as Error).message}`)
      await stop()
    } finally {
      setBusy(false)
    }
  }, [room, stop])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>Байршил хуваалцах</Text>
        <Text style={styles.sub}>
          Өрөөний код нь вэб дээрх кодтой ижил байх ёстой.
        </Text>

        <Text style={styles.label}>Өрөөний код</Text>
        <TextInput
          value={room}
          onChangeText={setRoom}
          editable={!live}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="UB-1024"
          placeholderTextColor="#9b8b8d"
          style={[styles.input, live && styles.inputDisabled]}
        />

        <Pressable
          onPress={live ? stop : start}
          disabled={busy}
          style={({ pressed }) => [
            styles.button,
            live && styles.buttonStop,
            (pressed || busy) && styles.buttonPressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {live ? "Зогсоох" : "Байршил хуваалцаж эхлэх"}
            </Text>
          )}
        </Pressable>

        <View style={styles.statusRow}>
          <View style={[styles.dot, live && styles.dotLive]} />
          <Text style={styles.status}>{status}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Өргөрөг" value={fix ? fix.lat.toFixed(6) : "—"} />
          <Row label="Уртраг" value={fix ? fix.lon.toFixed(6) : "—"} />
          <Row
            label="Нарийвчлал"
            value={fix?.acc != null ? `±${Math.round(fix.acc)} м` : "—"}
          />
          <Row
            label="Хурд"
            value={
              fix?.spd != null && fix.spd >= 0
                ? `${(fix.spd * 3.6).toFixed(1)} км/ц`
                : "—"
            }
          />
          <Row label="Илгээсэн" value={String(sent)} />
        </View>

        {Platform.OS === "web" ? (
          <Text style={styles.note}>
            Вэб дээр GPS нь HTTPS эсвэл localhost дээр л ажиллана.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff8f7" },
  page: { padding: 24, gap: 12, paddingBottom: 96 },
  title: { fontSize: 26, fontWeight: "700", color: "#211a1b" },
  sub: { fontSize: 14, color: "#8a7b7d", marginBottom: 8 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8a7b7d",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6d2d4",
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#211a1b",
  },
  inputDisabled: { opacity: 0.55 },
  button: {
    height: 56,
    borderRadius: 999,
    backgroundColor: "#8a4853",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonStop: { backgroundColor: "#c0304a" },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#c9b7b8" },
  dotLive: { backgroundColor: "#1e8e4a" },
  status: { flex: 1, fontSize: 13, color: "#4a3f41" },
  card: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontSize: 14, color: "#8a7b7d" },
  rowValue: {
    fontSize: 15,
    color: "#211a1b",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  note: { fontSize: 12, color: "#8a7b7d", marginTop: 4 },
})
