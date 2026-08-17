"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createPublisher,
  shouldSend,
  type Fix,
} from "@/lib/live-location";

type Publisher = ReturnType<typeof createPublisher>;

export function ShareForm({ initialRoom }: { initialRoom: string }) {
  const [room, setRoom] = useState(initialRoom);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState("Байршил хуваалцаагүй байна");
  const [fix, setFix] = useState<Fix | null>(null);
  const [sent, setSent] = useState(0);

  const watchId = useRef<number | null>(null);
  const publisher = useRef<Publisher | null>(null);
  const lastSent = useRef<Fix | null>(null);

  /** Зөвхөн нөөцийг чөлөөлнө — төлөв хөндөхгүй (unmount дээр ч дуудагдана). */
  const teardown = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    publisher.current?.close();
    publisher.current = null;
    lastSent.current = null;
  }, []);

  const stop = useCallback(
    (reason?: string) => {
      teardown();
      setLive(false);
      setStatus(reason ?? "Зогслоо");
    },
    [teardown],
  );

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setStatus("Энэ хөтөч байршил дэмжихгүй байна");
      return;
    }
    if (!window.isSecureContext) {
      setStatus("HTTPS шаардлагатай — http дээр хөтөч GPS асуухгүй");
      return;
    }

    try {
      setStatus("Realtime суваг нээж байна…");
      const pub = createPublisher(room.trim().toUpperCase() || "UB-1024");
      publisher.current = pub;
      await pub.joined;

      setStatus("Байршлын зөвшөөрөл хүсэж байна…");
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const next: Fix = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            acc: position.coords.accuracy,
            spd: position.coords.speed,
            t: Date.now(),
          };
          setFix(next);
          setLive(true);
          setStatus(`Хуваалцаж байна · өрөө ${room.trim().toUpperCase()}`);

          if (!shouldSend(lastSent.current, next)) return;
          lastSent.current = next;
          pub
            .send(next)
            .then(() => setSent((n) => n + 1))
            .catch((error: Error) =>
              setStatus(`Илгээх алдаа: ${error.message}`),
            );
        },
        (error) => {
          stop(
            error.code === error.PERMISSION_DENIED
              ? "Байршлын зөвшөөрөл өгөөгүй байна"
              : `GPS алдаа: ${error.message}`,
          );
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
      );
    } catch (error) {
      stop(`Алдаа: ${(error as Error).message}`);
    }
  }, [room, stop]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
          Өрөөний код
        </span>
        <input
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          disabled={live}
          className="h-12 rounded-xl border border-outline bg-white px-4 text-ink outline-none focus:border-primary disabled:opacity-60"
        />
      </label>

      <button
        type="button"
        onClick={() => (live ? stop() : void start())}
        className={`h-14 rounded-full text-base font-semibold text-white ${
          live ? "bg-danger" : "bg-primary"
        }`}
      >
        {live ? "Зогсоох" : "Байршил хуваалцаж эхлэх"}
      </button>

      <p className="flex items-center gap-2 text-sm text-body">
        <span
          className={`size-2.5 shrink-0 rounded-full ${
            live ? "animate-pulse bg-success" : "bg-outline"
          }`}
        />
        {status}
      </p>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Өргөрөг" value={fix ? fix.lat.toFixed(6) : "—"} />
        <Stat label="Уртраг" value={fix ? fix.lon.toFixed(6) : "—"} />
        <Stat
          label="Нарийвчлал"
          value={fix?.acc != null ? `±${Math.round(fix.acc)} м` : "—"}
        />
        <Stat label="Илгээсэн" value={String(sent)} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}
