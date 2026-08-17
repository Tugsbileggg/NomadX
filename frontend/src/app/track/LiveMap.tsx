"use client";

import type * as L from "leaflet";
import { useEffect, useRef, useState } from "react";

import {
  CFG,
  UB,
  metersBetween,
  subscribeToRoom,
  type Fix,
  type SubscribeState,
} from "@/lib/live-location";

const PIN_COLOR = "#8a4853";

export function LiveMap({ initialRoom }: { initialRoom: string }) {
  const [room, setRoom] = useState(initialRoom);
  const [joined, setJoined] = useState(initialRoom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
            Өрөөний код
          </span>
          <input
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            className="h-11 w-48 rounded-xl border border-outline bg-white px-4 text-ink outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => setJoined(room.trim().toUpperCase() || "UB-1024")}
          className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-white"
        >
          Холбогдох
        </button>
      </div>

      {/* Өрөө солигдоход key нь панелийг бүхэлд нь дахин үүсгэнэ —
          ингэснээр хуучин цэг, мөр, marker цэвэрлэгдэнэ. */}
      <MapPanel key={joined} room={joined} />
    </div>
  );
}

function MapPanel({ room }: { room: string }) {
  const [state, setState] = useState<SubscribeState>("connecting");
  const [fix, setFix] = useState<Fix | null>(null);
  const [count, setCount] = useState(0);
  const [now, setNow] = useState(0);

  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const halo = useRef<L.Circle | null>(null);
  const trail = useRef<L.Polyline | null>(null);
  const follow = useRef(true);

  // Газрын зураг — Leaflet нь window шаарддаг тул зөвхөн клиент дээр.
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    void (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !holder.current || map.current) return;

      const instance = leaflet.map(holder.current).setView(UB, 13);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        })
        .addTo(instance);

      trail.current = leaflet
        .polyline([], { color: PIN_COLOR, weight: 3, opacity: 0.6 })
        .addTo(instance);

      // Хэрэглэгч зургийг чирвэл автомат дагахыг зогсооно.
      instance.on("dragstart", () => {
        follow.current = false;
      });

      // Контейнерын хэмжээ хожим тогтдог тул Leaflet-д дахин хэмжүүлнэ,
      // эс тэгвэл tile-ууд хэсэгчлэн ачаалагдана.
      observer = new ResizeObserver(() => instance.invalidateSize());
      observer.observe(holder.current);

      map.current = instance;
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(
    () =>
      subscribeToRoom(
        room,
        (next) => {
          setFix(next);
          setCount((n) => n + 1);
        },
        setState,
      ),
    [room],
  );

  // Шинэ цэгийг зураг дээр буулгах
  useEffect(() => {
    if (!fix || !map.current) return;

    void (async () => {
      const leaflet = (await import("leaflet")).default;
      const instance = map.current;
      if (!instance) return;

      const point: [number, number] = [fix.lat, fix.lon];

      if (!marker.current) {
        marker.current = leaflet
          .marker(point, {
            icon: leaflet.divIcon({
              className: "",
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              html: `<span style="display:block;width:20px;height:20px;border-radius:50%;background:${PIN_COLOR};border:3px solid #fff;box-shadow:0 2px 10px rgba(138,72,83,.5)"></span>`,
            }),
          })
          .addTo(instance);
        instance.setView(point, 16);
      } else {
        marker.current.setLatLng(point);
      }

      if (fix.acc != null) {
        if (!halo.current) {
          halo.current = leaflet
            .circle(point, {
              radius: fix.acc,
              color: PIN_COLOR,
              weight: 1,
              fillColor: PIN_COLOR,
              fillOpacity: 0.1,
            })
            .addTo(instance);
        } else {
          halo.current.setLatLng(point);
          halo.current.setRadius(fix.acc);
        }
      }

      const line = trail.current;
      if (line) {
        const points = line.getLatLngs() as L.LatLng[];
        const last = points.at(-1);
        // Чичиргээг шүүнэ — 3м-ээс бага бол мөр нэмэхгүй.
        if (!last || metersBetween([last.lat, last.lng], point) > 3) {
          line.addLatLng(point);
          if (points.length > 300) line.setLatLngs(points.slice(-300));
        }
      }

      if (follow.current) instance.panTo(point, { animate: true });
    })();
  }, [fix]);

  // "хэдэн секундын өмнө"-г шинэчлэх цаг
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const age = fix && now ? now - fix.t : null;
  const stale = age != null && age > CFG.STALE;
  const label =
    state === "error"
      ? "Realtime холбогдож чадсангүй"
      : !fix
        ? state === "live"
          ? "Дохио хүлээж байна…"
          : "Холбогдож байна…"
        : stale
          ? "Дохио тасарсан"
          : "Амьд";

  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center justify-end gap-2 text-sm">
        <span
          className={`size-2.5 rounded-full ${
            state === "error" || stale
              ? "bg-danger"
              : fix
                ? "animate-pulse bg-success"
                : "bg-outline"
          }`}
        />
        {label}
      </span>

      <div
        ref={holder}
        className="h-[540px] w-full overflow-hidden rounded-2xl border border-outline bg-surface-tint"
      />

      <dl className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Өрөө" value={room} />
        <Stat label="Өргөрөг" value={fix ? fix.lat.toFixed(6) : "—"} />
        <Stat label="Уртраг" value={fix ? fix.lon.toFixed(6) : "—"} />
        <Stat
          label="Нарийвчлал"
          value={fix?.acc != null ? `±${Math.round(fix.acc)} м` : "—"}
        />
        <Stat
          label="Сүүлийн дохио"
          value={age == null ? "—" : `${Math.round(age / 1000)} сек`}
        />
      </dl>

      <p className="text-xs text-muted">
        Хүлээн авсан цэг: {count} · Зургийг чирвэл автомат дагах зогсоно.
      </p>
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
