"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { ExploreMapView } from "./explore-map-view";

/**
 * Lazy boundary for the map view (docs/05 §6: "list mode never pays for it"). A
 * server-side `next/dynamic` in the page did NOT split the map out — IndiaMap, the region
 * pills, the Framer Motion sheet, and the ~65KB geometry all landed in the /explore route's
 * own page chunk, downloaded on every list-mode visit too. Deferring behind a client
 * boundary with `ssr: false` yields a genuinely separate async chunk that only loads when
 * map mode renders. The trade is that map mode renders client-side only — acceptable
 * because the map is an interactive instrument and its deep-links canonicalize to list mode
 * for SEO (docs/02 D4), so it carries no SSR/indexing obligation.
 */
const Lazy = dynamic(() => import("./explore-map-view").then((m) => m.ExploreMapView), {
  ssr: false,
  // Static placeholder (no ambient animation — docs/08) that reserves the map's height to
  // avoid layout shift while the chunk loads.
  loading: () => (
    <div
      className="mt-8 min-h-[60vh] rounded-card border border-line bg-canvas-soft"
      role="status"
      aria-label="Loading map"
    />
  ),
});

export function ExploreMapViewLazy(props: ComponentProps<typeof ExploreMapView>) {
  return <Lazy {...props} />;
}
