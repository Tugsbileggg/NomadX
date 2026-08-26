/**
 * `toLocaleDateString("mn-MN", …)` энэ орчинд бүрэн дэмжигдэхгүй (англи
 * нэрээр буцаадаг) тул огноо/цагийг гараар Монгол хэлээр форматлана.
 */
const WEEKDAYS_SHORT = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"]

export function mnWeekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()]
}

export function mnDateLabel(d: Date): string {
  return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

export function mnTimeLabel(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/** "саяхан", "3 цагийн өмнө", "2 өдрийн өмнө" — сэтгэгдлийн огноонд. */
export function mnTimeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return "саяхан"
  if (minutes < 60) return `${minutes} минутын өмнө`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} цагийн өмнө`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} өдрийн өмнө`
  if (days < 31) return `${Math.floor(days / 7)} долоо хоногийн өмнө`
  if (days < 365) return `${Math.floor(days / 30)} сарын өмнө`
  return `${Math.floor(days / 365)} жилийн өмнө`
}
