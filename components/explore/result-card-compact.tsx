import { TransitionLink } from "@/components/motion/transition-link";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { Rating } from "@/components/ui/rating";
import { formatRating } from "@/lib/format";
import type { TempleSummary } from "@/lib/temples";

/**
 * Compact horizontal result card for the map-mode results column (docs/05 §6): a
 * 96×72 4:3 thumbnail, name, city, rating. Shares the morph target name with the grid
 * ResultCard/TempleCard so navigating still morphs into the detail hero.
 */
export function ResultCardCompact({ temple }: { temple: TempleSummary }) {
  // The whole card is one link, so its aria-label fully replaces the computed accessible
  // name — fold the rating in explicitly, otherwise the visually-shown stars are dropped
  // from the a11y tree (the nested Rating's own label never surfaces on a labelled link).
  const ratingPart =
    typeof temple.rating === "number" ? `, rated ${formatRating(temple.rating)} out of 5` : "";
  return (
    <TransitionLink
      href={`/temples/${temple.id}`}
      className="group flex items-center gap-3 rounded-xl p-2 outline-none transition-colors hover:bg-canvas-soft focus-visible:bg-canvas-soft"
      aria-label={`${temple.name}, ${temple.city}${ratingPart} — view details`}
    >
      <div className="relative h-[72px] w-24 shrink-0 overflow-hidden rounded-lg">
        <ViewTransition name={`temple-${temple.id}`} share="morph">
          <TempleImage
            src={temple.hero?.url ?? ""}
            alt={temple.hero?.alt ?? `${temple.name}, ${temple.city}`}
            region={temple.region}
            seed={temple.id}
            sizes="96px"
          />
        </ViewTransition>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-base font-semibold leading-tight text-plum">
          {temple.name}
        </h3>
        <p className="mt-0.5 truncate text-[0.8rem] text-ink-muted">{temple.city}</p>
        {typeof temple.rating === "number" ? (
          <div className="mt-1">
            <Rating value={temple.rating} />
          </div>
        ) : null}
      </div>
    </TransitionLink>
  );
}
