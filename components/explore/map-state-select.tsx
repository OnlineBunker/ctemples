"use client";

import { useRouter } from "next/navigation";
import { INDIA_STATES } from "@/lib/india-geo";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * The guaranteed, always-visible state selector for map mode (docs/07 §5#3): "the map
 * never stands alone — the results column (or bottom sheet) always offers the same
 * selection via a state list/select." This is the path for touch, zoom, and pointer users
 * who can't reliably hit a tiny polygon; it lists all 36 geographies (with counts), not
 * just the ones with temples, so it mirrors the map exactly.
 */
export function MapStateSelect({
  current,
  counts,
}: {
  current: ParsedExploreParams;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="map-state-select"
        className="shrink-0 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted"
      >
        Jump to state
      </label>
      <select
        id="map-state-select"
        value={current.state ?? ""}
        onChange={(e) => {
          const slug = e.target.value || undefined;
          // Preserve scroll — see explore-map-view.tsx's handleSelectState.
          router.push(buildExploreHref(current, { state: slug, page: 1 }), { scroll: false });
        }}
        className="min-w-0 flex-1 rounded-full border border-line-strong bg-canvas px-3 py-2 text-sm text-ink focus-visible:border-magenta focus-visible:outline-none"
      >
        <option value="">All of India</option>
        {INDIA_STATES.map((s) => {
          const count = counts[s.slug] ?? 0;
          return (
            <option key={s.slug} value={s.slug}>
              {s.name}
              {count > 0 ? ` (${count})` : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}
