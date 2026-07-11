import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TempleImage } from "@/components/media/temple-image";
import type { Region } from "@/lib/types";

export interface TripIdea {
  title: string;
  description: string;
  /** Pre-canned meta, e.g. "6 temples · 7 days · ~800 km". Editorial, not derived. */
  meta: string;
  href: string;
  /** Representative photo ("" → procedural TempleScene fallback). */
  image: string;
  region: Region;
  seed: string;
}

/** A single trip-idea card. Whole card is one link (no nested anchors). */
export function TripIdeaCard({ idea, priority = false }: { idea: TripIdea; priority?: boolean }) {
  return (
    <Link
      href={idea.href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:border-magenta/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-threshold group-hover:scale-[1.04]">
          <TempleImage
            src={idea.image}
            alt={idea.title}
            region={idea.region}
            seed={idea.seed}
            priority={priority}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 26rem, 35rem"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight text-plum">{idea.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{idea.description}</p>
        <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-label text-magenta">
          {idea.meta}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-magenta">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
