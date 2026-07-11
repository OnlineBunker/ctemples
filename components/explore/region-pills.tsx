"use client";

import { REGION_ORDER, REGION_META, regionIconPath } from "@/lib/regions";
import type { Region } from "@/lib/types";

/**
 * Map-mode region lens (docs/07 §3) — a client-side filter, never a URL param (docs/02
 * §3.6): dims non-matching states on the map without affecting the shareable URL. "All"
 * resets. Real buttons in a `role="group"`.
 */
export function RegionPills({
  active,
  onChange,
}: {
  active: Region | "all";
  onChange: (region: Region | "all") => void;
}) {
  const pillClass = (isActive: boolean) =>
    `inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
      isActive
        ? "border-transparent bg-magenta-soft text-magenta-deep"
        : "border-line-strong bg-canvas text-plum hover:border-magenta hover:text-magenta"
    }`;

  return (
    <div role="group" aria-label="Filter map by region" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={active === "all"}
        onClick={() => onChange("all")}
        className={pillClass(active === "all")}
      >
        All
      </button>
      {REGION_ORDER.map((region) => (
        <button
          key={region}
          type="button"
          aria-pressed={active === region}
          onClick={() => onChange(region)}
          className={pillClass(active === region)}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d={regionIconPath(region)} fill="none" stroke="currentColor" strokeWidth={1.75} />
          </svg>
          {REGION_META[region].label}
        </button>
      ))}
    </div>
  );
}
