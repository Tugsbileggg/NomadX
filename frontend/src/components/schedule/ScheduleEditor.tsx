"use client";

import { useState } from "react";
import { CopyPlus } from "lucide-react";

import { Panel } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { saveSchedule } from "@/lib/schedule/actions";
import { SLOT_OPTIONS, WEEKDAY_LABELS, type OwnerSchedule } from "@/lib/schedule/types";

const INPUT =
  "h-10 rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary disabled:opacity-50";

type DayState = { open: string; close: string; isClosed: boolean };

/**
 * Долоо хоногийн ажлын цагийн засварлагч.
 *
 * Цагууд нь `bookings_validate` триггерийн шалгалтын үндэс болдог тул
 * энд хадгалсан зүйл шууд захиалгын боломжит цагуудыг тодорхойлно.
 */
export function ScheduleEditor({ schedule }: { schedule: OwnerSchedule }) {
  const [days, setDays] = useState<DayState[]>(
    schedule.days.map((d) => ({
      open: d.open ?? "09:00",
      close: d.close ?? "18:00",
      isClosed: d.isClosed,
    })),
  );

  function update(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  /** Даваагийн цагийг үлдсэн өдрүүдэд хуулна — амарах өдрийг хөндөхгүй. */
  function copyFromMonday() {
    setDays((prev) =>
      prev.map((d, i) =>
        i === 0 || d.isClosed ? d : { ...d, open: prev[0].open, close: prev[0].close },
      ),
    );
  }

  return (
    <ActionForm action={saveSchedule} className="flex flex-col gap-6">
      <Panel
        title="Долоо хоногийн ажлын цаг"
        action={
          <button
            type="button"
            onClick={copyFromMonday}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <CopyPlus className="size-3.5" />
            Даваагийн цагийг бүгдэд хуулах
          </button>
        }
      >
        <ul className="flex flex-col divide-y divide-surface-tint">
          {days.map((d, i) => (
            <li key={WEEKDAY_LABELS[i]} className="flex flex-wrap items-center gap-4 py-4">
              <span className="w-24 shrink-0 text-sm font-medium text-ink">
                {WEEKDAY_LABELS[i]}
              </span>

              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  name={`closed_${i}`}
                  checked={d.isClosed}
                  onChange={(e) => update(i, { isClosed: e.target.checked })}
                  className="size-4 accent-[var(--color-primary)]"
                />
                Амарна
              </label>

              {/* Идэвхгүй болсон талбар FormData-д ордоггүй тул амарах өдрийн
                  цагийг нуугдмал талбараар дамжуулна — дараа нээхэд хэвээрээ
                  байна. */}
              <span className="flex items-center gap-3">
                <input
                  type="time"
                  name={d.isClosed ? undefined : `open_${i}`}
                  value={d.open}
                  disabled={d.isClosed}
                  onChange={(e) => update(i, { open: e.target.value })}
                  aria-label={`${WEEKDAY_LABELS[i]} нээх цаг`}
                  className={INPUT}
                />
                <span className="text-body">–</span>
                <input
                  type="time"
                  name={d.isClosed ? undefined : `close_${i}`}
                  value={d.close}
                  disabled={d.isClosed}
                  onChange={(e) => update(i, { close: e.target.value })}
                  aria-label={`${WEEKDAY_LABELS[i]} хаах цаг`}
                  className={INPUT}
                />
                {d.isClosed && (
                  <>
                    <input type="hidden" name={`open_${i}`} value={d.open} />
                    <input type="hidden" name={`close_${i}`} value={d.close} />
                  </>
                )}
              </span>

              {d.isClosed && <span className="text-sm text-muted">Тухайн өдөр захиалга авахгүй.</span>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Захиалгын цагийн нүд">
        <div className="flex flex-wrap gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">Нэг цагийн урт</span>
            <select
              name="slot_minutes"
              defaultValue={schedule.slotMinutes}
              className={`${INPUT} w-40`}
            >
              {SLOT_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} минут
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">
              Үйлчлүүлэгчийн апп дээрх цагийн жагсаалт үүнээс үүснэ.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">Нэг цагт зэрэг үйлчлэх тоо</span>
            <input
              type="number"
              name="slot_capacity"
              min={1}
              max={50}
              required
              defaultValue={schedule.slotCapacity}
              className={`${INPUT} w-40`}
            />
            <span className="text-xs text-muted">
              Хэдэн мастер зэрэг ажилладгаас хамаарна. Дүүрсэн цагийг апп харуулахгүй.
            </span>
          </label>
        </div>
      </Panel>

      <div className="flex justify-end">
        <SubmitButton
          className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
          pendingLabel="Хадгалж байна..."
        >
          Хадгалах
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
