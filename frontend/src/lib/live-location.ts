import { createClient } from "@/lib/supabase/client"

/**
 * Амьд байршлын протокол — утас (илгээгч) ба вэб (хүлээн авагч) хоёрын
 * хооронд Supabase Realtime broadcast-аар дамжина. DB хүснэгт шаардахгүй.
 *
 * Суваг нэр: `loc:<өрөөний код>` · event: `loc`
 * Утасны талын хуулбар: `app/src/lib/live-location.ts`
 */

export type Fix = {
  lat: number;
  lon: number;
  /** нарийвчлал, метр */
  acc: number | null;
  /** хурд, м/с */
  spd: number | null;
  /** unix ms */
  t: number;
};

export const CFG = {
  /** хоёр илгээлтийн хамгийн богино зай (мс) */
  MIN_INTERVAL: 2000,
  /** үүнээс бага хөдөлгөөнийг GPS чичиргээ гэж үзнэ (м) */
  MIN_DIST: 5,
  /** хөдлөөгүй ч "амьд байна" гэж мэдэгдэх давтамж (мс) */
  HEARTBEAT: 15000,
  /** хүлээн авагч тал дохио тасарсан гэж үзэх хугацаа (мс) */
  STALE: 20000,
};

/** Сүхбаатарын талбай — эхний төв */
export const UB: [number, number] = [47.9186, 106.9176];

export function channelName(room: string) {
  return `loc:${room.trim().toUpperCase()}`;
}

export function metersBetween(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Илгээх шаардлагатай эсэх: хангалттай хугацаа өнгөрсөн БА хангалттай зөрсөн,
 * эсвэл heartbeat-ийн хугацаа болсон.
 */
export function shouldSend(last: Fix | null, next: Fix) {
  if (!last) return true;
  const dt = next.t - last.t;
  const dd = metersBetween([last.lat, last.lon], [next.lat, next.lon]);
  return (dt >= CFG.MIN_INTERVAL && dd >= CFG.MIN_DIST) || dt >= CFG.HEARTBEAT;
}

/** Өрөөнд нэгдэж, байршил илгээх суваг нээнэ (хөтчөөс илгээхэд). */
export function createPublisher(room: string) {
  const supabase = createClient();
  const channel = supabase.channel(channelName(room));

  const joined = new Promise<void>((resolve, reject) => {
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") resolve();
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        reject(new Error(`Realtime холбогдож чадсангүй: ${status}`));
    });
  });

  return {
    joined,
    async send(fix: Fix) {
      await joined;
      await channel.send({ type: "broadcast", event: "loc", payload: fix });
    },
    close() {
      void supabase.removeChannel(channel);
    },
  };
}

export type SubscribeState = "connecting" | "live" | "error";

/** Өрөөг сонсоно. Буцаах функцийг дуудаж салгана. */
export function subscribeToRoom(
  room: string,
  onFix: (fix: Fix) => void,
  onState: (state: SubscribeState, detail?: string) => void,
) {
  const supabase = createClient();
  const channel = supabase.channel(channelName(room));

  channel.on("broadcast", { event: "loc" }, ({ payload }) => {
    const fix = payload as Fix;
    if (typeof fix?.lat === "number" && typeof fix?.lon === "number") onFix(fix);
  });

  onState("connecting");
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") onState("live");
    else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
      onState("error", status);
  });

  return () => {
    void supabase.removeChannel(channel);
  };
}
