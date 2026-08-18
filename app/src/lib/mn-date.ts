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
