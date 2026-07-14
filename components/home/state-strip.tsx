"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { StateTile, type StateStripItem } from "./state-tile";
import { StatePopover } from "./state-popover";

/** Local structural type matching Radix's own `Measurable` (avoids an undeclared
 *  import of the transitive `@radix-ui/rect` package for one type). */
interface Measurable {
  getBoundingClientRect(): DOMRect;
}

/**
 * "Browse by state" (UX_SPEC §1.6). Each tile is a button that opens a popover of the
 * state's top temples; the parent enforces one-open-at-a-time. A wrapping grid (rather
 * than a horizontal scroller) keeps popovers unclipped and the layout zoom-safe. The
 * trailing tile links to the full map. All states/counts derive from the data.
 *
 * A single shared Popover.Root/Content backs every tile (Radix `virtualRef` anchoring,
 * D19) rather than one independent Popover instance per tile. With N independent
 * instances, clicking straight from an open tile to a sibling tile raced Radix's
 * outside-dismiss handling for the first tile against the second tile's own open — the
 * dismiss could win, leaving both closed and requiring a second click. A single
 * always-mounted Content has no sibling instance to race against: switching tiles just
 * repositions the one Content and swaps its data.
 */
export function StateStrip({ states }: { states: StateStripItem[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const anchorRef = useRef<Measurable>({ getBoundingClientRect: () => new DOMRect() });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const contentId = useId();
  const openItem = states.find((item) => item.slug === openSlug) ?? null;

  function toggle(slug: string, trigger: HTMLButtonElement) {
    anchorRef.current = trigger;
    setOpenSlug((prev) => (prev === slug ? null : slug));
  }

  return (
    <section className="shell py-14 md:py-20">
      <Reveal>
        <SectionHeading eyebrow="Browse by state" title="Every state, its temples" />
      </Reveal>
      <Popover.Root open={openSlug !== null} onOpenChange={(next) => !next && setOpenSlug(null)}>
        <Popover.Anchor virtualRef={anchorRef} />
        <div
          ref={gridRef}
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        >
          {states.map((item) => (
            <StateTile
              key={item.slug}
              item={item}
              isOpen={openSlug === item.slug}
              contentId={contentId}
              onToggle={(trigger) => toggle(item.slug, trigger)}
            />
          ))}
          <Link
            href="/explore?view=map"
            className="flex h-full min-h-[7rem] flex-col items-start justify-between rounded-card border border-dashed border-line-strong bg-transparent p-4 text-left transition-colors hover:border-magenta hover:bg-magenta-soft"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-magenta-soft text-magenta">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-base font-semibold leading-tight text-plum">
              See all states
            </span>
          </Link>
        </div>
        <Popover.Portal>
          <Popover.Content
            id={contentId}
            aria-label={openItem ? `${openItem.state} temples` : undefined}
            align="start"
            sideOffset={8}
            collisionPadding={16}
            onInteractOutside={(event) => {
              // A click on a SIBLING TILE TRIGGER is handled by that tile's own onToggle
              // (which already updates openSlug correctly) — don't let Radix's default
              // dismiss race against it. Scoped to tile triggers specifically (not the
              // whole grid) so a click in the gaps between tiles, or on the trailing
              // "See all states" link, still dismisses like a genuine outside click.
              const target = event.target as Element;
              if (gridRef.current?.contains(target) && target.closest("[data-state-tile]")) {
                event.preventDefault();
              }
            }}
            className={cn(
              "popover-content z-40 w-64 max-w-[calc(100vw-2.5rem)] rounded-card border border-line bg-canvas p-3 shadow-lg focus:outline-none",
            )}
          >
            {openItem ? (
              <StatePopover
                stateName={openItem.state}
                count={openItem.count}
                seeAllHref={`/explore?state=${openItem.slug}`}
                items={openItem.top}
                onNavigate={() => setOpenSlug(null)}
              />
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </section>
  );
}
