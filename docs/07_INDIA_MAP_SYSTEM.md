# 07 — India Map System

> **CTemples Master Specification, file 7 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: UX_SPEC §2.3.2, DESIGN_SYSTEM_V2 map clauses, PROJECT_CONTEXT §14.3 (open question — now resolved). Rulings carried: D9, D16, D17, D18, D22#2.

---

## 1. What the map is (and is not)

An inline SVG of India with 36 interactive state/UT polygons and a region-cluster density layer. It is a **navigation instrument**, not GIS: no tiles, no zoom/pan, no API keys, no third-party map JS — ever, at any scale. Geographic truth lives in the polygons and temple coordinates; everything else is presentation.

## 2. Geometry pipeline (D16)

### 2.1 Source
**datameet/maps** (github.com/datameet/maps) state boundaries — community-standard, **Survey-of-India-aligned** (full J&K/Ladakh depiction, which is the legally required representation for an India-market product; Natural Earth is rejected because it draws de-facto international lines). License: **CC-BY 2.5 IN** → attribution is mandatory (§2.4).

### 2.2 Build pipeline (one-time script, committed output)
`scripts/build-india-geo.mjs`:
1. Input: datameet states GeoJSON (post-2019 reorganization: 28 states + 8 UTs = 36 features; merge/rename to match the canonical state names used in `data/temples.ts` — e.g. "Jammu and Kashmir", "Ladakh").
2. Simplify: mapshaper, Visvalingam weighted, **keep-shapes**, retain ~4–5% of points.
3. Project once (equirectangular with lat-correction is sufficient at this display size), scale into a **1000×1100 viewBox** (portrait aspect fits India), round coordinates to 1 decimal.
4. Emit `lib/india-geo.ts`: `INDIA_VIEWBOX`, and `INDIA_STATES: { slug, name, path, labelPoint: [x,y], area: number }[]` — slugs must equal `slugify(stateName)` so they join `getStateCounts()` output directly.
5. Budget: generated file ≤80KB raw. If over, drop to 3% retention before any other measure.
Also emit `stateCentroids` for the detail-page plot (§7) and tile silhouettes (§8).

### 2.3 Coordinate → state integrity
`checkCoordinateInState` (point-in-polygon against these polygons) joins the validation suite (file 09 §6) — the map and the data can never disagree silently.

### 2.4 Attribution (license obligation)
- Map-mode caption (mono micro, ink-muted): "Map data © DataMeet community maps (CC-BY 2.5 IN)" with a link.
- A matching credit line on `/about` and in the README. This ships **with** the map, not later.

## 3. Anatomy of map mode

```
[region pills: All · North · South · East · West · Northeast · Central]
[ SVG map (60% width desktop / 40vh sticky mobile) | results column (40%) ]
[ caption: attribution ]
```
- **Region pills:** client-side lens (never a URL param — file 02 §3.6). Active region: its states stay interactive; all others get the `dimmed` treatment. "All" resets. Pills are real buttons in a `role="group"` labeled "Filter map by region"; each pill shows the region icon (paths from `lib/regions.ts::REGION_ICON_PATHS`) + label; active pill = magenta-soft bg + magenta-deep text.
- **Cluster layer:** one circle per region centered on the region's visual centroid, radius `r = 8 + 10 × log(count + 1)` px (count = temples in region), fill magenta at 25% opacity, non-interactive (`pointer-events: none`, `aria-hidden`). Scales from 15 records to 20k without redesign. Circles hide when a state is selected (they're an overview cue, not a selection aid).
- **Results column:** file 05 §6 owns it (state header, scoped search, cards, pagination).

## 4. State interaction matrix (D17 — canonical)

