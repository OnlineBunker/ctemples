"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { StateTile, type StateStripItem } from "./state-tile";

/**
 * "Browse by state" (UX_SPEC §1.6). Each tile is a button that opens a popover of the
 * state's top temples; the parent enforces one-open-at-a-time. A wrapping grid (rather
 * than a horizontal scroller) keeps popovers unclipped and the layout zoom-safe. The
 * trailing tile links to the full map. All states/counts derive from the data.
 */
export function StateStrip({ states }: { states: StateStripItem[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <section className="shell py-14 md:py-20">
      <Reveal>
        <SectionHeading eyebrow="Browse by state" title="Every state, its temples" />
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {states.map((item) => (
          <StateTile
            key={item.slug}
            item={item}
            isOpen={openSlug === item.slug}
            onOpen={() => setOpenSlug(item.slug)}
            onClose={() => setOpenSlug(null)}
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
    </section>
  );
}
