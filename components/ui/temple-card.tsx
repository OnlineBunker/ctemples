import { MapPin } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { RegionBadge, Tag } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { formatRating, formatRupees, cheapestBudget } from "@/lib/format";
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

  return (
    <TransitionLink
      href={`/temples/${temple.id}`}
      className={cn(
        "group block h-full rounded-card outline-none transition-transform duration-500 ease-threshold hover:-translate-y-1 motion-reduce:!transform-none",
        className,
      )}
      aria-label={ariaLabel(temple)}
    >
      {/* The plinth: a solid base that carries the doorway + its label. */}
      <article
        aria-hidden="true"
        className="flex h-full flex-col rounded-card border border-line bg-canvas p-3 shadow-sm transition-[border-color,box-shadow] duration-300 group-hover:border-magenta/30 group-hover:shadow-md"
      >
        {/* The doorway: an arched lintel image, the morph source, with a gilt edge. */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-arch">
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <div className="absolute inset-0 transition-transform duration-700 ease-threshold group-hover:scale-[1.03] motion-reduce:!transform-none">
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
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-arch ring-1 ring-inset ring-turmeric/25" />
        </div>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
          <div className="flex items-center justify-between gap-3">
            <RegionBadge region={temple.region} />
            {typeof temple.rating === "number" ? <Rating value={temple.rating} /> : null}
          </div>
          <h3 className="mt-2 font-display text-title-lg font-semibold leading-tight text-plum transition-colors group-hover:text-magenta">
            {temple.name}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-label text-ink-muted">
            <MapPin className="h-3.5 w-3.5 text-magenta" aria-hidden />
            {temple.city}, {temple.state}
          </p>
          {temple.tagline ? (
            <p className="mt-2 line-clamp-2 text-body-sm text-ink-muted">{temple.tagline}</p>
          ) : null}

          {(temple.tags?.length || temple.cheapestBudget) ? (
            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <div className="flex flex-wrap gap-1.5">
                {(temple.tags ?? []).slice(0, 2).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              {temple.cheapestBudget ? (
                <span className="whitespace-nowrap text-right font-mono text-label-sm uppercase tracking-label text-magenta-deep">
                  from {formatRupees(temple.cheapestBudget)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </TransitionLink>
  );
}
