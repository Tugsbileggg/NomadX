import "leaflet/dist/leaflet.css"

import { useEffect, useRef } from "react"

import { Brand } from "@/constants/theme"

export type MapMarker = { id: string; lat: number; lng: number; title: string }

type Props = {
  center: { lat: number; lng: number }
  markers: MapMarker[]
  onMarkerPress: (id: string) => void
}

/**
 * Web газрын зураг — Leaflet-ийг imperative API-аар зөвхөн клиент дээр
 * ачаална. Expo Router web нь SSR хийдэг тул `leaflet`-ийг module scope-д
 * шууд import хийвэл "window is not defined" алдаагаар унана (яг адилхан
 * асуудлыг Supabase client дээр өмнө нь олж засаж байсан) — тиймээс
 * `import()`-ийг useEffect дотор л дуудна.
 */
export function BusinessMap({ center, markers, onMarkerPress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)

  useEffect(() => {
    let cancelled = false

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current).setView([center.lat, center.lng], 12)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map)

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${Brand.primary};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      for (const m of markers) {
        L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindTooltip(m.title)
          .on("click", () => onMarkerPress(m.id))
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
}