| State | Fill | Stroke | Extras |
|---|---|---|---|
| rest | `porcelain-deep #F4EADF` | 1px `#FFFFFF` | |
| hover / focus | `magenta-soft #FCE0EE` | 1.5px `magenta` | fill transition 150ms; cursor pointer |
| focus-visible (keyboard) | as hover | as hover | + global 2px magenta outline, 2px offset, on the state `<g>` |
| **selected** | `magenta #E5006D` | 1.5px `magenta-deep` | one-shot 350ms boundary trace (D22#2); label rule below |
| dimmed (region lens) | `porcelain-deep` at 40% opacity | 1px white | `pointer-events: none`, removed from tab order |
| zero-temple state | rest style | rest style | fully rendered (D9), clickable → empty-state in results column |

**Rules:**
- **No shadows, no transforms, no filters on polygons** — fill/stroke/opacity only (perf + seam-artifact avoidance; elevation is an HTML concept, file 03 §5).
- **Selected-state label:** never white-on-magenta inside the fill (4.61:1, no margin at label sizes). The selected state's name renders in the results-column header (H2) and, on desktop, as a floating chip anchored near the state — canvas bg, plum text, `shadow-md`. Nothing is written inside the magenta fill.
- Exactly one state selected at a time; clicking the selected state deselects; selection syncs to `?state=` in the URL (round-trip law, file 02).
- Hover shows a lightweight `<title>`-equivalent tooltip chip: "{State} · {count} temples" (derived).

## 5. Touch & small-geometry strategy

1. **Callout markers for sub-target geographies:** any state/UT whose rendered area < 44px² at the default desktop size (Delhi, Chandigarh, Puducherry, Lakshadweep, Andaman & Nicobar, Goa, Sikkim, Dadra & Nagar Haveli and Daman & Diu — final list computed from `area` at build) renders a fixed 12px circle marker at `labelPoint` with a leader line, styled by the same state matrix; the marker (not the sliver polygon) is the interactive element with an invisible 44×44 hit area.
2. **Expanded hit paths:** every polygon gets `stroke-width: 8; stroke: transparent; pointer-events: stroke` on a duplicate hit-path so borders are forgiving on touch.
3. **The map never stands alone:** the results column (or bottom sheet) always offers the same selection via a state list/select — the guaranteed path for touch, zoom, and screen-reader users.

## 6. Accessibility contract

- Each interactive state: `<g role="button" tabindex="0" aria-label="{State} — {count} temples" aria-pressed={selected}>`, activated by Enter/Space. Tab order = alphabetical by state name (predictable, matches the visually-hidden list).
- The SVG itself: `role="group"`, `aria-label="Map of India by state"`.
- **Parallel list (the real SR contract):** a visually-hidden `<ul>` of 36 state links/buttons with identical labels and behavior precedes the SVG in DOM order. Screen-reader users never need the polygons.
- Live region announces selection: "Showing {count} temples in {State}."
- Reduced motion: no boundary trace, no fill transition (instant states).

## 7. Detail-page map (D18)

A **state-scale** plot on the temple page (file 06 §8): the temple's state polygon (rest fill, magenta 1.5px outline), a 10px magenta temple dot with a 20px `magenta-soft` halo at the temple's projected coordinates, up to 5 `nearbyAttractions` as 6px plum dots with mono labels, a mono coordinates caption, and a "Get directions →" secondary button linking to `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` (and `geo:{lat},{lng}` offered on mobile). `aria-label` on the figure: "Map of {State} showing {Temple}". No tiles, no iframe, no India-wide dot.

## 8. State silhouettes for tiles

The homepage StateTile's icon slot upgrades from the placeholder gopuram to the state's actual silhouette: build script emits each state's path normalized into a 48×48 box (`stateSilhouettes`), rendered as a single `currentColor` shape tinted by region pigment (`{pigment}` stroke / `{pigment}14` fill chip, per file 03 §2.1). Falls back to the gopuram mark if a silhouette is degenerate at 48px (the callout-marker states may be).

## 9. Data seam

The map consumes exactly two inputs: `INDIA_STATES` (build-time geometry) and `getStateCounts()` (derived counts, existing seam). Join key = state slug. No component hardcodes a state list; a state present in geometry but absent from data simply has count 0 (D9).

## 10. Rationale
SVG-over-tiles holds at every scale because the map answers "which state?", never "which street?" — density is communicated by region clusters and counts, and per-temple precision belongs to the detail page's state-scale plot and the external directions link. datameet satisfies the one non-negotiable constraint (Survey-of-India boundaries) that both Natural Earth and OSM-derived world datasets fail.

## 11. Acceptance criteria
- `lib/india-geo.ts` ≤80KB; map-mode JS (map + sheet) loads only under `?view=map`; Lighthouse perf ≥85 in map mode.
- All 36 geographies render; every one reachable and operable by keyboard alone and by touch (44px effective targets, callouts included).
- Selecting any state updates URL, results column, and live region; refresh restores it (round-trip law).
- Attribution caption visible in map mode; `/about` carries the credit.
- Polygon interaction shows no layout shift, no shadow/transform, and holds 60fps hover on a mid-range device.

## 12. Anti-patterns
- Leaflet/Mapbox/Google "just for zoom"; raster India images; per-temple dots on the national map (20k dots is soup — clusters + state selection is the model).
- Writing labels inside selected fills; tinting states by region pigment at rest (rest is neutral; color = interaction state).
- A tab stop per polygon *plus* per list item without coordination (the hidden list and polygons must not double-announce; the SVG is `aria-hidden` **only if** the team chooses list-only SR strategy — default is both wired, tested with VoiceOver, whichever announces cleanly wins and is recorded here via amendment).

## 13. What Sonnet does next
Phase 4 (file 13): run the geometry script (checked-in output), build `IndiaMap` + region pills + cluster layer + callout markers against §3–6 verbatim, wire `?state=`/results column per file 05, add the boundary-trace micro-interaction, ship the attribution caption, and add `checkCoordinateInState` to the validators. The silhouette upgrade (§8) is a separate line item in the same phase.
