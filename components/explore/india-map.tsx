"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { INDIA_STATES, INDIA_VIEWBOX, CALLOUT_STATE_SLUGS } from "@/lib/india-geo";
import { STATE_REGION, REGION_ORDER } from "@/lib/regions";
import type { Region } from "@/lib/types";

/**
 * The India map (docs/07 §3–6, D17). An inline SVG of all 36 states/UTs — a navigation
 * instrument, not GIS: no tiles, no zoom/pan, no third-party map JS. Every rule here is
 * the canonical interaction matrix from docs/07 §4; this file is the only place it's
 * implemented.
 */

const CALLOUT_RADIUS = 20; // ~12 CSS px at the assumed ~0.6px/viewBox-unit render scale (docs/07 §2.2 note)
const CALLOUT_HIT_RADIUS = 26; // enlarged transparent tap target over the marker (docs/07 §5#1)
const HIT_STROKE_WIDTH = 8; // expanded invisible hit area (docs/07 §5#2)
const BOUNDARY_TRACE_MS = 350; // docs/08 §5#2

/**
 * Small-state targeting (owner report 2026-07-30: "Delhi is hard to click").
 *
 * `CALLOUT_STATE_SLUGS` is generated with an `area < 122` threshold whose comment derives it
 * from "44px²" — but WCAG 2.5.8's target is 44×44 px, i.e. ~1936 px² ≈ 5400 viewBox-unit².
 * The generated set therefore only covered four near-invisible UTs and missed Delhi (area
 * 158), Goa (356), Sikkim (768) and Tripura (1089), all of which render well under a
 * finger-sized target. Rather than hand-edit the generated artifact, both thresholds are
 * applied here from the exported `area` field:
 *
 *  • `MARKER_AREA` — a state this small is effectively a dot, so it also gets a VISIBLE disc.
 *  • `EASY_TARGET_AREA` — gets an enlarged invisible hit circle, rendered in a layer ABOVE
 *    every polygon so a small state always wins a click where it overlaps a large neighbour.
 *
 * Neither changes the geometry, and no polygon is ever transformed (D17).
 */
const MARKER_AREA = 220;
const EASY_TARGET_AREA = 1200;

/** Hover/focus magnifier for small states — the "zoom in" affordance, decorative only. */
const LENS_RADIUS = 96;
const LENS_ZOOM = 4.5;
const VIEWBOX_W = 1000;
const VIEWBOX_H = 1100;

export interface MapStateDatum {
  slug: string;
  name: string;
  count: number;
}

