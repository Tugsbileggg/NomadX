import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useColorScheme } from "react-native"

import { DarkBrand, LightBrand, type BrandPalette } from "@/constants/theme"

const STORAGE_KEY = "lumina-theme-preference"

export type ThemePreference = "system" | "light" | "dark"
export type Scheme = "light" | "dark"

type ThemeState = {
  /** Хэрэглэгчийн сонголт: систем дагах уу, эсвэл гар аргаар тогтмол уу. */
  preference: ThemePreference
  setPreference: (next: ThemePreference) => void
  /** Бодит хэрэгжиж буй горим (preference "system" бол утасны тохиргоог дагана). */
  scheme: Scheme
  colors: BrandPalette
  /**
   * Хадгалсан сонголт AsyncStorage-аас уншигдаж дууссан эсэх.
   *
   * Уншилт дуусахаас өмнө навигацийг mount хийвэл апп эхлээд буруу
   * горимоор зурагдаад дараа нь солигдож, эхний хормын зуур өнгө нь
   * анивчина. Тиймээс уншилт дуустал хүлээнэ.
   *
   * (Урьд нь энэ хүлээлт нь `NativeTabs`-ын алдаанаас ч бас хамгаалдаг
   * байсан — тэр цэс өнгө солигдоход товчнуудынхаа байрлалыг алддаг байв.
   * Цэсийг `FloatingTabBar`-аар сольсон тул тэр шалтгаан арилсан.)
   */
  ready: boolean
}

const ThemeContext = createContext<ThemeState>({
  preference: "system",
  setPreference: () => {},
  scheme: "light",
  colors: LightBrand,
  ready: false,
})

/** Утасны систем тохиргоог дагах эсвэл гараар сонгосон горимыг бүх апп даяар мэдэгддэг болгоно. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>("system")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setPreferenceState(saved)
        }
      })
      // Уншилт унасан ч аппыг хаах шалтгаан биш — анхны утгаараа үргэлжилнэ.
      .finally(() => setReady(true))
  }, [])

  function setPreference(next: ThemePreference) {
    setPreferenceState(next)
    AsyncStorage.setItem(STORAGE_KEY, next)
  }

  const scheme: Scheme = preference === "system" ? (systemScheme ?? "light") : preference
  const colors = scheme === "dark" ? DarkBrand : LightBrand

  return (
    <ThemeContext.Provider value={{ preference, setPreference, scheme, colors, ready }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  return useContext(ThemeContext)
}
