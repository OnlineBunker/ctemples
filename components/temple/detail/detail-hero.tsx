import Link from "next/link";
import { ActionRow } from "./action-row";
import { HeroPhotoStack, type StackPhoto } from "./hero-photo-stack";
import { formatRating } from "@/lib/format";
import { slugify } from "@/lib/utils";
import { DEITY_ORDER, DEITY_META, matchesDeity } from "@/lib/deities";
import type { Temple } from "@/lib/types";

/**
 * Section 1 — Hero, prototype fidelity (docs/15 §0a): a split header — tags, the big
 * Bricolage name, tagline, and DEITY · ★RATING in mono magenta on the left; a 3:4 arch
 * portrait (999px crown) with a gold orbit ring on the right. The portrait is the landing
 * side of the shared-element morph (`temple-{id}`), reading the same `getHero(media)`
 * image the card used so nothing swaps on arrival.
 */
export function DetailHero({ temple }: { temple: Temple }) {
  const { lat, lng } = temple.coordinates;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  // Up to three stills for the stack — media[0] is always the hero (lib/media.ts), so this
  // is "the main photo plus its next two". Fewer than three degrades to what exists.
  const photos: StackPhoto[] = temple.media
    .filter((m) => m.kind === "image" || m.poster)
    .slice(0, 3)
    .map((m) => ({ url: m.kind === "video" ? (m.poster ?? "") : m.url, alt: m.alt }));

  // The first canonical deity this temple matches, or null if it matches none — used to decide
  // whether the deity reads as a link or as plain text.
  const deityKey = DEITY_ORDER.find((key) => matchesDeity(temple, key)) ?? null;

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
        {/* The deity and the state are now real links, not inert text. This was the entry's
            biggest dead end: the two strongest lateral routes out of a temple — "more of this
            deity" and "more in this state" — existed as pages but were unreachable from here,
            leaving Back as the only exit. It also feeds the internal link graph the spec wants
            (docs/01 D26). The deity link only renders when the record actually matches one of
            the six canonical deities, so it can never point at a page with nothing on it. */}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[.18em] text-magenta">
          {deityKey ? (
            <Link
              href={`/deities/${deityKey}`}
              className="uppercase underline-offset-4 transition-colors hover:text-magenta-deep hover:underline"
            >
              {DEITY_META[deityKey].label} temples
            </Link>
          ) : (
            <span className="uppercase">{temple.quickFacts.presidingDeity || temple.deity}</span>
          )}
          <span aria-hidden className="text-ink/25">·</span>
          <Link
            href={`/states/${slugify(temple.state)}`}
            className="uppercase underline-offset-4 transition-colors hover:text-magenta-deep hover:underline"
          >
            {temple.state}
          </Link>
          <span aria-hidden className="text-ink/25">·</span>
          <span className="uppercase text-ink/60">★ {formatRating(temple.rating)}</span>
        </p>
        <ActionRow
          templeId={temple.id}
          templeName={temple.name}
          getDirectionsHref={directionsHref}
        />
      </div>

      <div className="w-full justify-self-center print:hidden">
        <HeroPhotoStack
          photos={photos}
          templeId={temple.id}
          region={temple.region}
          name={temple.name}
          city={temple.city}
        />
      </div>

      {/* Print-only text fallback (docs/06 §9). A <p>, not a second <h1>: the screen hero above
          already owns the page's single h1, and shipping two in the markup gives crawlers and
          outline tools a conflicting document structure even though `display:none` hides this
          one from assistive tech on screen. Print styling carries the hierarchy visually. */}
      <div className="hidden print:block">
        <p className="font-display text-3xl text-plum">{temple.name}</p>
        <p className="mt-2 text-ink-muted">{temple.tagline}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {temple.city}, {temple.state}
        </p>
      </div>
    </header>
  );
}
