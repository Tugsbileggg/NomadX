import { useEffect, useMemo, useRef, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  UrlTile,
  type MapPressEvent,
} from "react-native-maps"

import type { BrandPalette } from "@/constants/theme"
import { useAppTheme } from "@/lib/theme-context"
import {
  MAP_ZOOM_OVERVIEW,
  ME_DOT_COLOR,
  ME_DOT_SIZE,
  MARKER_RING,
  MARKER_SIZE,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_SIZE_PX,
  deltaForZoom,
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
  /**
   * Ойртолтыг ЭНЭ түвшинд тогтооно. Орхивол одоогийн ойртолтыг хэвээр
   * үлдээгээд зөвхөн зөөнө — сонгосон салон руу төвлөрөхөд бусад цэгүүд
   * дэлгэцээс гарч алга болохгүйн тулд.
   */
  zoom?: number
  markers: MapMarker[]
  /** Байршлын зөвшөөрөл өгөөгүй бол null — цэг нь зурагдахгүй. */
  myLocation?: { lat: number; lng: number } | null
  /**
   * Төв нь өөрчлөгдөөгүй ч дахин голлуулах шаардлагатай үед нэмэгдэх тоо
   * (хэрэглэгч зургийг чирсний дараа "миний байршил" дарах гэх мэт).
   */
  recenterKey?: number
  onMarkerPress: (id: string) => void
  /**
   * Хоосон газар дарахад дарсан цэгийн координатыг өгнө — сонголт цуцлах,
   * эсвэл байршил сонгуулахад хоёуланд нь тохирно.
   */
  onMapPress?: (coords: { lat: number; lng: number }) => void
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
export function BusinessMap({
  center,
  zoom,
  markers,
  myLocation,
  recenterKey = 0,
  onMarkerPress,
  onMapPress,
}: Props) {
  const { scheme, colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const mapRef = useRef<MapView>(null)

  // `initialRegion` нь зөвхөн эхний зураглалд үйлчилдэг тул төв солигдоход
  // гараар шилжүүлэхээс өөр аргагүй. `center` объект нь дуудалт бүрд шинээр
  // ирдэг учир координатыг нь тусад нь хамааралд өгөв.
  useEffect(() => {
    if (zoom == null) {
      // `animateCamera` нь ойртолтод хүрэхгүй тул зөвхөн зөөнө.
      mapRef.current?.animateCamera(
        { center: { latitude: center.lat, longitude: center.lng } },
        { duration: 400 },
      )
      return
    }

    const delta = deltaForZoom(zoom)
    mapRef.current?.animateToRegion(
      {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      400,
    )
  }, [center.lat, center.lng, zoom, recenterKey])

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === "android" ? "none" : "standard"}
        style={styles.fill}
        // Растер tile нь эргүүлэх/налуулахад муухай сунадаг тул хаав.
        rotateEnabled={false}
        pitchEnabled={false}
        onPress={(e: MapPressEvent) => {
          // Android дээр marker дарахад газрын зургийн `onPress` мөн
          // дуудагддаг — тэр үед сонголтыг шууд цуцалж болохгүй.
          if (e.nativeEvent.action === "marker-press") return
          const c = e.nativeEvent.coordinate
          onMapPress?.({ lat: c.latitude, lng: c.longitude })
        }}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: deltaForZoom(zoom ?? MAP_ZOOM_OVERVIEW),
          longitudeDelta: deltaForZoom(zoom ?? MAP_ZOOM_OVERVIEW),
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

        {myLocation && <MeMarker lat={myLocation.lat} lng={myLocation.lng} />}

        {markers.map((m) => (
          <BrandMarker
            key={`${m.id}:${m.selected ? 1 : 0}`}
            marker={m}
            onPress={() => onMarkerPress(m.id)}
          />
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

  // Сонгогдсон цэг өөрчлөгдөхөд зургаа дахин авах ёстой. Урьд нь энд
  // `setTracksViewChanges(true)` гэж синхроноор буцаадаг байсныг эцэг нь
  // `key`-д `selected`-ийг оруулснаар сольсон: бүрэлдэхүүн дахин mount
  // хийгдэж төлөв нь өөрөө `true` болно (react-hooks/set-state-in-effect).
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

/**
 * Хэрэглэгчийн байршил. Салоны marker-аас өөр өнгө, өөр хэлбэртэй бөгөөд
 * дарагдахгүй — зөвхөн "би энд байна" гэдгийг заана.
 */
function MeMarker({ lat, lng }: { lat: number; lng: number }) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  // BrandMarker-тэй ижил шалтгаан: шууд `false`-ээр эхлүүлбэл iOS дээр
  // marker хоосон гарч ирдэг.
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setTracksViewChanges(false), 300)
    return () => clearTimeout(id)
  }, [])

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      // Дарах боломжгүй — зөвхөн "би энд байна" гэдгийг заана.
      accessibilityLabel="Миний байршил"
    >
      <View style={styles.pinWrap}>
        <View style={styles.meDot} />
      </View>
    </Marker>
  )
}

const PIN_OUTER = MARKER_SIZE + MARKER_RING * 2

const ME_OUTER = ME_DOT_SIZE + MARKER_RING * 2

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
  meDot: {
    width: ME_OUTER,
    height: ME_OUTER,
    borderRadius: ME_OUTER / 2,
    backgroundColor: ME_DOT_COLOR,
    borderWidth: MARKER_RING,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: ME_DOT_COLOR,
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
    color: colors.muted,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
})
}
