import { MapPin } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { RegionBadge, Tag } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { cheapestBudget, formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Temple } from "@/lib/types";

/**
 * The Explore/showcase card and the source of the signature morph: its image is wrapped
 * in a shared-element <ViewTransition> whose name matches the detail hero, so navigating
 * morphs the card image into the hero. Hover is a 2D lift + zoom only — a 3D-transformed
 * ancestor would corrupt the view-transition snapshot of the morph target.
 */
export function TempleCard({
  temple,
  priority = false,
  className,
}: {
  temple: Temple;
  priority?: boolean;
  className?: string;
}) {
  const from = cheapestBudget(temple.costEstimates);

  return (
    <TransitionLink
      href={`/temples/${temple.id}`}
      className={cn(
        "group block h-full rounded-card outline-none transition-transform duration-500 ease-threshold hover:-translate-y-1.5",
        className,
      )}
      aria-label={`${temple.name}, ${temple.city} — view details`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-card border border-brass/15 bg-nightstone-800/60 transition-colors duration-500 group-hover:border-brass/40">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <div className="absolute inset-0 transition-transform duration-700 ease-threshold group-hover:scale-[1.06]">
              <TempleImage
                src={temple.heroImage}
                alt={`${temple.name}, ${temple.city}`}
                region={temple.region}
                seed={temple.id}
                priority={priority}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              />
            </div>
          </ViewTransition>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nightstone-900 via-nightstone-900/10 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-nightstone-900/75 to-transparent"
          />
          <div className="absolute left-4 top-4">
            <RegionBadge region={temple.region} />
          </div>
          <div className="absolute right-4 top-4 rounded-full bg-nightstone-900/70 px-2.5 py-1 backdrop-blur-sm">
            <Rating value={temple.rating} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl leading-tight text-limewash">{temple.name}</h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-label text-limewash/50">
            <MapPin className="h-3 w-3" aria-hidden />
            {temple.city}, {temple.state}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-limewash/70">{temple.tagline}</p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="flex flex-wrap gap-1.5">
              {temple.tags.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            {from ? (
              <span className="whitespace-nowrap text-right font-mono text-[0.68rem] uppercase tracking-label text-brass">
                from {formatRupees(from)}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </TransitionLink>
  );
}
