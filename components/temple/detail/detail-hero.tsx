import { ArrowLeft, MapPin } from "lucide-react";
import { ViewTransition } from "@/components/motion/view-transition";
import { TransitionLink } from "@/components/motion/transition-link";
import { TempleImage } from "@/components/media/temple-image";
import { RegionBadge } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import type { Temple } from "@/lib/types";

/** Full-bleed hero and the landing side of the shared-element morph. */
export function DetailHero({ temple }: { temple: Temple }) {
  return (
    <section className="relative flex min-h-[78svh] items-end overflow-hidden">
      <ViewTransition name={`temple-${temple.id}`} share="morph">
        <div className="absolute inset-0">
          <TempleImage
            src={temple.heroImage}
            alt={`${temple.name}, ${temple.city}`}
            region={temple.region}
            seed={temple.id}
            priority
            sizes="100vw"
          />
        </div>
      </ViewTransition>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-nightstone-900 via-nightstone-900/45 to-nightstone-900/25"
      />
      <div aria-hidden className="absolute inset-0 bg-grain opacity-[0.1] mix-blend-overlay" />

      <div className="shell relative z-10 pb-14 pt-28">
        <TransitionLink
          href="/explore"
          type="nav-back"
          className="inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-label text-limewash/70 transition-colors hover:text-limewash"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All temples
        </TransitionLink>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <RegionBadge region={temple.region} />
          <span aria-hidden className="h-3 w-px bg-limewash/25" />
          <Rating value={temple.rating} />
        </div>

        <h1 className="mt-4 max-w-4xl font-display text-display-lg text-limewash">{temple.name}</h1>
        <p className="mt-4 max-w-2xl text-xl leading-relaxed text-limewash/80">{temple.tagline}</p>
        <p className="mt-4 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-label text-limewash/55">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {temple.city}, {temple.state}
        </p>
      </div>
    </section>
  );
}
