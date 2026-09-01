import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

import { supabase } from "@/lib/supabase"

/**
 * Утас руу түлхэх (push) мэдэгдэл.
 *
 * Урсгал: апп token авна → `register_push_token()` (0021) -оор DB-д
 * бүртгэнэ → `notifications`-д мөр орох бүрд DB-ийн триггер Expo Push
 * рүү илгээнэ. Илгээх тал бүхэлдээ өгөгдлийн сан дээр байгаа тул
 * клиент ямар мэдэгдэл түлхэхийг мэдэх шаардлагагүй.
 *
 * ⚠️ Хоёр зүйл заавал:
 *
 * 1. Expo Go дээр АЖИЛЛАХГҮЙ. SDK 53-аас хойш remote push нь Expo Go-д
 *    дэмжигдэхээ больсон — dev build (`eas build --profile development`)
 *    хэрэгтэй. Симулятор дээр ч ажиллахгүй (`Device.isDevice`).
 * 2. `projectId` шаардлагатай. `app.json`-ы `extra.eas.projectId`-аас
 *    уншина; төсөл EAS-т холбогдоогүй бол тэр талбар байхгүй тул token
 *    авах боломжгүй. `eas init` ажиллуулж холбоно.
 */

// Вэб дээр remote push байхгүй бөгөөд Expo Router нь SSR хийдэг тул
// модулийн түвшинд handler тохируулбал node дээр унах эрсдэлтэй.
if (Platform.OS !== "web") {
  /** Foreground үед мэдэгдлийг хэрхэн харуулах. */
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      // Хонхны тоог DB-ийн уншаагүй тоогоор барьдаг тул OS-ийн badge-ийг
      // энд хөндөхгүй — хоёр тоо зөрөх нь эргэлзээ төрүүлнэ.
      shouldSetBadge: false,
    }),
  })
}

/** Яагаад бүртгэгдээгүйг дуудагч талд ойлгомжтой хэлнэ. */
export type PushRegistration =
  | { ok: true; token: string }
  | { ok: false; reason: "web" | "simulator" | "denied" | "no-project-id" | "failed" }

function projectId(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId
  const fromEas = Constants.easConfig?.projectId
  return (typeof fromExtra === "string" && fromExtra) || (typeof fromEas === "string" && fromEas) || null
}

/**
 * Зөвшөөрөл асууж, token-оо DB-д бүртгэнэ.
 *
 * Нэвтэрсэн хойно дуудна — `register_push_token()` нь `auth.uid()`-ээр
 * эзнийг тогтоодог тул сешнгүй үед чимээгүй буцна.
 */
export async function registerForPush(): Promise<PushRegistration> {
  if (Platform.OS === "web") return { ok: false, reason: "web" }
  // Симулятор/эмулятор дээр remote push байхгүй.
  if (!Device.isDevice) return { ok: false, reason: "simulator" }

  // Android дээр суваг байхгүй бол мэдэгдэл чимээгүй, ач холбогдолгүй
  // болж ирдэг — token авахаас өмнө үүсгэнэ.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Мэдэгдэл",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const existing = await Notifications.getPermissionsAsync()
  const settings = existing.granted ? existing : await Notifications.requestPermissionsAsync()
  if (!settings.granted) return { ok: false, reason: "denied" }

  const id = projectId()
  if (!id) return { ok: false, reason: "no-project-id" }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id })
    const { error } = await supabase.rpc("register_push_token", {
      p_token: token,
      p_platform: Platform.OS,
    })
    return error ? { ok: false, reason: "failed" } : { ok: true, token }
  } catch {
    return { ok: false, reason: "failed" }
  }
}

/**
 * Гарахын өмнө энэ төхөөрөмжийг салгана — үгүй бол дараагийн хэрэглэгч
 * өмнөхийнх нь мэдэгдлийг хүлээж авна.
 */
export async function unregisterFromPush(): Promise<void> {
  const id = projectId()
  if (Platform.OS === "web" || !Device.isDevice || !id) return

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id })
    await supabase.rpc("unregister_push_token", { p_token: token })
  } catch {
    // Token авч чадаагүй бол салгах юм ч алга.
  }
}
