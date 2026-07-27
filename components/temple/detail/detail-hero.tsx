import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { Rating } from "@/components/ui/rating";
import { ActionRow } from "./action-row";
import { getHero } from "@/lib/media";
import type { Temple } from "@/lib/types";

/**
 * Section 1 — Hero (docs/06 §2). A contained 16:9 (4:3 mobile, max 60vh) doorway, not a
 * full-bleed banner. The landing side of the shared-element morph: `share="morph"` + the
 * same `temple-{id}` name the source card used, and — critically — the SAME `rounded-arch`
 * lintel clip as the card (docs/15 §2A), so the morph reads as stepping through the
 * doorway into the temple. Reads the same `getHero(media)` image so nothing swaps on arrival.
 */
export function DetailHero({ temple }: { temple: Temple }) {
  const hero = getHero(temple.media);
  const { lat, lng } = temple.coordinates;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section className="shell">
      <div className="relative aspect-[4/3] max-h-[60vh] w-full overflow-hidden rounded-arch print:hidden sm:aspect-[16/9]">
        <ViewTransition name={`temple-${temple.id}`} share="morph">
          <div className="absolute inset-0">
            <TempleImage
              src={hero?.url ?? ""}
              alt={hero?.alt ?? `${temple.name}, ${temple.city}`}
              region={temple.region}
              seed={temple.id}
              priority
              sizes="100vw"
            />
          </div>
        </ViewTransition>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/30 to-transparent"
        />
        {/* Gilt archway edge — static, on-brand (docs/15 §2A). */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-arch ring-1 ring-inset ring-turmeric/25"
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col-reverse items-start justify-between gap-5 p-5 sm:flex-row sm:items-end sm:p-8">
          <div className="min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-label text-white/70">
              {temple.state} · {temple.region} India
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-display-lg leading-[1.05] text-white">
              {temple.name}
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">{temple.tagline}</p>
            {typeof temple.rating === "number" ? (
              <div className="mt-3">
                <Rating value={temple.rating} tone="overlay" />
              </div>
            ) : null}
          </div>

          <ActionRow getDirectionsHref={directionsHref} className="shrink-0" />
        </div>
      </div>

      {/* Print-only text fallback (docs/06 §9: the hero photo and action row are hidden
          when printed). Never rendered alongside the photo hero's own H1 — one is always
          `display: none` depending on media, so the page keeps exactly one H1 either way. */}
      <div className="hidden print:block">
        <h1 className="font-display text-3xl text-plum">{temple.name}</h1>
        <p className="mt-2 text-ink-muted">{temple.tagline}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {temple.city}, {temple.state}
        </p>
      </div>
    </section>
  );
}
