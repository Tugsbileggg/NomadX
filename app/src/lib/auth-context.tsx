import type { Session } from "@supabase/supabase-js"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { fetchAccount, type Account } from "@/lib/account"
import { registerForPush, unregisterFromPush } from "@/lib/push"
import { supabase } from "@/lib/supabase"

type AuthState = {
  session: Session | null
  loading: boolean
  /** Нууц үг сэргээх кодоор баталгаажуулсны дараа Supabase-с ирдэг тусгай төлөв. */
  passwordRecovery: boolean
  clearPasswordRecovery: () => void
  /** Эрх, бизнесийн төлөв — нэвтрээгүй эсвэл ачаалж дуусаагүй бол null. */
  account: Account | null
  /**
   * Профайл татаж дууссан эсэх.
   *
   * Үүнийг хүлээхгүй бол чиглүүлэлт эхлээд буруу бүлэг рүү орж, дараа нь
   * үсэрч засагдана — артист харилцагчийн дэлгэцийг хэсэг зуур харна.
   */
  accountReady: boolean
  /** Бүртгэлийн алхам дууссаны дараа төлвийг дахин татна. */
  refreshAccount: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  passwordRecovery: false,
  clearPasswordRecovery: () => {},
  account: null,
  accountReady: false,
  refreshAccount: async () => {},
})

/** Нэвтэрсэн эсэхийг бүх апп даяар мэдэгддэг болгоно (Stack.Protected-д ашиглана). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [accountReady, setAccountReady] = useState(false)

  // Дараалан ирсэн хүсэлтийн хуучин хариу шинийг дарж бичихээс сэргийлнэ
  // (жишээ нь хурдан гарч, өөр акаунтаар нэвтрэх үед).
  const requestRef = useRef(0)

  const load = useCallback(async (hasSession: boolean) => {
    const id = ++requestRef.current
    if (!hasSession) {
      setAccount(null)
      setAccountReady(true)
      return
    }

    setAccountReady(false)
    const next = await fetchAccount()
    if (id !== requestRef.current) return

    setAccount(next)
    setAccountReady(true)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      void load(Boolean(data.session))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true)
      // Токен сэргээх бүрд профайл дахин татах шаардлагагүй.
      if (event !== "TOKEN_REFRESHED") void load(Boolean(next))
    })

    return () => subscription.subscription.unsubscribe()
  }, [load])

  // Нэвтэрсэн хэрэглэгч бүрд нэг л удаа бүртгэнэ — token сэргээх бүрд
  // дахин дуудвал зөвшөөрлийн шалгалт, сүлжээний хүсэлт дэмий давтагдана.
  const pushedFor = useRef<string | null>(null)
  useEffect(() => {
    const uid = session?.user.id ?? null
    if (!uid || pushedFor.current === uid) return
    pushedFor.current = uid
    void registerForPush()
  }, [session])

  const refreshAccount = useCallback(async () => {
    await load(true)
  }, [load])

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        passwordRecovery,
        clearPasswordRecovery: () => setPasswordRecovery(false),
        account,
        accountReady,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Гарах.
 *
 * Дараалал чухал: `unregister_push_token()` нь `auth.uid()`-ээр эзнийг
 * тогтоодог тул сешнийг хаасны ДАРАА дуудвал юу ч устгахгүй бөгөөд
 * энэ утас өмнөх эзнийхээ мэдэгдлийг хүлээж авсаар байна.
 */
export async function signOut() {
  await unregisterFromPush()
  await supabase.auth.signOut()
}
