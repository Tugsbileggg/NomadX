import { useEffect, useMemo, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"
import {
  MARKER_RING,
  MARKER_SIZE,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_SIZE_PX,
  tileUrlFor,
} from "@/lib/map-style"

export type MapMarker = {
  id: string
  lat: number
  lng: number
  title: string
  /** Сонгогдсон цэг — томроод нэрийн бөмбөлөгтэй болно. */
  selected?: boolean
}

type Props = {
  center: { lat: number; lng: number }
  markers: MapMarker[]
  onMarkerPress: (id: string) => void
}

/**
 * Native (iOS/Android) газрын зураг — react-native-maps.
 *
 * Суурь давхаргыг платформын өөрийн зургаас CARTO tile-аар сольсон. Хоёр
 * тохиргоо хоёулаа заавал: iOS дээр `shouldReplaceMapContent` нь Apple
 * Maps-ыг нууна, Android дээр `mapType="none"` нь Google Maps-ыг нууна.
 * Аль нэгийг нь орхивол тухайн платформ дээр хоёр зураг давхарлаж
 * харагдана.
 */
export function BusinessMap({ center, markers, onMarkerPress }: Props) {
  const { scheme, colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <View style={styles.fill}>
      <MapView
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === "android" ? "none" : "standard"}
        style={styles.fill}
        // Растер tile нь эргүүлэх/налуулахад муухай сунадаг тул хаав.
        rotateEnabled={false}
        pitchEnabled={false}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        <UrlTile
          key={scheme}
          urlTemplate={tileUrlFor(scheme)}
          tileSize={TILE_SIZE_PX}
          maximumZ={TILE_MAX_ZOOM}
          shouldReplaceMapContent
          zIndex={-1}
        />

        {markers.map((m) => (
          <BrandMarker key={m.id} marker={m} onPress={() => onMarkerPress(m.id)} />
        ))}
      </MapView>

      <Text style={styles.attribution}>{TILE_ATTRIBUTION}</Text>
    </View>
  )
}

/**
 * `tracksViewChanges` нь идэвхтэй үед marker бүрийн зургийг frame тутам
 * дахин авдаг тул хэдхэн marker дээр ч мэдэгдэхүйц удаашруулна. Эхний
 * зураглал хийгдмэгц унтраана — шууд `false`-ээр эхлүүлбэл iOS дээр marker
 * хоосон гарч ирдэг.
 */
function BrandMarker({ marker, onPress }: { marker: MapMarker; onPress: () => void }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const [tracksViewChanges, setTracksViewChanges] = useState(true)

  // Сонгогдсон цэг өөрчлөгдөхөд зургаа дахин авах ёстой тул `selected`-ийг
  // хамааралд оруулав.
  useEffect(() => {
    setTracksViewChanges(true)
    const id = setTimeout(() => setTracksViewChanges(false), 300)
    return () => clearTimeout(id)
  }, [marker.selected])

  return (
    <Marker
      coordinate={{ latitude: marker.lat, longitude: marker.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      accessibilityLabel={marker.title}
    >
      {/* Marker-ийн хүүхэд View-г Android нь яг хэмжээгээр нь bitmap болгон
          хуулдаг — сүүдэрт зай үлдээхгүй бол тайрагдана. */}
      <View style={styles.pinWrap}>
        {marker.selected && (
          <View style={styles.pinLabel}>
            <Text style={styles.pinLabelText} numberOfLines={1}>
              {marker.title}
            </Text>
          </View>
        )}
        <View style={[styles.pin, marker.selected && styles.pinSelected]} />
      </View>
    </Marker>
  )
}

const PIN_OUTER = MARKER_SIZE + MARKER_RING * 2

function makeStyles(colors: BrandPalette) {
  return StyleSheet.create({
  fill: { flex: 1 },
  pinWrap: { padding: 4, alignItems: "center" },
  pin: {
    width: PIN_OUTER,
    height: PIN_OUTER,
    borderRadius: PIN_OUTER / 2,
    backgroundColor: colors.primary,
    borderWidth: MARKER_RING,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOpacity: 0.45,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  pinSelected: {
    width: PIN_OUTER + 10,
    height: PIN_OUTER + 10,
    borderRadius: (PIN_OUTER + 10) / 2,
  },
  pinLabel: {
    marginBottom: 4,
    maxWidth: 160,
    borderRadius: 999,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.ink,
        shadowOpacity: 0.18,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  pinLabelText: { fontSize: 11, fontWeight: "700", color: colors.ink },
  attribution: {
    position: "absolute",
    right: 6,
    bottom: 6,
    fontSize: 9,
    color: colors.muted,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
})
}
