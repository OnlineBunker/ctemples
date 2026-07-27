import { Star, ArrowRight } from "lucide-react";
import { TempleImage } from "@/components/media/temple-image";
import { TransitionLink } from "@/components/motion/transition-link";
import { RegionBadge } from "@/components/ui/pill";
import { formatRating } from "@/lib/format";
import type { Region } from "@/lib/types";

/**
 * One hero slide's media DTO. Kept serialisable (plain fields, not a full Temple) so it
 * crosses the server→client boundary cheaply.
 *
 * VIDEO-READY: `kind` is the discriminator for the future. Photo slides ship now; when
 * production video exists, a slide sets `kind:"video"` with `videoUrl`/`poster` and the
 * component renders a muted, no-autoplay frame. Audio/unmute controls are planned (a
 * visible "Tap to unmute" affordance) but intentionally NOT implemented yet.
 */
export interface HeroSlideData {
  id: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  rating: number;
  kind: "image" | "video";
  /** Photo URL ("" → procedural TempleScene fallback). */
  image: string;
  /** Future: set when a production video replaces this slide's still. */
  videoUrl?: string;
  poster?: string;
}

/** The photo panel for a single slide (image + bottom overlay). */
export function HeroSlide({
  slide,
  priority,
  kenBurns = false,
}: {
  slide: HeroSlideData;
  priority: boolean;
  /** Dwell-scoped drift (docs/08 §5#4) — a plain 2D scale, morph-safe; off under
   *  reduced motion (the parent passes false). Restarts naturally because the parent
   *  remounts each slide (keyed by slide.id). */
  kenBurns?: boolean;
}) {
  const isVideo = slide.kind === "video" && !!slide.videoUrl;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-portal bg-canvas-soft">
      <div className={kenBurns ? "animate-kenburns absolute inset-0 origin-center" : "absolute inset-0"}>
        <TempleImage
          src={isVideo ? (slide.poster ?? "") : slide.image}
          alt={`${slide.name}, ${slide.city}, ${slide.state}`}
          region={slide.region}
          seed={slide.id}
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 56vw"
        />
      </div>

      {/* legibility scrim for the overlay text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-plum/85 via-plum/35 to-transparent"
      />

      {isVideo ? (
        // Planned video affordance (dormant — no production video in the prototype).
        <span className="absolute right-4 top-4 rounded-full bg-white/85 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-label text-plum">
          Video · audio soon
        </span>
      ) : null}

      <div className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 backdrop-blur-sm">
        <RegionBadge region={slide.region} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-7">
        <div className="flex items-center gap-2 text-white/90">
          <Star className="h-4 w-4 fill-turmeric text-turmeric" aria-hidden />
          <span className="font-mono text-xs" aria-label={`Rated ${formatRating(slide.rating)} out of 5`}>
            {formatRating(slide.rating)}
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {slide.name}
        </h2>
        <p className="text-sm text-white/80">
          {slide.city}, {slide.state}
        </p>
        <TransitionLink
          href={`/temples/${slide.id}`}
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-plum transition-colors hover:bg-white"
          aria-label={`Tour this temple: ${slide.name}`}
        >
          Tour this temple
          <ArrowRight className="h-4 w-4" aria-hidden />
        </TransitionLink>
      </div>
    </div>
  );
}
