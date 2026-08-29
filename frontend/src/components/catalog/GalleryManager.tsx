"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/catalog/CatalogForm";
import { deleteMedia, uploadMedia } from "@/lib/catalog/actions";
import type { CatalogMedia } from "@/lib/catalog/queries";

/**
 * Галерей / бүтээлүүдийн удирдлага.
 *
 * Энэ хүртэл `business_media`-д бичдэг ганц зүйл нь seed script байсан —
 * эзэн өөрөө зураг нэмэх газаргүй байв.
 */
export function GalleryManager({
  gallery,
  canEdit,
  /** Салонд "Галерей", артистад "Бүтээлүүд" — аппын профайлтай ижил үг. */
  noun,
}: {
  gallery: CatalogMedia[];
  canEdit: boolean;
  noun: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string[]>([]);

  if (!canEdit) {
    return (
      <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
        Бизнесийн бүртгэл олдсонгүй. Эхлээд бүртгэлээ бөглөж, батлуулна уу.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ActionForm action={uploadMedia} className="flex flex-col gap-4">
        <div className="rounded-2xl border border-surface-variant bg-white p-6 shadow-hairline">
          <p className="text-sm text-body">
            Энд оруулсан зураг үйлчлүүлэгчийн аппын профайл дээр{" "}
            <span className="font-medium text-ink">{noun}</span> хэсэгт харагдана.
            Нэг удаад 8 хүртэл зураг, тус бүр 5MB хүртэл.
          </p>

          <input
            ref={inputRef}
            type="file"
            name="images"
            accept="image/*"
            multiple
            required
            onChange={(e) =>
              setPicked(Array.from(e.target.files ?? []).map((f) => f.name))
            }
            className="hidden"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={GHOST_BUTTON}
            >
              <span className="flex items-center gap-2">
                <ImagePlus className="size-4" />
                Зураг сонгох
              </span>
            </button>

            <input
              type="text"
              name="caption"
              placeholder="Тайлбар (заавал биш)"
              className="h-10 min-w-[220px] flex-1 rounded-lg bg-surface-tint px-3 text-sm text-ink focus:outline-2 focus:outline-primary"
            />

            <SubmitButton className={PRIMARY_BUTTON} pendingLabel="Байршуулж байна...">
              Нэмэх
            </SubmitButton>
          </div>

          {picked.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Сонгосон: {picked.join(", ")}
            </p>
          )}
        </div>
      </ActionForm>

      {gallery.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-outline bg-white px-6 py-12 text-center text-sm text-muted">
          Одоогоор зураг байхгүй байна.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item) => (
            <figure
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-surface-variant bg-surface-tint"
            >
              <div className="relative aspect-square">
                {item.url && (
                  // Зургууд нь Supabase storage-ийн нийтийн хаягаас ирдэг —
                  // next/image-ийн оптимизацийг тохируулаагүй тул алгасна.
                  <Image src={item.url} alt={item.caption ?? ""} fill unoptimized className="object-cover" />
                )}
              </div>

              {item.caption && (
                <figcaption className="px-3 py-2 text-xs leading-4 text-body">
                  {item.caption}
                </figcaption>
              )}

              <ActionForm action={deleteMedia} className="absolute top-2 right-2">
                <input type="hidden" name="media_id" value={item.id} />
                <SubmitButton
                  className="flex size-8 items-center justify-center rounded-full bg-white/90 text-[#991b1b] shadow-hairline hover:bg-white"
                  pendingLabel="…"
                >
                  <Trash2 className="size-4" />
                </SubmitButton>
              </ActionForm>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
