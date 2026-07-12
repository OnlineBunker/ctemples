import { TransitionLink } from "@/components/motion/transition-link";
import { TempleImage } from "@/components/media/temple-image";
import { getHero } from "@/lib/media";
import { formatRelativeDistance, pluralize } from "@/lib/format";
import type { Temple } from "@/lib/types";
import type { NearbyResult } from "@/lib/temple-queries";

/**
 * Section 4 — Plan around (docs/06 §5 row 4). The nearest temples reuse section 15's own
 * computation (`within100km`, capped to 3 here) — not a separate query — so the two
 * sections can never disagree about what's "nearby". A grid, never a carousel (D23):
 * the hero autoplay carousel and the homepage's curated showcase row are the only
 * sanctioned carousels (docs/01 D23 amendment) — this is computed, data-driven content.
 */
export function PlanAround({
  tripDuration,
  nearest,
}: {
  tripDuration: NonNullable<Temple["tripDuration"]>;
  nearest: NearbyResult[];
}) {
  return (
    <div>
      <p className="font-mono text-sm uppercase tracking-label text-magenta-deep">
        {pluralize(tripDuration.temples, "temple")} · {pluralize(tripDuration.days, "day")} · ~
        {tripDuration.km.toLocaleString("en-IN")} km
      </p>

      {nearest.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {nearest.map(({ temple, distanceKm }) => {
            const hero = getHero(temple.media);
            return (
              <TransitionLink
                key={temple.id}
                href={`/temples/${temple.id}`}
                className="group flex items-center gap-3 rounded-card border border-line p-3 transition-colors hover:border-magenta/40"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <TempleImage
                    src={hero?.url ?? ""}
                    alt={hero?.alt ?? temple.name}
                    region={temple.region}
                    seed={temple.id}
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold leading-tight text-plum">
                    {temple.name}
                  </p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-label text-ink-muted">
                    {formatRelativeDistance(distanceKm)}
                  </p>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
