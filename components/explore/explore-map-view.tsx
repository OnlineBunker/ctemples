"use client";

import { useMemo, useState } from "react";
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
    router.push(buildExploreHref(current, { state: next, page: 1 }));
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
