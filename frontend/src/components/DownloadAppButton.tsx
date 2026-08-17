"use client";

import { useState } from "react";
import { QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DownloadAppButton({ qrSvg, url }: { qrSvg: string | null; url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button size="lg" onClick={() => setOpen((v) => !v)}>
        Апп татах
        <QrCode className="size-4" />
      </Button>

      {open ? (
        <div className="absolute top-full left-0 z-20 mt-3 w-72 rounded-2xl border border-outline bg-white p-5 shadow-card">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Хаах"
            className="absolute top-3 right-3 text-muted hover:text-primary"
          >
            <X className="size-4" />
          </button>

          <p className="pr-6 text-sm font-medium text-ink">Гар утаснаасаа уншуулаарай</p>
          <p className="mt-1 text-xs text-body">
            LUMINA апп-ыг утасныхаа камераар доорх QR кодыг уншуулж нээнэ үү.
          </p>

          {qrSvg ? (
            <div
              className="mt-4 flex items-center justify-center rounded-xl bg-surface-tint p-4 [&_svg]:h-40 [&_svg]:w-40"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <p className="mt-4 rounded-xl bg-surface-tint p-4 text-center text-xs text-muted">
              Апп-ын холбоос тун удахгүй нэмэгдэнэ.
            </p>
          )}

          {url ? (
            <p className="mt-3 truncate text-center text-xs text-muted" title={url}>
              {url}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
