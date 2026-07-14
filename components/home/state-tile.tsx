"use client";

import { useRef } from "react";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { REGION_META } from "@/lib/regions";
import type { Region } from "@/lib/types";
import type { StatePopoverItem } from "./state-popover";

export interface StateStripItem {
  state: string;
  slug: string;
  region: Region;
  count: number;
  /** The state's 48×48-normalized silhouette path (docs/07 §8), resolved server-side and
   *  passed down so this client component never imports the map geometry. `null` → the
   *  gopuram mark stands in (callout-marker states, or a missing silhouette). */
  silhouette: string | null;
  top: StatePopoverItem[];
}

/**
 * A state tile: a button that opens the parent's shared popover of the state's top
 * temples (docs/03 §6.4, D19). The popover itself lives in the parent (`StateStrip`),
 * anchored to whichever tile was last clicked — this component only renders the
 * trigger and reports its own DOM node up on click.
 */
function StateIcon({ silhouette }: { silhouette: string | null }) {
  if (!silhouette) {
    return <GopuramMark className="h-6 w-6" />;
  }
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden>
      <path d={silhouette} fill="currentColor" />
    </svg>
  );
}

export function StateTile({
  item,
  isOpen,
  contentId,
  onToggle,
}: {
  item: StateStripItem;
  isOpen: boolean;
  contentId: string;
  onToggle: (trigger: HTMLButtonElement) => void;
}) {
  const pigment = REGION_META[item.region].pigment;
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={buttonRef}
      type="button"
      data-state-tile
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={isOpen ? contentId : undefined}
      onClick={() => buttonRef.current && onToggle(buttonRef.current)}
      className="flex h-full w-full flex-col items-start gap-3 rounded-card border border-line bg-canvas p-4 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-magenta/40 hover:shadow-md aria-expanded:border-magenta"
    >
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{ color: pigment, backgroundColor: `${pigment}14` }}
      >
        <StateIcon silhouette={item.silhouette} />
      </span>
      <span>
        <span className="block font-display text-base font-semibold leading-tight text-plum">
          {item.state}
        </span>
        <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
          {item.count === 1 ? "1 temple" : `${item.count} temples`}
        </span>
      </span>
    </button>
  );
}
