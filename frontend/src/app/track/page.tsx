import "leaflet/dist/leaflet.css";

import { LiveMap } from "./LiveMap";

export const metadata = { title: "Амьд байршил — LUMINA" };

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room } = await searchParams;

  return (
    <div className="min-h-screen bg-surface-page">
      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-6 py-10">
        <header>
          <h1 className="text-3xl font-semibold text-ink">Амьд байршил</h1>
          <p className="mt-1 text-sm text-muted">
            Артистын утаснаас ирж буй байршлыг газрын зураг дээр амьдаар
            харуулна.
          </p>
        </header>

        <LiveMap initialRoom={(room ?? "UB-1024").toUpperCase()} />
      </main>
    </div>
  );
}
