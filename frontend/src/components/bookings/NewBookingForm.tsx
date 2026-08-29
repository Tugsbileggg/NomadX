import Link from "next/link";

import { Panel } from "@/components/admin/kit";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { createGuestBooking } from "@/lib/bookings/actions";
import type { OwnerDay } from "@/lib/bookings/slots";
import { cn } from "@/lib/cn";

const INPUT =
  "h-10 w-full rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary";

/**
 * Панелаас захиалга бүртгэх маягт — утсаар залгасан, ирсэн газраасаа
 * захиалсан хүнд (0019-ийн зочны захиалга).
 *
 * Өдрийн сонголт хаягаар (`?date=`) явдаг тул цагийн жагсаалт сервер дээр
 * үүсч, дүүрсэн цаг шууд хаалттай гарна.
 */
export function NewBookingForm({ day, basePath }: { day: OwnerDay; basePath: string }) {
  const free = day.slots.filter((s) => !s.full);

  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <Panel title="Өдөр сонгох">
        <form method="get" action={basePath} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">Огноо</span>
            <input type="date" name="date" defaultValue={day.dateKey} className={`${INPUT} w-48`} />
          </label>
          <button
            type="submit"
            className="h-10 rounded-full border border-surface-variant bg-white px-5 text-xs font-medium text-body hover:bg-surface-tint"
          >
            Цагийг харах
          </button>
        </form>
      </Panel>

      {day.closed ? (
        <Panel>
          <p className="py-8 text-center text-sm text-muted">
            Энэ өдөр амарна гэж тэмдэглэсэн байна.{" "}
            <Link href="/business/availability" className="text-primary hover:underline">
              Хуваарь
            </Link>{" "}
            хуудаснаас өөрчилж болно.
          </p>
        </Panel>
      ) : free.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-sm text-muted">
            {day.slots.length === 0
              ? "Энэ өдөрт ажлын цаг тохируулаагүй байна."
              : "Энэ өдрийн бүх цаг дүүрсэн байна."}
          </p>
        </Panel>
      ) : (
        <ActionForm action={createGuestBooking} className="flex flex-col gap-6">
          <Panel title="Цаг сонгох">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {day.slots.map((slot, i) => (
                <label
                  key={slot.at}
                  className={cn(
                    "flex h-10 cursor-pointer items-center justify-center rounded-lg text-xs font-medium",
                    slot.full
                      ? "cursor-not-allowed bg-surface-tint text-muted line-through"
                      : "bg-surface-tint text-ink hover:bg-surface-variant has-checked:bg-primary has-checked:text-white",
                  )}
                >
                  <input
                    type="radio"
                    name="scheduled_at"
                    value={slot.at}
                    disabled={slot.full}
                    required
                    defaultChecked={!slot.full && i === day.slots.findIndex((s) => !s.full)}
                    className="sr-only"
                  />
                  {slot.label}
                </label>
              ))}
            </div>
          </Panel>

          <Panel title="Үйлчлүүлэгчийн мэдээлэл">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted">Нэр *</span>
                  <input type="text" name="guest_name" required className={INPUT} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted">Утас</span>
                  <input type="tel" name="guest_phone" className={INPUT} />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">Юу хийлгэх вэ?</span>
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Жишээ: үс засалт, будалт"
                  className="w-full rounded-lg bg-surface-tint p-3 text-sm text-ink focus:outline-2 focus:outline-primary"
                />
              </label>

              <p className="text-xs leading-4 text-muted">
                Апп суулгаагүй үйлчлүүлэгчид зориулав. Ийм захиалга шууд
                «Баталгаажсан» төлөвтэй бүртгэгдэх бөгөөд «Харилцагчид» жагсаалтад
                орохгүй — давтан ирснийг нь тоолох бүртгэл байхгүй.
              </p>

              <SubmitButton
                className="h-10 self-start rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-dark"
                pendingLabel="Бүртгэж байна..."
              >
                Захиалга бүртгэх
              </SubmitButton>
            </div>
          </Panel>
        </ActionForm>
      )}
    </div>
  );
}
