import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { ARTISTS_ROOM, type ArtistFix } from "@/lib/artist-live"
import { useAuth } from "@/lib/auth-context"
import { CFG, createPublisher, shouldSend, type Fix } from "@/lib/live-location"

const STORAGE_KEY = "lumina-location-sharing"

export type Coords = { lat: number; lng: number }

/**
 * Зөвшөөрлийн төлөв.
 *
 * `pending` нь "хараахан хариу ирээгүй" гэсэн үг — татгалзсантай адилгүй
 * тул газрын зураг дээр "байршил олдсонгүй" гэж эрт бичихээс сэргийлнэ.
 */
export type LocationPermission = "pending" | "granted" | "denied"

type LocationState = {
  /** Зөвшөөрөл өгөөгүй, эсвэл хараахан тогтоогүй бол null. */
  myLocation: Coords | null
  permission: LocationPermission
  /** Хэрэглэгч байршлаа хуваалцахыг зөвшөөрсөн эсэх (профайлын товч). */
  sharing: boolean
  /** Профайлын товчноос асаах/унтраах. Асаахад зөвшөөрөл шаардвал асууна. */
  setSharing: (next: boolean) => Promise<void>
  /**
   * Байршлыг дахин тогтооно — "миний байршил" товч дарахад.
   *
   * Артист тасралтгүй хянагддаг тул энэ нь голдуу хэрэглэгчид зориулагдана.
   */
  refresh: () => Promise<Coords | null>
}

const LocationContext = createContext<LocationState>({
  myLocation: null,
  permission: "pending",
  sharing: false,
  setSharing: async () => {},
  refresh: async () => null,
})

/**
 * Байршлын зөвшөөрөл, төлөв, хуваалцалтыг апп даяар нэг дор удирдана.
 *
 * Хоёр эрх өөр өөрөөр ажиллана:
 *
 * - **Хэрэглэгч** — нэг л удаа байрлалаа тогтоогоод газрын зураг дээрээ
 *   харна. Тасралтгүй хянах шаардлагагүй тул батарей элээхгүй.
 * - **Артист** — апп нээлттэй байх хугацаанд байрлалаа тасралтгүй хянаж,
 *   хэрэглэгчид рүү Realtime-аар цацна.
 *
 * Зөвшөөрлийг НЭГ л удаа асууна. Дараа нь хэрэглэгч профайл дээрх
 * товчоор өөрөө удирдана — апп нээх бүрд цонх гаргаж залхаахгүй.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const { session, account } = useAuth()
  const [myLocation, setMyLocation] = useState<Coords | null>(null)
  const [permission, setPermission] = useState<LocationPermission>("pending")
  const [sharing, setSharingState] = useState(false)
  // Хадгалсан сонголт уншигдаж дуустал зөвшөөрөл асуухгүй — эс тэгвэл
  // "унтраасан" гэж хадгалсан хэрэглэгчээс дахин асууна.
  const [loaded, setLoaded] = useState(false)

  const isArtist = account?.role === "artist"
  const businessId = account?.business?.id ?? null

  /** Зөвшөөрөл асууж, нэг удаагийн байрлал авна. Татгалзвал null. */
  const locate = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      setPermission("denied")
      setMyLocation(null)
      return null
    }

    setPermission("granted")
    const pos = await Location.getCurrentPositionAsync({})
    const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    setMyLocation(next)
    return next
  }, [])

  // Хадгалсан сонголтыг уншина. Хадгалаагүй бол `null` — доорх эффект
  // үүнийг "хараахан асуугаагүй" гэж үзээд нэг удаа асууна.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "on") setSharingState(true)
        else if (saved === "off") setSharingState(false)
      })
      // Уншилт унасан ч аппыг зогсоох шалтгаан биш.
      .finally(() => setLoaded(true))
  }, [])

  const setSharing = useCallback(
    async (next: boolean) => {
      if (!next) {
        setSharingState(false)
        setMyLocation(null)
        await AsyncStorage.setItem(STORAGE_KEY, "off")
        return
      }

      // Зөвшөөрөлгүйгээр асаавал товч "асаалттай" гэж харагдаад үнэндээ
      // юу ч хуваалцахгүй — хэрэглэгчийг төөрөгдүүлнэ. Тиймээс байрлал
      // гарсан тохиолдолд л асаалттай гэж тооцно.
      setSharingState(true)
      const coords = await locate()
      const on = coords !== null
      if (!on) setSharingState(false)
      await AsyncStorage.setItem(STORAGE_KEY, on ? "on" : "off")
    },
    [locate],
  )

  // Нэвтэрсэн хэрэглэгч бүрээс НЭГ л удаа асууна. Хадгалсан сонголттой
  // бол огт асуухгүй — зөвхөн асаалттай үед байрлалыг чимээгүй тогтооно.
  const askedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!loaded) return

    const uid = session?.user.id ?? null
    if (!uid) {
      // Гарсны дараа өмнөх эзний байршил дэлгэцэн дээр үлдэхгүй.
      askedFor.current = null
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMyLocation(null)
      setPermission("pending")
      return
    }

    if (askedFor.current === uid) return
    askedFor.current = uid

    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      // Анх удаа: нэг удаа асууж, хариуг нь сонголт болгон хадгална.
      if (saved !== "on" && saved !== "off") {
        void locate().then((coords) => {
          const on = coords !== null
          setSharingState(on)
          void AsyncStorage.setItem(STORAGE_KEY, on ? "on" : "off")
        })
        return
      }
      if (saved === "on") void locate()
    })
  }, [loaded, session, locate])

  // Артист: апп нээлттэй, зөвшөөрөлтэй, хуваалцалт асаалттай бол
  // байрлалаа тасралтгүй хянаж хэрэглэгчид рүү цацна.
  useEffect(() => {
    if (!isArtist || !businessId || !sharing || permission !== "granted") return

    let cancelled = false
    let watcher: Location.LocationSubscription | null = null
    let publisher: ReturnType<typeof createPublisher> | null = null
    let last: Fix | null = null

    void (async () => {
      const pub = createPublisher(ARTISTS_ROOM)
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: CFG.MIN_INTERVAL,
          distanceInterval: CFG.MIN_DIST,
        },
        (pos) => {
          const fix: ArtistFix = {
            id: businessId,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            acc: pos.coords.accuracy,
            spd: pos.coords.speed,
            t: Date.now(),
          }
          setMyLocation({ lat: fix.lat, lng: fix.lon })

          // Чичиргээ бүрийг цацвал сувгийг дэмий дүүргэнэ.
          if (!shouldSend(last, fix)) return
          last = fix
          void pub.send(fix)
        },
      )

      // Хянагч бэлдэж байх зуур эффект цуцлагдсан бол шууд хаана —
      // эс тэгвэл эзэнгүй хянагч ард үлдэж батарей иднэ.
      if (cancelled) {
        sub.remove()
        void pub.close()
        return
      }
      watcher = sub
      publisher = pub
    })()

    return () => {
      cancelled = true
      watcher?.remove()
      void publisher?.close()
    }
  }, [isArtist, businessId, sharing, permission])

  return (
    <LocationContext.Provider
      value={{ myLocation, permission, sharing, setSharing, refresh: locate }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useMyLocation() {
  return useContext(LocationContext)
}
