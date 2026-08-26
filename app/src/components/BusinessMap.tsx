import { useEffect, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps"

import { Brand } from "@/constants/theme"
import {
  MARKER_RING,
  MARKER_SIZE,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_SIZE_PX,
  TILE_URL,
} from "@/lib/map-style"

export type MapMarker = { id: string; lat: number; lng: number; title: string }

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
          urlTemplate={TILE_URL}
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
  const [tracksViewChanges, setTracksViewChanges] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setTracksViewChanges(false), 300)
    return () => clearTimeout(id)
  }, [])

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
        <View style={styles.pin} />
      </View>
    </Marker>
  )
}

const PIN_OUTER = MARKER_SIZE + MARKER_RING * 2

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pinWrap: { padding: 4 },
  pin: {
    width: PIN_OUTER,
    height: PIN_OUTER,
    borderRadius: PIN_OUTER / 2,
    backgroundColor: Brand.primary,
    borderWidth: MARKER_RING,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: Brand.primary,
        shadowOpacity: 0.45,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  attribution: {
    position: "absolute",
    right: 6,
    bottom: 6,
    fontSize: 9,
    color: Brand.muted,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
})
