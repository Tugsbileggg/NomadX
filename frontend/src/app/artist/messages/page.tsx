import { Search, Send } from "lucide-react";
import { ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { Monogram } from "@/components/admin/kit";

export const metadata = { title: "Мессеж — Артистын админ" };

const THREADS = [
  {
    name: "Сарантуяа Б.",
    when: "10:42",
    preview: "Сайн байна уу, маргааш цаг байгаа юу?",
    active: true,
  },
  {
    name: "Анужин Э.",
    when: "Өчигдөр",
    preview: "Баярлалаа, үйлчилгээ маш их таалагдсан.",
    active: false,
  },
  { name: "Уянга Т.", when: "Мяг", preview: "Цаг баталгаажлаа.", active: false },
];

const MESSAGES = [
  {
    from: "them" as const,
    text: "Сайн байна уу, маргааш өдрийн 14:00 цагт нүүр будалтын цаг байгаа юу?",
    at: "10:42",
  },
  {
    from: "me" as const,
    text: "Сайн байна уу, Сарантуяа. Маргааш 14:00 цаг сул байгаа. Та цагаа баталгаажуулах уу?",
    at: "10:45",
  },
  { from: "them" as const, text: "Тэгье, цаг баталгаажуулъя. Баярлалаа.", at: "10:48" },
];

const QUICK = ["Баярлалаа", "Цаг баталгаажлаа", "Сайн байна уу?", "Маргааш уулзъя"];

export default function ArtistMessagesPage() {
  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/messages" {...ARTIST}>
      <div className="grid h-[calc(100vh-11rem)] gap-6 lg:grid-cols-[320px_1fr]">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-soft backdrop-blur-xl">
          <div className="border-b border-surface-tint p-4">
            <label className="relative block">
              <span className="sr-only">Мессеж хайх</span>
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Мессеж хайх..."
                className="h-10 w-full rounded-full bg-surface-tint pr-4 pl-10 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-primary"
              />
            </label>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {THREADS.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  aria-current={t.active ? "true" : undefined}
                  className={`flex w-full items-start gap-3 border-b border-surface-tint p-4 text-left transition-colors ${
                    t.active ? "bg-surface-tint" : "hover:bg-white"
                  }`}
                >
                  <Monogram name={t.name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">{t.name}</span>
                      <span className="shrink-0 text-[11px] text-muted">{t.when}</span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-body">{t.preview}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-soft backdrop-blur-xl">
          <header className="flex items-center gap-3 border-b border-surface-tint p-4">
            <Monogram name="Сарантуяа Б." />
            <div>
              <p className="text-sm font-medium text-ink">Сарантуяа Б.</p>
              <p className="text-xs text-muted">Идэвхтэй • Шинэ харилцагч</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            <p className="mb-6 text-center text-xs text-muted">Өнөөдөр</p>
            <ul className="flex flex-col gap-4">
              {MESSAGES.map((m, i) => (
                <li
                  key={i}
                  className={m.from === "me" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-5 ${
                        m.from === "me"
                          ? "bg-primary text-white"
                          : "bg-surface-tint text-body"
                      }`}
                    >
                      {m.text}
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-muted ${
                        m.from === "me" ? "text-right" : ""
                      }`}
                    >
                      {m.at}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <footer className="border-t border-surface-tint p-4">
            <div className="flex flex-wrap gap-2 pb-3">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rounded-full border border-outline bg-white px-3 py-1.5 text-xs text-body hover:bg-surface-tint"
                >
                  {q}
                </button>
              ))}
            </div>
            <form className="flex gap-3">
              <input
                placeholder="Мессеж бичих..."
                aria-label="Мессеж бичих"
                className="h-11 flex-1 rounded-full bg-surface-tint px-4 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-primary"
              />
              <button
                type="submit"
                aria-label="Илгээх"
                className="flex size-11 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
              >
                <Send className="size-4" />
              </button>
            </form>
          </footer>
        </section>
      </div>
    </ArtistShell>
  );
}
