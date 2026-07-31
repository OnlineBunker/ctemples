"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IndiaMap } from "./india-map";
import { RegionPills } from "./region-pills";
import { MapResultsColumn } from "./map-results-column";
import { BottomSheet } from "./bottom-sheet";
import { MapAttribution } from "./map-attribution";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";
import { pluralize } from "@/lib/format";
import type { PagedTemples } from "@/lib/temples";
import type { StateCount } from "@/lib/temple-queries";
import type { Region } from "@/lib/types";

/**
 * Map mode's top-level view (docs/05 §6) — desktop two-pane (map 60% / results 40%,
 * sticky, own scroll) and mobile (map 40vh sticky top + bottom sheet). Lazy-loaded via
 * next/dynamic only under `?view=map` (docs/05 §6's last bullet) so list mode never
 * pays for the map bundle.
 */
export function ExploreMapView({
  current,
  result,
  allStates,
  stateLabel,
}: {
  current: ParsedExploreParams;
  result: PagedTemples;
  allStates: StateCount[];
  stateLabel: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeRegion, setActiveRegion] = useState<Region | "all">("all");
  // When the mobile sheet is at half/full it is an aria-modal dialog (docs/03 §6.8), so
  // the map + region pills behind it must be inert — otherwise pointer and SR
  // virtual-cursor users can still operate them, contradicting the modal contract.
  const [sheetModal, setSheetModal] = useState(false);

  const counts = useMemo(
    () => Object.fromEntries(allStates.map((s) => [s.slug, s.count])),
    [allStates],
  );

  function handleSelectState(slug: string) {
    const next = current.state === slug ? undefined : slug;
    // Selecting a state changes the results beside the map; it is not a new page, so the
    // scroll position must survive.
    //
    // `scroll: false` stops the App Router's default scroll-to-top, but on its own it is NOT
    // enough here, and this took a measurement to establish. `/explore` is a dynamic route, so
    // a searchParams change re-suspends the segment; while an `app/explore/loading.tsx`
    // existed, rendering that Suspense fallback scrolled to top regardless of the flag.
    // Measured, clicking a state from scrollY 700:
    //   loading.tsx present, `scroll: false`                     -> 0    (bug)
    //   loading.tsx present, `scroll: false` + startTransition   -> 0    (bug — did NOT help)
    //   loading.tsx removed, `scroll: false`                     -> 700  (correct)
    // So the fix is that `app/explore/loading.tsx` is deliberately absent. DO NOT reintroduce a
    // loading.tsx for this route without re-testing this interaction — a route-level skeleton
    // here trades a cold-entry nicety for a scroll bug on every single state selection.
    //
    // The transition is kept because it keeps the current results interactive while the new
    // ones stream in, not because it affects scroll (measured above: it does not).
    //
    // Regression history: docs/15 §0c fixed this once; the audit's loading.tsx reintroduced it
    // and the owner reported it a second time (docs/15 §0h).
    startTransition(() => {
      router.push(buildExploreHref(current, { state: next, page: 1 }), { scroll: false });
    });
  }

  const peekLabel = current.state
    ? `${stateLabel ?? current.state} · ${pluralize(result.total, "temple")}`
    : "Pick a state";

  return (
    <div className="mt-8">
      <div className="mb-5" inert={sheetModal || undefined}>
        <RegionPills active={activeRegion} onChange={setActiveRegion} />
      </div>

      {/* Desktop: two-pane, 60/40 (docs/07 §3) */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-[60%_minmax(0,1fr)]">
        <div>
          <IndiaMap
            counts={counts}
            selectedSlug={current.state}
            activeRegion={activeRegion}
            onSelect={handleSelectState}
          />
          <MapAttribution className="mt-4" />
        </div>
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto lg:sticky lg:top-24">
          <MapResultsColumn current={current} stateLabel={stateLabel} result={result} counts={counts} />
        </div>
      </div>

      {/* Mobile: sticky map strip + bottom sheet (docs/05 §6, docs/03 §6.8) */}
      <div className="lg:hidden">
        <div
          inert={sheetModal || undefined}
          className="sticky top-16 z-20 flex h-[40vh] items-center justify-center overflow-hidden rounded-card border border-line bg-canvas-soft py-3"
        >
          <IndiaMap
            counts={counts}
            selectedSlug={current.state}
            activeRegion={activeRegion}
            onSelect={handleSelectState}
            fitToHeight
          />
        </div>
        {/* Attribution ships with the map on mobile too (docs/07 §2.4, §11). */}
        <div inert={sheetModal || undefined}>
          <MapAttribution className="mt-3" />
        </div>
        <BottomSheet peekLabel={peekLabel} onModalChange={setSheetModal}>
          <MapResultsColumn current={current} stateLabel={stateLabel} result={result} counts={counts} />
        </BottomSheet>
      </div>
    </div>
  );
}
