import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import { StyleSheet } from "react-native"

import { Brand } from "@/constants/theme"

export type MapMarker = { id: string; lat: number; lng: number; title: string }

type Props = {
  center: { lat: number; lng: number }
  markers: MapMarker[]
  onMarkerPress: (id: string) => void
}

/** Native (iOS/Android) газрын зураг — react-native-maps ашиглана. */
export function BusinessMap({ center, markers, onMarkerPress }: Props) {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          title={m.title}
          pinColor={Brand.primary}
          onPress={() => onMarkerPress(m.id)}
        />
      ))}
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: { flex: 1 },
})
