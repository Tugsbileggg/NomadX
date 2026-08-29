import "leaflet/dist/leaflet.css"

import { useEffect, useRef, useState } from "react"

import { useAppTheme } from "@/lib/theme-context"
import {
  MARKER_RING,
  MARKER_SIZE,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
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

type Leaflet = typeof import("leaflet")

/**
 * Web газрын зураг — Leaflet-ийг imperative API-аар зөвхөн клиент дээр
 * ачаална. Expo Router web нь SSR хийдэг тул `leaflet`-ийг module scope-д
 * шууд import хийвэл "window is not defined" алдаагаар унана (яг адилхан
 * асуудлыг Supabase client дээр өмнө нь олж засаж байсан) — тиймээс
 * `import()`-ийг useEffect дотор л дуудна.
 *
 * Суурь tile болон marker-ийн төрх нь `lib/map-style.ts`-ээс ирэх тул
 * native хувилбартай ижил харагдана.
 */
export function BusinessMap({ center, markers, onMarkerPress }: Props) {
  const { scheme, colors } = useAppTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const tileRef = useRef<import("leaflet").TileLayer | null>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null)
  const leafletRef = useRef<Leaflet | null>(null)
  const [ready, setReady] = useState(false)

  // Дуудагдах бүрд шинэ callback ирдэг тул түүнийг effect-ийн хамаарал
  // болговол marker-ууд байнга дахин үүснэ — ref-ээр хамгийн сүүлийн
  // утгыг уншина. (Render дотор ref бичих нь React Compiler-т таарахгүй
  // тул зөвхөн effect дотор шинэчилнэ.)
  const pressRef = useRef(onMarkerPress)
  useEffect(() => {
    pressRef.current = onMarkerPress
  }, [onMarkerPress])

  // Зураг үүсгэх effect нь `scheme`-ийг хамааралдаа авбал горим солигдоход
  // бүхэл зураг дахин үүсэж, харагдац нь тэглэгдэнэ — ref-ээр уншина.
  const schemeRef = useRef(scheme)
  useEffect(() => {
    schemeRef.current = scheme
    tileRef.current?.setUrl(tileUrlFor(scheme))
  }, [scheme])

  useEffect(() => {
    let cancelled = false

    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = leaflet.map(containerRef.current).setView([center.lat, center.lng], 12)
      tileRef.current = leaflet
        .tileLayer(tileUrlFor(schemeRef.current), {
          attribution: TILE_ATTRIBUTION,
          maxZoom: TILE_MAX_ZOOM,
        })
        .addTo(map)

      leafletRef.current = leaflet
      layerRef.current = leaflet.layerGroup().addTo(map)
      mapRef.current = map
      setReady(true)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
      setReady(false)
    }
    // Зөвхөн нэг удаа үүсгэнэ — `center` нь эхний байрлалыг л тодорхойлно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Хайлтын үр дүн шүүгдэхэд marker-ууд өөрчлөгддөг тул тусад нь
  // тааруулна. `markers` нь дуудагдах бүрд шинэ массив ирдэг учир
  // жинхэнэ агуулга нь өөрчлөгдсөн үед л ажиллахаар түлхүүр болгов.
  const markerKey = markers.map((m) => `${m.id}:${m.lat}:${m.lng}:${m.selected ?? 0}`).join("|")

  useEffect(() => {
    const leaflet = leafletRef.current
    const layer = layerRef.current
    if (!leaflet || !layer) return

    layer.clearLayers()

    for (const m of markers) {
      const size = m.selected ? MARKER_SIZE + 10 : MARKER_SIZE
      const outer = size + MARKER_RING * 2

      const dot = `<div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${colors.primary};
        border:${MARKER_RING}px solid ${colors.surface};
        box-shadow:0 2px 6px rgba(138,72,83,0.45);
      "></div>`

      // Сонгогдсон цэгийн нэр нь цэгийн дээр бөмбөлөг болж гарна.
      const label = m.selected
        ? `<div style="
             position:absolute; bottom:${outer + 4}px; left:50%; transform:translateX(-50%);
             max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
             background:${colors.surface}; border-radius:999px; padding:4px 10px;
             font-size:11px; font-weight:700; color:${colors.ink};
             box-shadow:0 2px 8px rgba(33,26,27,0.18);
           ">${escapeHtml(m.title)}</div>`
        : ""

      leaflet
        .marker([m.lat, m.lng], {
          icon: leaflet.divIcon({
            className: "",
            html: `<div style="position:relative">${label}${dot}</div>`,
            iconSize: [outer, outer],
            iconAnchor: [outer / 2, outer / 2],
          }),
          zIndexOffset: m.selected ? 1000 : 0,
        })
        .on("click", () => pressRef.current(m.id))
        .addTo(layer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, markerKey, colors])

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
}

/** Нэр нь хэрэглэгчийн оруулсан текст тул HTML-д шууд тавихгүй. */
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  )
}
