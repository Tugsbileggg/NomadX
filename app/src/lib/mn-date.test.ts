import { afterEach, describe, expect, it, vi } from "vitest"

import { mnDateLabel, mnTimeAgo, mnTimeLabel, mnWeekdayShort } from "@/lib/mn-date"

/**
 * `toLocaleDateString("mn-MN", …)` энэ орчинд ажилладаггүй (англи нэрээр
 * буцаадаг) тул эдгээрийг гараар бичсэн — түүнийг л энд барина.
 */

afterEach(() => {
  vi.useRealTimers()
})

describe("mnWeekdayShort", () => {
  it("гаригийг монголоор буцаана", () => {
    expect(mnWeekdayShort(new Date(2026, 7, 31))).toBe("Дав")
    expect(mnWeekdayShort(new Date(2026, 8, 6))).toBe("Ням")
  })
})

describe("mnDateLabel / mnTimeLabel", () => {
  it("сар, өдрийг монголоор", () => {
    expect(mnDateLabel(new Date(2026, 7, 31))).toBe("8-р сарын 31")
  })

  it("цагийг хоёр оронтой", () => {
    expect(mnTimeLabel(new Date(2026, 7, 31, 9, 5))).toBe("09:05")
    expect(mnTimeLabel(new Date(2026, 7, 31, 20, 0))).toBe("20:00")
  })
})

describe("mnTimeAgo", () => {
  /** Тогтмол "одоо" — заагийн утгуудыг найдвартай шалгахын тулд. */
  const now = new Date("2026-08-31T12:00:00.000Z")
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

  const MIN = 60_000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR

  it("заагийн утгуудыг зөв шилжүүлнэ", () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    expect(mnTimeAgo(ago(30_000))).toBe("саяхан")
    expect(mnTimeAgo(ago(5 * MIN))).toBe("5 минутын өмнө")
    expect(mnTimeAgo(ago(59 * MIN))).toBe("59 минутын өмнө")
    expect(mnTimeAgo(ago(HOUR))).toBe("1 цагийн өмнө")
    expect(mnTimeAgo(ago(23 * HOUR))).toBe("23 цагийн өмнө")
    expect(mnTimeAgo(ago(DAY))).toBe("1 өдрийн өмнө")
    expect(mnTimeAgo(ago(6 * DAY))).toBe("6 өдрийн өмнө")
    expect(mnTimeAgo(ago(7 * DAY))).toBe("1 долоо хоногийн өмнө")
    expect(mnTimeAgo(ago(30 * DAY))).toBe("4 долоо хоногийн өмнө")
    expect(mnTimeAgo(ago(60 * DAY))).toBe("2 сарын өмнө")
    expect(mnTimeAgo(ago(400 * DAY))).toBe("1 жилийн өмнө")
  })

  it("ирээдүйн огноог 'саяхан' гэж үзнэ", () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    expect(mnTimeAgo(new Date(now.getTime() + HOUR).toISOString())).toBe("саяхан")
  })
})
