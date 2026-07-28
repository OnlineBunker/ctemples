import { TransitionLink } from "@/components/motion/transition-link";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { Rating } from "@/components/ui/rating";
import { formatRating, cheapestBudget } from "@/lib/format";
import { getHero } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Temple, Region } from "@/lib/types";
import type { TempleSummary } from "@/lib/temples";

/**
 * The ONE temple card (docs/15 §2F) — merges the old ResultCard / TempleCard /
 * ResultCardCompact triplication onto a normalized view-model. Its signature is the
 * Threshold: a `rounded-arch` lintel image (a doorway you step through) sitting on a
 * solid **plinth** that carries region · rating · name · place — replacing the old
 * floating white backdrop-blur pills (the travel-booking tell). The image is the shared
 * `temple-{id}` morph source; because card and detail-hero share the SAME `rounded-arch`
 * clip, the View-Transition morph reads as walking through the door into the temple.
 * Whole card is one link (no nested anchors); hover is a 2D lift + zoom only (a
 * 3D-transformed ancestor would corrupt the morph snapshot).
 */
export interface TempleCardData {
  id: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  rating?: number;
  tagline?: string;
  tags?: string[];
  hero?: { url: string; alt: string } | null;
  cheapestBudget?: number | null;
}

/** Adapt a full Temple record to the card view-model. */
export function templeToCard(t: Temple): TempleCardData {
  const hero = getHero(t.media);
  return {
    id: t.id,
    name: t.name,
    city: t.city,
    state: t.state,
    region: t.region,
    rating: t.rating,
    tagline: t.tagline,
    tags: t.tags,
    hero: hero ? { url: hero.url, alt: hero.alt } : null,
    cheapestBudget: cheapestBudget(t.costEstimates),
  };
}

/** Adapt the card-weight TempleSummary projection (what Explore receives). */
export function summaryToCard(s: TempleSummary): TempleCardData {
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    state: s.state,
    region: s.region,
    rating: s.rating,
    tagline: s.tagline,
    tags: s.tags,
    hero: s.hero ? { url: s.hero.url, alt: s.hero.alt } : null,
    cheapestBudget: s.cheapestBudget,
  };
}

function ariaLabel(t: TempleCardData): string {
  const ratingPart = typeof t.rating === "number" ? `, rated ${formatRating(t.rating)} out of 5` : "";
  return `${t.name}, ${t.city}${ratingPart} — view details`;
}

/**
 * `variant`:
 *  - `grid` (default): the full arched-lintel plate on a plinth — home / Explore / related.
 *  - `compact`: a horizontal row with a small arch-sm thumbnail — the map results column.
 */
export function TempleCard({
  temple,
  variant = "grid",
  priority = false,
  className,
}: {
  temple: TempleCardData;
  variant?: "grid" | "compact";
  priority?: boolean;
  className?: string;
}) {
  const heroUrl = temple.hero?.url ?? "";
  const heroAlt = temple.hero?.alt ?? `${temple.name}, ${temple.city}`;

  if (variant === "compact") {
    return (
      <TransitionLink
        href={`/temples/${temple.id}`}
        className={cn(
          "group flex items-center gap-3 rounded-card p-2 outline-none transition-colors hover:bg-surface-recess focus-visible:bg-surface-recess",
          className,
        )}
        aria-label={ariaLabel(temple)}
      >
        <div className="relative h-[76px] w-28 shrink-0 overflow-hidden rounded-arch-sm">
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <TempleImage src={heroUrl} alt={heroAlt} region={temple.region} seed={temple.id} sizes="112px" />
          </ViewTransition>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-arch-sm ring-1 ring-inset ring-turmeric/20" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-title-md font-semibold leading-tight text-plum transition-colors group-hover:text-magenta">
            {temple.name}
          </h3>
          <p className="mt-0.5 truncate font-mono text-label text-ink-muted">{temple.city}</p>
          {typeof temple.rating === "number" ? (
            <div className="mt-1">
              <Rating value={temple.rating} />
            </div>
          ) : null}
        </div>
      </TransitionLink>
    );
  }

  // The prototype atlas card (docs/15 §0a): a 4:5 arch-top image (170px crown), a
  // centered translucent region pill overlapping the top edge, and name / location / ★
  // set directly on the page — no card box, no border, no floating white pills.
  return (
    <TransitionLink
      href={`/temples/${temple.id}`}
      className={cn("group block outline-none", className)}
      aria-label={ariaLabel(temple)}
    >
      <article aria-hidden="true">
        <div
          className="relative overflow-hidden bg-surface-recess"
          style={{ aspectRatio: "4/5", borderRadius: "170px 170px 18px 18px" }}
        >
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <div className="absolute inset-0 transition-transform duration-[800ms] ease-threshold group-hover:scale-[1.06] motion-reduce:!transform-none">
              <TempleImage
                src={heroUrl}
                alt={heroAlt}
                region={temple.region}
                seed={temple.id}
                priority={priority}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              />
            </div>
          </ViewTransition>
          <span className="absolute left-1/2 top-3.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/50 px-[11px] py-[5px] font-mono text-[9px] tracking-[.18em] text-porcelain backdrop-blur-[6px]">
            {temple.region.toUpperCase()} INDIA
          </span>
        </div>
        <div className="px-1.5 pt-3.5">
          <h3
            className="text-balance font-display font-semibold leading-[1.2] tracking-[-.01em] text-ink transition-colors duration-300 group-hover:text-magenta"
            style={{ fontSize: 19 }}
          >
            {temple.name}
          </h3>
          <div className="mt-[5px] flex items-baseline justify-between gap-2.5">
            <p className="truncate font-mono text-[10px] uppercase tracking-[.14em] text-ink/50">
              {temple.city} · {temple.state}
            </p>
            {typeof temple.rating === "number" ? (
              <p className="shrink-0 font-mono text-[10.5px] text-ink">
                <span className="text-turmeric">★</span> {formatRating(temple.rating)}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </TransitionLink>
  );
}
