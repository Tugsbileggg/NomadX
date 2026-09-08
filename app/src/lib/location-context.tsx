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

import { useAuth } from "@/lib/auth-context"

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
  /**
   * Байршлыг дахин тогтооно — "миний байршил" товч, эсвэл татгалзсаны
   * дараа хэрэглэгч бодлоо өөрчилсөн тохиолдолд.
   */
  refresh: () => Promise<Coords | null>
}

const LocationContext = createContext<LocationState>({
  myLocation: null,
  permission: "pending",
  refresh: async () => null,
})

/**
 * Нэвтэрсэн даруйд байршлын зөвшөөрөл асууж, үр дүнг апп даяар хуваалцана.
 *
 * Хэрэглэгч ба артист хоёрын аль алинд нь ажиллана — энэ provider нь эрхээр
 * салаалахаас ДЭЭР байрлана. Ингэснээр газрын зураг нээх үед зөвшөөрөл
 * хүлээхгүй, шууд өөрийн байршил дээр төвлөрч чадна.
 *
 * Байршлыг context-д хадгалснаар дэлгэц бүр тусад нь асуухаа больж,
 * зөвшөөрлийн харилцах цонх нэг л удаа гарна.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [myLocation, setMyLocation] = useState<Coords | null>(null)
  const [permission, setPermission] = useState<LocationPermission>("pending")

  const refresh = useCallback(async () => {
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

  // Нэвтэрсэн хэрэглэгч бүрд нэг л удаа асууна — токен сэргээх бүрд
  // зөвшөөрлийн цонх дахин гарвал хэрэглэгчийг залхаана (push бүртгэлтэй
  // яг ижил шалтгаан).
  const askedFor = useRef<string | null>(null)

  useEffect(() => {
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
    void refresh()
  }, [session, refresh])

  return (
    <LocationContext.Provider value={{ myLocation, permission, refresh }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useMyLocation() {
  return useContext(LocationContext)
}
