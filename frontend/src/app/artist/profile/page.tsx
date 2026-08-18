import Link from "next/link";
import { MapPin, Pencil, Plus } from "lucide-react";
import { ArtistPanel, ArtistShell } from "@/components/artist/ArtistShell";
import { ARTIST, ARTIST_NAV } from "@/components/artist/nav";
import { publicAssetUrl } from "@/lib/storage/store-file";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Миний профайл — Артистын админ" };

export default async function ArtistProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, about, address, logo_path, cover_path")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const { data: categories } = await supabase
    .from("business_categories")
    .select("category")
    .eq("business_id", business?.id ?? "");

  const logoUrl = publicAssetUrl(supabase, business?.logo_path ?? null);
  const coverUrl = publicAssetUrl(supabase, business?.cover_path ?? null);
  const initial = (business?.name ?? "А").trim().charAt(0).toUpperCase();
  const tags = (categories ?? []).map((c) => c.category);

  return (
    <ArtistShell nav={ARTIST_NAV} active="/artist/profile" {...ARTIST}>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <p className="text-sm text-body">Ингэж хэрэглэгчид харагдана</p>
        <Link
          href="/artist/settings"
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Pencil className="size-4" />
          Профайл засах
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-soft backdrop-blur-xl">
          <div
            className="relative h-44 bg-linear-to-r from-primary-container to-primary-accent bg-cover bg-center"
            style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
          />

          <div className="relative px-8 pt-14 pb-8">
            <span className="absolute -top-10 left-8 flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary-container text-xl font-semibold text-primary-dark">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                initial
              )}
            </span>

            <h1 className="text-2xl leading-8 font-semibold text-ink">
              {business?.name || "Нэргүй артист"}
            </h1>
            {tags.length > 0 && <p className="mt-1 text-sm text-body">{tags.join(" · ")}</p>}

            {business?.address && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-body">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {business.address}
                </span>
              </div>
            )}
          </div>
        </div>

        <ArtistPanel title="Миний тухай">
          <p className="text-sm leading-6 text-body">
            {business?.about || "Одоогоор танилцуулга бичээгүй байна."}
          </p>
        </ArtistPanel>

        <ArtistPanel
          title="Портфолио"
          action={
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Бүгдийг харах
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              type="button"
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 text-xs font-medium text-primary hover:border-primary"
            >
              <Plus className="size-5" />
              Зураг нэмэх
            </button>
          </div>
        </ArtistPanel>
      </div>
    </ArtistShell>
  );
}
