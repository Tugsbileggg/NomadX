/**
 * "Төлбөр амжилттай төлөгдлөө" цонхыг дуудах суваг.
 *
 * Цонх нь root layout дээр НЭГ л удаа холбогдсон байдаг тул түүнийг
 * ямар ч дэлгэцээс дуудахын тулд дундын суваг хэрэгтэй. `notifications.ts`
 * дахь `onNotification` -тэй яг ижил хэлбэр — тэр загварыг давтав.
 *
 * Хоёр эх сурвалжтай:
 *   1. Төлсөн ХҮН өөрөө — товч дарсан агшинд шууд (энд).
 *   2. НӨГӨӨ ТАЛ — DB-ийн `invoice_paid` мэдэгдлээр (0027), Realtime-аар.
 *
 * Эхнийхийг мэдэгдлээр хийж болохгүй: 0020-ийн зарчмаар өөрийн хийсэн
 * үйлдлийг өөрт нь мэдэгддэггүй бөгөөд Realtime-ийн саатал нь товч
 * дарсны дараах хариуг удаашруулна.
 *
 * ⚠️ Бодит гүйлгээ хийгддэггүй (0011, 0023) — цонх нь зөвхөн
 * тэмдэглэгээ хийгдсэнийг харуулна.
 */
export type PaymentNotice = {
  /** Гарчгийн доорх мөр: "Нэрс · 45,000₮" маягийн товч тайлбар. */
  detail: string | null
}

type Listener = (notice: PaymentNotice) => void
const listeners = new Set<Listener>()

/** Цонх нээх хүсэлт ирэхэд дуудагдана. Салгах функц буцаана. */
export function onPaymentNotice(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Цонхыг нээнэ. Хэн ч сонсоогүй бол чимээгүй өнгөрнө. */
export function showPaymentNotice(notice: PaymentNotice): void {
  for (const fn of listeners) fn(notice)
}
