import { describe, expect, it } from "vitest"

import {
  buildDaySlots,
  minutesToLabel,
  timeToMinutes,
  ubToInstant,
  UB_OFFSET_MIN,
  weekdayIndex,
} from "@/lib/ub-time"

/**
 * Цагийн бүсийн тооцоо нь захиалгын урсгалын хамгийн эмзэг хэсэг:
 * буруу бол DB-ийн `validate_booking()` триггер захиалгыг татгалзана,
 * эсвэл бүр дор нь — буруу цагт захиалга орно.
 *
 * Тестүүд UTC бүсэд ажилладаг (vitest.config.ts) тул код нь төхөөрөмжийн
 * бүсийг ашиглаж байвал эндээс шууд илэрнэ.
 */

describe("ubToInstant", () => {
  it("УБ-ийн ханан цагийг UTC+8-аар бодит мөч рүү хөрвүүлнэ", () => {
    // 2026-08-31 14:00 УБ = 06:00 UTC.
    const at = ubToInstant(2026, 7, 31, 14 * 60)
    expect(at.toISOString()).toBe("2026-08-31T06:00:00.000Z")
  })

  it("шөнө дундаас өмнөх цагийг өмнөх өдөр рүү зөв гүйлгэнэ", () => {
    // 2026-08-31 00:00 УБ = 2026-08-30 16:00 UTC.
    const at = ubToInstant(2026, 7, 31, 0)
    expect(at.toISOString()).toBe("2026-08-30T16:00:00.000Z")
  })

  it("офсет нь зуны цагаас хамаарахгүй тогтмол", () => {
    const winter = ubToInstant(2026, 0, 15, 12 * 60)
    const summer = ubToInstant(2026, 6, 15, 12 * 60)
    expect(winter.getUTCHours()).toBe(summer.getUTCHours())
    expect(UB_OFFSET_MIN).toBe(480)
  })
})

describe("weekdayIndex", () => {
  it("Даваа = 0, Ням = 6 (business_hours-ийн дараалал)", () => {
    // 2026-08-31 бол Даваа гараг.
    expect(weekdayIndex(new Date(2026, 7, 31))).toBe(0)
    expect(weekdayIndex(new Date(2026, 8, 1))).toBe(1) // Мягмар
    expect(weekdayIndex(new Date(2026, 8, 6))).toBe(6) // Ням
  })
})

describe("timeToMinutes", () => {
  it("Postgres-ийн time болон HH:MM хоёуланг уншина", () => {
    expect(timeToMinutes("09:30:00")).toBe(570)
    expect(timeToMinutes("09:30")).toBe(570)
    expect(timeToMinutes("00:00")).toBe(0)
    expect(timeToMinutes("23:59")).toBe(1439)
  })

  it("буруу утгад null", () => {
    expect(timeToMinutes("")).toBeNull()
    expect(timeToMinutes("9:30")).toBeNull()
    expect(timeToMinutes("25:00")).toBeNull()
    expect(timeToMinutes("12:70")).toBeNull()
  })
})

describe("minutesToLabel", () => {
  it("хоёр оронтой болгож форматлана", () => {
    expect(minutesToLabel(0)).toBe("00:00")
    expect(minutesToLabel(570)).toBe("09:30")
    expect(minutesToLabel(1200)).toBe("20:00")
  })
})

describe("buildDaySlots", () => {
  const date = new Date(2026, 7, 31) // Даваа
  const spec = { step: 60, capacity: 1 }
  const empty = new Map<number, number>()

  it("нээх цагаас хаах цаг хүртэл нүд үүсгэнэ, хаах цагийг оруулахгүй", () => {
    const { slots } = buildDaySlots(
      date,
      { open: "09:00", close: "12:00", isClosed: false },
      spec,
      empty,
      null,
    )
    expect(slots.map((s) => s.label)).toEqual(["09:00", "10:00", "11:00"])
  })

  it("цагийн нүд нь НЭЭХ ЦАГААС тоологдоно (шөнө дундаас биш)", () => {
    // 09:30-д нээдэг бизнесийн цагууд 09:30, 10:30 байх ёстой —
    // 10:00, 11:00 биш. DB-ийн триггер яг ижил дүрэмтэй.
    const { slots } = buildDaySlots(
      date,
      { open: "09:30", close: "12:00", isClosed: false },
      spec,
      empty,
      null,
    )
    expect(slots.map((s) => s.label)).toEqual(["09:30", "10:30", "11:30"])
  })

  it("30 минутын алхмыг дэмжинэ", () => {
    const { slots } = buildDaySlots(
      date,
      { open: "09:00", close: "11:00", isClosed: false },
      { step: 30, capacity: 1 },
      empty,
      null,
    )
    expect(slots.map((s) => s.label)).toEqual(["09:00", "09:30", "10:00", "10:30"])
  })

  it("амарч байгаа өдөрт цаг гаргахгүй", () => {
    const { closed, slots } = buildDaySlots(
      date,
      { open: "09:00", close: "20:00", isClosed: true },
      spec,
      empty,
      null,
    )
    expect(closed).toBe(true)
    expect(slots).toEqual([])
  })

  it("ажлын цаг бүртгээгүй бол хуурамч цаг зохиохгүй", () => {
    expect(buildDaySlots(date, undefined, spec, empty, null).slots).toEqual([])
    expect(
      buildDaySlots(date, { open: null, close: null, isClosed: false }, spec, empty, null).slots,
    ).toEqual([])
  })

  it("хаах цаг нээх цагаас өмнө байвал хоосон", () => {
    const { slots } = buildDaySlots(
      date,
      { open: "20:00", close: "09:00", isClosed: false },
      spec,
      empty,
      null,
    )
    expect(slots).toEqual([])
  })

  it("багтаамж дүүрсэн цагийг full гэж тэмдэглэнэ", () => {
    const taken = new Map([[ubToInstant(2026, 7, 31, 10 * 60).getTime(), 2]])
    const { slots } = buildDaySlots(
      date,
      { open: "09:00", close: "12:00", isClosed: false },
      { step: 60, capacity: 2 },
      taken,
      null,
    )
    expect(slots.find((s) => s.label === "10:00")?.full).toBe(true)
    expect(slots.find((s) => s.label === "09:00")?.full).toBe(false)
  })

  it("багтаамжаас доогуур захиалга нь цагийг хаахгүй", () => {
    const taken = new Map([[ubToInstant(2026, 7, 31, 10 * 60).getTime(), 1]])
    const { slots } = buildDaySlots(
      date,
      { open: "09:00", close: "12:00", isClosed: false },
      { step: 60, capacity: 2 },
      taken,
      null,
    )
    expect(slots.find((s) => s.label === "10:00")?.full).toBe(false)
  })

  it("өнөөдрийн өнгөрсөн цагийг санал болгохгүй", () => {
    const { slots } = buildDaySlots(
      date,
      { open: "09:00", close: "13:00", isClosed: false },
      spec,
      empty,
      10 * 60 + 15, // одоо 10:15
    )
    expect(slots.map((s) => s.label)).toEqual(["11:00", "12:00"])
  })

  it("үүсгэсэн мөч нь УБ-ийн цагтай таарна", () => {
    const { slots } = buildDaySlots(
      date,
      { open: "14:00", close: "15:00", isClosed: false },
      spec,
      empty,
      null,
    )
    expect(slots[0].at.toISOString()).toBe("2026-08-31T06:00:00.000Z")
  })
})