export function IndiaMap({
  counts,
  selectedSlug,
  activeRegion,
  onSelect,
  fitToHeight = false,
}: {
  /** slug -> temple count (0 for a state present in geometry but absent from data, D9). */
  counts: Record<string, number>;
  selectedSlug?: string;
  activeRegion: Region | "all";
  onSelect: (slug: string) => void;
  /** Mobile's 40vh sticky strip (docs/05 §6) scales to the available height instead of
   *  the available width. */
  fitToHeight?: boolean;
}) {
  const reduce = useReducedMotion();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const traceRefs = useRef<Record<string, SVGPathElement | null>>({});
  const prevSelected = useRef<string | undefined>(undefined);

  const states: MapStateDatum[] = useMemo(
    () => INDIA_STATES.map((s) => ({ slug: s.slug, name: s.name, count: counts[s.slug] ?? 0 })),
    [counts],
  );

  // Unique per instance: the desktop pane and the mobile strip both mount an IndiaMap, so a
  // hardcoded clipPath id would be duplicated in the document and the lens could clip wrong.
  const lensClipId = `lens-clip-${useId().replace(/:/g, "")}`;

  // Union of the generated set and anything under the visible-marker threshold (see above),
  // so Delhi et al. get a disc without touching the generated geometry file.
  const calloutSet = useMemo(() => {
    const set = new Set(CALLOUT_STATE_SLUGS);
    for (const s of INDIA_STATES) if (s.area < MARKER_AREA) set.add(s.slug);
    return set;
  }, []);

  /** States that need a finger-sized hit target (a superset of `calloutSet`). */
  const easyTargets = useMemo(
    () => INDIA_STATES.filter((s) => s.area < EASY_TARGET_AREA),
    [],
  );
  const easyTargetSet = useMemo(() => new Set(easyTargets.map((s) => s.slug)), [easyTargets]);

  // Region cluster layer (docs/07 §3): one circle per region, at the average label
  // point of its member states, radius scales with the region's total temple count.
  const clusters = useMemo(() => {
    return REGION_ORDER.map((region) => {
      const members = INDIA_STATES.filter((s) => STATE_REGION[s.name] === region);
      const cx = members.reduce((sum, s) => sum + s.labelPoint[0], 0) / members.length;
      const cy = members.reduce((sum, s) => sum + s.labelPoint[1], 0) / members.length;
      const count = members.reduce((sum, s) => sum + (counts[s.slug] ?? 0), 0);
      const r = 8 + 10 * Math.log(count + 1);
      return { region, cx, cy, r };
    });
  }, [counts]);

  // Boundary-trace micro-interaction (docs/08 §5#2): a one-shot stroke-dasharray trace
  // when a state is newly selected. Skipped under reduced motion (instant fill instead).
  useEffect(() => {
    if (reduce || !selectedSlug || selectedSlug === prevSelected.current) {
      prevSelected.current = selectedSlug;
      return;
    }
    prevSelected.current = selectedSlug;
    const el = traceRefs.current[selectedSlug];
    if (!el) return;
    const length = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    // Force a reflow so the transition below actually animates from the values just set.
    void el.getBoundingClientRect();
    el.style.transition = `stroke-dashoffset ${BOUNDARY_TRACE_MS}ms cubic-bezier(0.22,1,0.36,1)`;
    el.style.strokeDashoffset = "0";
  }, [selectedSlug, reduce]);

  function announceSelection(state: MapStateDatum | null) {
    setAnnouncement(state ? `Showing ${state.count} temples in ${state.name}.` : "");
  }

  function handleSelect(state: MapStateDatum) {
    onSelect(state.slug);
    announceSelection(selectedSlug === state.slug ? null : state);
  }

  function handleKeyDown(e: KeyboardEvent<SVGGElement>, state: MapStateDatum) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(state);
    }
  }

  const hoveredState = hoveredSlug ? states.find((s) => s.slug === hoveredSlug) : null;
  const selectedState = selectedSlug ? states.find((s) => s.slug === selectedSlug) : null;

  // The magnifier only fires for states too small to aim at — showing it over Rajasthan
  // would just be in the way. Placed up-and-right of the state, then clamped inside the
  // viewBox so it never spills out of the frame near an edge (Delhi, Sikkim, Lakshadweep).
  const lens = useMemo(() => {
    if (!hoveredSlug || !easyTargetSet.has(hoveredSlug)) return null;
    const geo = INDIA_STATES.find((g) => g.slug === hoveredSlug);
    const datum = states.find((s) => s.slug === hoveredSlug);
    if (!geo || !datum) return null;
    const [px, py] = geo.labelPoint;
    const margin = LENS_RADIUS + 6;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    return {
      slug: geo.slug,
      px,
      py,
      cx: clamp(px + LENS_RADIUS + 40, margin, VIEWBOX_W - margin),
      cy: clamp(py - LENS_RADIUS - 40, margin, VIEWBOX_H - margin),
    };
  }, [hoveredSlug, easyTargetSet, states]);
  // The floating chip (docs/07 §4's "selected-state label" rule + hover tooltip) shows
  // the selected state once one is picked; otherwise the lightweight hover tooltip.
  const chipState = selectedState ?? hoveredState;
  const chipGeo = chipState ? INDIA_STATES.find((s) => s.slug === chipState.slug) : null;

  return (
    <div className={fitToHeight ? "relative h-full" : "relative"}>
      {/* Parallel list (docs/07 §6) — the REAL screen-reader contract, guaranteed to
          work regardless of how a given screen reader handles the SVG below. Precedes
          the SVG in DOM order; identical labels/behavior. Per docs/07 §12's anti-pattern
          note, the default is "both wired" (the SVG polygons stay independently
          interactive too, not aria-hidden) — accepting a possible double tab-stop for
          now rather than unilaterally picking a single SR strategy. */}
      <ul className="sr-only">
        {states.map((s) => {
          // Mirror the polygon's region-lens gate (docs/07 §4 dimmed row) so the two paths
          // have identical behavior — a state the active region pill dims is non-selectable
          // for SR users too, not just for mouse/keyboard users on the SVG.
          const dimmed =
            activeRegion !== "all" && STATE_REGION[s.name] !== activeRegion && selectedSlug !== s.slug;
          return (
            <li key={s.slug}>
              <button
                type="button"
                aria-pressed={selectedSlug === s.slug}
                disabled={dimmed}
                onClick={() => !dimmed && handleSelect(s)}
              >
                {s.name} — {s.count} {s.count === 1 ? "temple" : "temples"}
              </button>
            </li>
          );
        })}
      </ul>

      <svg
        viewBox={INDIA_VIEWBOX}
        role="group"
        aria-label="Map of India by state"
        className={fitToHeight ? "mx-auto h-full w-auto" : "h-auto w-full"}
      >
        {states.map((s) => {
          const geo = INDIA_STATES.find((g) => g.slug === s.slug)!;
          const isSelected = selectedSlug === s.slug;
          const isHovered = hoveredSlug === s.slug;
          const stateRegion = STATE_REGION[s.name];
          // The current selection is never dimmed by an unrelated region-pill filter —
          // otherwise the map would show the selected state as inactive/unavailable
          // while the results column still displays its temples, a visible mismatch.
          // Deselecting must also stay reachable without first resetting the pill to "All".
          const isDimmed = activeRegion !== "all" && stateRegion !== activeRegion && !isSelected;
          const isCallout = calloutSet.has(s.slug);

          // The interaction matrix (docs/07 §4) — driven by React state (hoveredSlug
          // covers both mouse hover and keyboard focus, set by the same handlers below)
          // rather than CSS pseudo-classes, since the fill must also react to
          // isSelected/isDimmed together. Presentation attributes transition smoothly
          // via the `transition-[fill,stroke]` class regardless of what changed them.
          const fill = isDimmed ? "#F4EADF" : isSelected ? "#E5006D" : isHovered ? "#FCE0EE" : "#F4EADF";
          const stroke = isDimmed ? "#FFFFFF" : isSelected ? "#B80057" : isHovered ? "#E5006D" : "#FFFFFF";
          const strokeWidth = isSelected || isHovered ? 1.5 : 1;

          return (
            <g
              key={s.slug}
              tabIndex={isDimmed ? -1 : 0}
              role="button"
              aria-label={`${s.name} — ${s.count} ${s.count === 1 ? "temple" : "temples"}`}
              aria-pressed={isSelected}
              aria-hidden={isDimmed || undefined}
              onClick={() => !isDimmed && handleSelect(s)}
              onKeyDown={(e) => !isDimmed && handleKeyDown(e, s)}
              onMouseEnter={() => !isDimmed && setHoveredSlug(s.slug)}
              onMouseLeave={() => setHoveredSlug((cur) => (cur === s.slug ? null : cur))}
              onFocus={() => !isDimmed && setHoveredSlug(s.slug)}
              onBlur={() => setHoveredSlug((cur) => (cur === s.slug ? null : cur))}
              className={
                isDimmed
                  ? "pointer-events-none"
                  : "cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-magenta focus-visible:outline-offset-2"
              }
              style={{ opacity: isDimmed ? 0.4 : 1 }}
            >
              <path
                ref={(el) => {
                  traceRefs.current[s.slug] = el;
                }}
                className="transition-[fill,stroke] duration-150"
                d={geo.path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fillRule="evenodd"
              />
              {/* Expanded invisible hit path (docs/07 §5#2) — forgiving touch/click target
                  along borders; clicks here bubble to the same <g> handler above. */}
              <path
                d={geo.path}
                fill="none"
                stroke="transparent"
                strokeWidth={HIT_STROKE_WIDTH}
                fillRule="evenodd"
                style={{ pointerEvents: isDimmed ? "none" : "stroke" }}
              />
              {isCallout ? (
                <>
                  <circle
                    cx={geo.labelPoint[0]}
                    cy={geo.labelPoint[1]}
                    r={CALLOUT_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* The marker — not the near-invisible sliver polygon — is the real tap
                      target (docs/07 §5#1): an enlarged transparent hit circle over it, whose
                      clicks bubble to this same <g>. No leader line is drawn: the marker
                      renders at labelPoint, coincident with the geography, so there is nothing
                      to bridge (the offset-marker-with-connector case doesn't apply here). */}
                  <circle
                    cx={geo.labelPoint[0]}
                    cy={geo.labelPoint[1]}
                    r={CALLOUT_HIT_RADIUS}
                    fill="transparent"
                    style={{ pointerEvents: isDimmed ? "none" : "all" }}
                  />
                </>
              ) : null}
            </g>
          );
        })}

        {/* Cluster layer (docs/07 §3) — non-interactive overview density cue, hidden
            once a state is selected (it's an overview aid, not a selection aid). */}
        {!selectedSlug
          ? clusters.map((c) => (
              <circle
                key={c.region}
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                fill="#E5006D"
                opacity={0.25}
                pointerEvents="none"
                aria-hidden
              />
            ))
          : null}

        {/* Small-state hit layer — LAST, so it paints above every polygon and therefore wins
            the click wherever a tiny state's target overlaps a large neighbour. Purely a
            target: invisible, and aria-hidden because the <g> polygons and the parallel
            sr-only list above already expose each state exactly once. */}
        <g aria-hidden>
          {easyTargets.map((geo) => {
            const s = states.find((x) => x.slug === geo.slug);
            if (!s) return null;
            const isSelected = selectedSlug === geo.slug;
            const isDimmed =
              activeRegion !== "all" && STATE_REGION[geo.name] !== activeRegion && !isSelected;
            if (isDimmed) return null;
            return (
              <circle
                key={geo.slug}
                cx={geo.labelPoint[0]}
                cy={geo.labelPoint[1]}
                r={CALLOUT_HIT_RADIUS}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHoveredSlug(geo.slug)}
                onMouseLeave={() => setHoveredSlug((cur) => (cur === geo.slug ? null : cur))}
              />
            );
          })}
        </g>

        {/* Magnifier lens — appears while a SMALL state is hovered or keyboard-focused, so you
            can see what you're aiming at before clicking. Decorative and inert: it never
            intercepts a pointer, and the base polygons are never transformed (D17) — the lens
            draws its own scaled copy of the geometry inside a clipped circle. */}
        {lens ? (
          <g pointerEvents="none" aria-hidden>
            <defs>
              <clipPath id={lensClipId}>
                <circle cx={lens.cx} cy={lens.cy} r={LENS_RADIUS} />
              </clipPath>
            </defs>
            <circle cx={lens.cx} cy={lens.cy} r={LENS_RADIUS} fill="#FBF6F0" />
            <g clipPath={`url(#${lensClipId})`}>
              <g
                transform={`translate(${lens.cx} ${lens.cy}) scale(${LENS_ZOOM}) translate(${-lens.px} ${-lens.py})`}
              >
                {INDIA_STATES.map((g2) => (
                  <path
                    key={g2.slug}
                    d={g2.path}
                    fill={g2.slug === lens.slug ? "#E5006D" : "#F4EADF"}
                    stroke={g2.slug === lens.slug ? "#B80057" : "#FFFFFF"}
                    strokeWidth={g2.slug === lens.slug ? 0.6 : 0.4}
                    fillRule="evenodd"
                  />
                ))}
              </g>
            </g>
            {/* No label inside the lens: the floating chip below already names the state and
                its count, and a second copy clipped to the ring only added noise. */}
            <circle
              cx={lens.cx}
              cy={lens.cy}
              r={LENS_RADIUS}
              fill="none"
              stroke="#E5006D"
              strokeWidth={2}
            />
          </g>
        ) : null}
      </svg>

      {/* Floating label chip (docs/07 §4 — never white-on-magenta text inside the
          selected fill; the name renders here instead, plus the hover tooltip). */}
      {/* docs/07 §4: the floating chip is desktop-only ("on desktop, as a floating chip
          anchored near the state") — mobile relies on the results-sheet H2 alone. It's
          also positioned as a % of the SVG's own box, which only spans the full width
          of this container in the (non-fitToHeight) desktop layout. */}
      {!fitToHeight && chipState && chipGeo ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-full bg-canvas px-3 py-1.5 font-mono text-xs text-plum shadow-md"
          style={{
            left: `${(chipGeo.labelPoint[0] / 1000) * 100}%`,
            top: `${(chipGeo.labelPoint[1] / 1100) * 100}%`,
          }}
        >
          {chipState.name} · {chipState.count} {chipState.count === 1 ? "temple" : "temples"}
        </div>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
