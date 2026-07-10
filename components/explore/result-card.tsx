import { MapPin } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { RegionBadge, Tag } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { formatRupees } from "@/lib/format";
import type { TempleSummary } from "@/lib/temples";

/**
 * Explore's result card — same visual design as components/temple/temple-card.tsx
 * (docs/03 §6.2), but built for TempleSummary: Explore never receives a full Temple
 * record (docs/11 §3, docs/05 §9's acceptance criterion). Shares the morph target name
 * so navigating into a result still morphs the image into the detail hero.
 */
export function ResultCard({ temple, priority = false }: { temple: TempleSummary; priority?: boolean }) {
  return (
    <TransitionLink
      href={`/temples/${temple.id}`}
      className="group block h-full rounded-card outline-none transition-transform duration-500 ease-threshold hover:-translate-y-1.5"
      aria-label={`${temple.name}, ${temple.city} — view details`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-sm transition-[border-color,box-shadow] duration-300 group-hover:border-magenta/40 group-hover:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden">
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <div className="absolute inset-0 transition-transform duration-700 ease-threshold group-hover:scale-[1.03]">
              <TempleImage
                src={temple.hero?.url ?? ""}
                alt={temple.hero?.alt ?? `${temple.name}, ${temple.city}`}
                region={temple.region}
                seed={temple.id}
                priority={priority}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              />
            </div>
          </ViewTransition>

          <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 backdrop-blur-sm">
            <RegionBadge region={temple.region} />
          </div>
          {typeof temple.rating === "number" ? (
            <div className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 backdrop-blur-sm">
              <Rating value={temple.rating} />
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-semibold leading-tight text-plum">
            {temple.name}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[0.8rem] text-ink-muted">
            <MapPin className="h-3.5 w-3.5 text-magenta" aria-hidden />
            {temple.city}, {temple.state}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {temple.tagline}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="flex flex-wrap gap-1.5">
              {temple.tags.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            {temple.cheapestBudget ? (
              <span className="whitespace-nowrap text-right font-mono text-[0.68rem] uppercase tracking-label text-magenta-deep">
                from {formatRupees(temple.cheapestBudget)}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </TransitionLink>
  );
}
