import { ShareForm } from "./ShareForm";

export const metadata = { title: "Байршил хуваалцах — LUMINA" };

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room } = await searchParams;

  return (
    <div className="min-h-screen bg-surface-page">
      <main className="mx-auto flex max-w-[520px] flex-col gap-6 px-6 py-10">
        <header>
          <h1 className="text-2xl font-semibold text-ink">Байршил хуваалцах</h1>
          <p className="mt-1 text-sm text-muted">
            Утасны хөтчөөс шууд ажиллана — апп суулгах шаардлагагүй. Өрөөний код
            нь газрын зураг дээрх кодтой ижил байх ёстой.
          </p>
        </header>

        <ShareForm initialRoom={(room ?? "UB-1024").toUpperCase()} />
      </main>
    </div>
  );
}
