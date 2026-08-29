"use client";

import { useActionState } from "react";
import { cancelBookingByBusiness, completeBooking, confirmBooking } from "@/lib/bookings/actions";
import type { BookingStatus } from "@/lib/bookings/data";

/** Захиалгын мөр дэх төлөв солих товчнууд — эзний бизнест хамаарах захиалгад л ажиллана. */
export function BookingActions({
  bookingId,
  status,
  basePath,
}: {
  bookingId: string;
  status: BookingStatus;
  basePath: string;
}) {
  const [confirmState, confirm, confirming] = useActionState(confirmBooking, null);
  const [completeState, complete, completing] = useActionState(completeBooking, null);
  const [cancelState, cancel, cancelling] = useActionState(cancelBookingByBusiness, null);

  const error = confirmState?.error ?? completeState?.error ?? cancelState?.error;

  if (status !== "pending" && status !== "confirmed") {
    return <span className="text-xs text-muted">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-3">
        {status === "pending" && (
          <form action={confirm}>
            <input type="hidden" name="booking_id" value={bookingId} />
            <input type="hidden" name="base_path" value={basePath} />
            <button
              type="submit"
              disabled={confirming}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              Баталгаажуулах
            </button>
          </form>
        )}
        {status === "confirmed" && (
          <form action={complete}>
            <input type="hidden" name="booking_id" value={bookingId} />
            <input type="hidden" name="base_path" value={basePath} />
            <button
              type="submit"
              disabled={completing}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              Дуусгах
            </button>
          </form>
        )}
        <form action={cancel}>
          <input type="hidden" name="booking_id" value={bookingId} />
          <input type="hidden" name="base_path" value={basePath} />
          <button
            type="submit"
            disabled={cancelling}
            className="text-xs font-medium text-[#991b1b] hover:underline disabled:opacity-60"
          >
            Цуцлах
          </button>
        </form>
      </div>
      {error && <p className="text-xs text-[#991b1b]">{error}</p>}
    </div>
  );
}
