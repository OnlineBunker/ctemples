import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import { ActionRow } from "./action-row";
import { getHero } from "@/lib/media";
import { formatRating } from "@/lib/format";
import type { Temple } from "@/lib/types";

/**
 * Section 1 — Hero, prototype fidelity (docs/15 §0a): a split header — tags, the big
 * Bricolage name, tagline, and DEITY · ★RATING in mono magenta on the left; a 3:4 arch
 * portrait (999px crown) with a gold orbit ring on the right. The portrait is the landing
 * side of the shared-element morph (`temple-{id}`), reading the same `getHero(media)`
 * image the card used so nothing swaps on arrival.
 */
export function DetailHero({ temple }: { temple: Temple }) {
  const hero = getHero(temple.media);
  const { lat, lng } = temple.coordinates;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <header
      className="grid items-center"
      style={{
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
        gap: "clamp(30px,5vw,80px)",
        padding: "clamp(28px,5vh,60px) 0 clamp(40px,7vh,70px)",
      }}
    >
      <div className="flex flex-col gap-[18px] print:hidden">
        <div className="flex flex-wrap gap-1.5">
          {temple.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink/[.18] px-[11px] py-1 font-mono text-[9.5px] uppercase tracking-[.1em] text-ink/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1
          className="text-balance font-display font-extrabold text-ink"
          style={{ fontSize: "clamp(38px,5.8vw,84px)", letterSpacing: "-.03em", lineHeight: 1 }}
        >
          {temple.name}
        </h1>
        <p className="max-w-[44ch] font-semibold text-plum" style={{ fontSize: "clamp(16px,1.6vw,20px)" }}>
          {temple.tagline}
        </p>
        <p className="font-mono text-[11px] tracking-[.18em] text-magenta">
          {`${temple.quickFacts.presidingDeity || temple.deity}  ·  ★ ${formatRating(temple.rating)}`.toUpperCase()}
        </p>
        <ActionRow getDirectionsHref={directionsHref} />
      </div>

      <div className="relative w-full max-w-[430px] justify-self-center print:hidden">
        {/* Gold orbit ring */}
        <div
          aria-hidden
          className="absolute rounded-full border border-turmeric/50"
          style={{ top: "-5%", left: "-10%", width: "70%", aspectRatio: "1/1" }}
        />
        <div
          className="relative w-full overflow-hidden bg-surface-recess"
          style={{
            aspectRatio: "3/4",
            borderRadius: "999px 999px 26px 26px",
            boxShadow: "0 34px 90px rgba(36,16,33,.26)",
          }}
        >
          <ViewTransition name={`temple-${temple.id}`} share="morph">
            <div className="absolute inset-0">
              <TempleImage
                src={hero?.url ?? ""}
                alt={hero?.alt ?? `${temple.name}, ${temple.city}`}
                region={temple.region}
                seed={temple.id}
                priority
                sizes="(max-width: 860px) 100vw, 430px"
              />
            </div>
          </ViewTransition>
        </div>
      </div>

      {/* Print-only text fallback (docs/06 §9). */}
      <div className="hidden print:block">
        <h1 className="font-display text-3xl text-plum">{temple.name}</h1>
        <p className="mt-2 text-ink-muted">{temple.tagline}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {temple.city}, {temple.state}
        </p>
      </div>
    </header>
  );
}
