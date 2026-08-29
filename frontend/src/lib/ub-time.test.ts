import { describe, expect, it } from "vitest";

import {
  buildOwnerSlots,
  dateKey,
  minutesToLabel,
  timeToMinutes,
  ubToInstant,
  UB_OFFSET_MIN,
  weekdayIndex,
} from "@/lib/ub-time";

/**
 * Панелийн цагийн тооцоо нь `app/src/lib/ub-time.ts`-тэй ЯГ ижил дүрэмтэй
 * байх ёстой — хоёр талын цаг зөрвөл үйлчлүүлэгч аппаас сонгосон цаг нь
 * панелийн жагсаалтад өөр цагт харагдана.
 *
 * Тестүүд UTC бүсэд ажиллана (Vercel ч мөн адил) тул код нь серверийн
 * цагийн бүсийг ашиглаж байвал эндээс шууд илэрнэ.
 */

describe("ubToInstant", () => {
  it("УБ-ийн ханан цагийг UTC+8-аар бодит мөч рүү хөрвүүлнэ", () => {
    expect(ubToInstant(2026, 7, 31, 14 * 60).toISOString()).toBe("2026-08-31T06:00:00.000Z");
  });

  it("шөнө дундыг өмнөх өдөр рүү зөв гүйлгэнэ", () => {
    expect(ubToInstant(2026, 7, 31, 0).toISOString()).toBe("2026-08-30T16:00:00.000Z");
  });

  it("офсет тогтмол — зуны цаг байхгүй", () => {
    expect(UB_OFFSET_MIN).toBe(480);
    expect(ubToInstant(2026, 0, 15, 720).getUTCHours()).toBe(
      ubToInstant(2026, 6, 15, 720).getUTCHours(),
    );
  });
});

describe("dateKey / weekdayIndex", () => {
  it("YYYY-MM-DD хэлбэрт хөрвүүлнэ", () => {
    expect(dateKey(new Date(2026, 7, 5))).toBe("2026-08-05");
    expect(dateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("Даваа = 0, Ням = 6", () => {
    expect(weekdayIndex(new Date(2026, 7, 31))).toBe(0);
    expect(weekdayIndex(new Date(2026, 8, 6))).toBe(6);
  });
});

describe("timeToMinutes / minutesToLabel", () => {
  it("Postgres-ийн time-ыг уншина", () => {
    expect(timeToMinutes("09:30:00")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("буруу утгад null", () => {
    expect(timeToMinutes("25:00")).toBeNull();
    expect(timeToMinutes("12:70")).toBeNull();
    expect(timeToMinutes("9:30")).toBeNull();
  });

  it("буцаан хөрвүүлнэ", () => {
    expect(minutesToLabel(570)).toBe("09:30");
    expect(minutesToLabel(0)).toBe("00:00");
  });
});

describe("buildOwnerSlots", () => {
  const spec = { step: 60, capacity: 1 };
  const empty = new Map<number, number>();
  const open = (o: string, c: string) => ({ open: o, close: c, isClosed: false });

  it("нээхээс хаах хүртэл, хаах цагийг оруулахгүй", () => {
    const { slots } = buildOwnerSlots(2026, 7, 31, open("09:00", "12:00"), spec, empty);
    expect(slots.map((s) => s.label)).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("цагийн нүд нь нээх цагаас тоологдоно", () => {
    const { slots } = buildOwnerSlots(2026, 7, 31, open("09:30", "12:00"), spec, empty);
    expect(slots.map((s) => s.label)).toEqual(["09:30", "10:30", "11:30"]);
  });

  it("амарч байгаа өдөрт цаг гаргахгүй", () => {
    const { closed, slots } = buildOwnerSlots(
      2026, 7, 31,
      { open: "09:00", close: "20:00", isClosed: true },
      spec, empty,
    );
    expect(closed).toBe(true);
    expect(slots).toEqual([]);
  });

  it("ажлын цаггүй бол хоосон", () => {
    expect(buildOwnerSlots(2026, 7, 31, null, spec, empty).slots).toEqual([]);
    expect(buildOwnerSlots(2026, 7, 31, undefined, spec, empty).slots).toEqual([]);
  });

  it("багтаамж дүүрсэн цагийг тэмдэглэнэ", () => {
    const taken = new Map([[ubToInstant(2026, 7, 31, 600).getTime(), 4]]);
    const { slots } = buildOwnerSlots(
      2026, 7, 31, open("09:00", "12:00"), { step: 60, capacity: 4 }, taken,
    );
    expect(slots.find((s) => s.label === "10:00")?.full).toBe(true);
    expect(slots.find((s) => s.label === "11:00")?.full).toBe(false);
  });

  it("панелаас өнгөрсөн цагийг ч сонгож болно (эргэн бүртгэх)", () => {
    // Аппаас ялгаатай нь энд одоогийн цагаар шүүхгүй.
    const { slots } = buildOwnerSlots(2020, 0, 1, open("09:00", "11:00"), spec, empty);
    expect(slots.map((s) => s.label)).toEqual(["09:00", "10:00"]);
  });

  it("ISO мөр нь УБ-ийн цагтай таарна", () => {
    const { slots } = buildOwnerSlots(2026, 7, 31, open("14:00", "15:00"), spec, empty);
    expect(slots[0].at).toBe("2026-08-31T06:00:00.000Z");
  });
});
