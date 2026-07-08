# CTemples — Redesign Plan

> An audit and migration plan that compares the current implementation with `CLAUDE.md` (project vision), `UX_SPEC.md` (UX specification), and `DESIGN_SYSTEM_V2.md` (design system V2). For every file, page, and component: keep, modify, replace, or delete. Effort estimates are in "person-days" assuming one engineer working in isolation; a small team can compress these.

---

## Reading guide

- **KEEP** — the file/component is on-spec and reusable. Mostly token changes, no logic changes.
- **MODIFY** — the file/component is partly on-spec; the structure stays but content, behavior, or styling changes.
- **REPLACE** — the file/component is off-spec and must be rewritten. The new version is described.
- **DELETE** — the file/component is no longer needed and should be removed.
- **ADD** — the file/component does not exist yet and must be created.

Effort estimates use the scale: XS (≤0.25 d), S (0.5 d), M (1 d), L (2 d), XL (3 d), XXL (5+ d).

---

## 1. Audit summary

The current codebase is the older "nightstone" design — a twilight-temple, cinematic, video-forward identity. The approved direction is the light-mode, vibrant, tourism-evocative identity in `CLAUDE.md`, `UX_SPEC.md`, and `DESIGN_SYSTEM_V2.md`. Most components are structurally sound (Tailwind classes, accessibility, motion-gating) and survive the pivot as **KEEP** + token swap. A smaller set needs **MODIFY** (palette-specific styling, content changes, sort/filter changes). A small set is **REPLACE** (parallax hero → static hero, region mandala → deity tiles, dual carousel set → state strip + chips, list-only Explore → list+map, current detail dossier → reordered sections). A few are **DELETE** (3D embers, the 3-button nav, the animated scroll cue).

The data layer (`lib/`) and the static-temple-records contract are the project's strongest foundation — almost entirely **KEEP**.

---

## 2. Design tokens (Phase 0)

### 2.1 `tailwind.config.ts` — REPLACE (theme)

- **Effort:** M.
- **Current:** `nightstone.*`, `brass.*`, `vermilion.*`, `marigold.*`, `verdigris.*`, `lapis.*`, `jade.*`, `limewash`, `ash`, `stone`. Backgrounds `sanctum-glow`, `grain`. Shadow `lift`, `glow`. Keyframes `diya-flicker`, `mandala-spin`. Custom `display-xl/lg/md` clamp sizes. Letter-spacing `label`. Border-radius `card`.
- **Target (per `DESIGN_SYSTEM_V2.md` §1.1–1.3):**
  - Core: `canvas` (#FFFFFF), `canvas-soft` (#FAF7F0), `ink` (#1A1A1A), `ink-muted` (#5A5A5A), `ink-subtle` (#8A8A8A), `line` (#E5E0D6), `line-strong` (#C9C2B0).
  - Brand: `temple-red` (#C62828), `temple-red-soft` (#FBE9E7), `temple-red-deep` (#8E1F1F), `sand-yellow` (#E6C068), `sand-yellow-soft` (#FBF1D9), `sand-yellow-deep` (#B68A3C), `warm-gold` (#B8860B), `warm-gold-soft` (#F5E9C8).
  - Functional: `success` (#2E7D32), `warning` (#E6A23C), `info` (#3E6CC4), `danger` (alias of temple-red).
  - Region: `region-north` (#3E6CC4), `region-south` (#C62828, alias), `region-east` (#3E9385), `region-west` (#E6A23C), `region-northeast` (#4FA06B), `region-central` (#B8860B, alias).
  - Deity: 6 hue tokens for the deity icon accents (per §1.5 of the design system).
  - Drop: `nightstone.*`, `limewash`, `ash`, `stone`, `vermilion`, `marigold`, `verdigris`, `lapis`, `jade`, `brass` (rename to `warm-gold`).
- **Drop:** keyframes `diya-flicker`, `mandala-spin`. Background `sanctum-glow`, `grain`. Shadow `lift`, `glow`.
- **Add:** shadow `sm`, `md`, `lg`, `xl`, `focus`; spacing tokens `space-0` … `space-32`; max-width tokens `container-tight`, `container-default`, `container-wide`, `container-max`; `motion-*` timing tokens (or keep them as CSS variables in `globals.css`).
- **Keep:** `fontFamily.display/body/mono`, font-size `display-xl/lg/md` (refine per §2.2 of the design system), `letterSpacing.label` (rename or replace), `borderRadius.card`.

### 2.2 `app/globals.css` — REPLACE (palette + view transitions)

- **Effort:** M.
- **Current:** `bg-nightstone`, `text-limewash`, view-transition keyframes, scrollbar tint, reduced-motion override, prose-temple, eyebrow, hairline, link-draw, shell, .shell.
- **Target:**
  - **Body:** `bg-canvas text-ink font-body`. Drop the radial-gradient sanctum glow.
  - **Focus ring:** 2-px `temple-red` outline, 2-px offset, no rounded corners.
  - **Selection:** `temple-red-soft` background, `ink` color.
  - **Eyebrow:** uppercase, mono, `temple-red` color (or `warm-gold` for premium sections).
  - **Hairline:** `border-line` 1-px.
  - **Link-draw:** keep the animated underline for inline links (rewire to `temple-red` color and 200 ms).
  - **Prose-temple:** `text-ink/85`, `font-body`, 18 px / 1.7 line-height. Drop the `limewash` reference.
  - **Shell:** keep, change to `px-5 sm:px-8 lg:px-12 max-w-[1280px]`.
  - **View transitions:** keep the recipes, but update selectors if needed. Disable the directional slide and keep only the shared-element morph (per UX spec §1.3, no autoplay).
  - **Reduced motion:** keep the global override; add explicit selectors for `view-transition-group(*)` to disable the morph.

### 2.3 `app/layout.tsx` — MODIFY

- **Effort:** XS.
- **Changes:** drop `themeColor: "#171327"` (replaced by light `themeColor` on the metadata); the `description` stays roughly the same; `skip-to-content` link recolors to `bg-temple-red text-canvas`; default `<title>` shifts to the new thesis.
- **Keep:** font wiring, `Header`, `Footer`, skip-link.

### 2.4 `app/fonts.ts` — KEEP

- **Effort:** 0.
- The three-font pairing (Fraunces / Hanken Grotesk / Space Mono) is preserved. Per design system §2.1, no change.

### 2.5 `app/icon.svg` — MODIFY

- **Effort:** XS.
- The current icon is a stylized gopuram on the nightstone canvas. Replace with a gopuram silhouette on white, drawn in `temple-red` and `warm-gold`. Keep the SVG line-drawing aesthetic.

### 2.6 `DESIGN.md` — REPLACE

- **Effort:** M.
- The current document is the rationale for the nightstone system. Per CLAUDE.md Phase 0, the design rationale must be rewritten to match the new light-mode direction (white / temple red / sand yellow / warm gold). The old content (twilight canvas, brass hairline, pigment box, *prakāra* metaphor) is replaced, not deleted; the "passing inward through thresholds" metaphor survives but is reframed for light mode (e.g. the gopuram threshold still appears, but lit by daylight rather than sanctum glow).

---

## 3. Data and lib layer

The lib layer is the project's strongest foundation. Almost everything is **KEEP**.

### 3.1 `lib/types.ts` — MODIFY

- **Effort:** S.
- **Keep:** the entire `Temple` interface.
- **Add (per UX spec §3.21):**
  - `whyVisit: string` — 3–4 sentences for the "Why visit" section.
  - `tripDuration?: { temples: number; days: number; km: number }` — for the "Plan around" summary.
  - `architecturalStyleSlug: string` — derived slug for the "Same style" section.
  - `media: MediaItem[]` (refactor of `heroImage` + `gallery` per UX spec §3.13 and design system §1, §13).
- **Migration:** keep `heroImage` and `gallery: string[]` for backward compat, or refactor `media` to replace them. The latter is the cleaner target.

### 3.2 `lib/temples.ts` — KEEP

- **Effort:** 0.
- The data-bound public API stays exactly as-is. Names like `getTempleById`, `getFeaturedTemples`, `getRegionCounts`, `getTempleIds`, `getRelatedTemples` map 1:1 to the new spec.

### 3.3 `lib/temple-queries.ts` — MODIFY

- **Effort:** S.
- **Keep:** `findTempleById`, `pickFeatured`, `countByRegion`.
- **Modify:** `pickRelated` — the current score-based "related" (region+state+deity+tag) becomes a more nuanced "similar" set. Add three new pure helpers:
  - `pickByDeity(list, deity, limit)` — same-deity match.
  - `pickByArchitecturalStyle(list, style, limit)` — same-style match.
  - `pickWithinRadius(list, lat, lng, km, limit)` — Haversine distance match.
- **Add:** `haversineKm(a, b)` pure helper (used by `pickWithinRadius`). Unit-test the three new functions and the Haversine.

### 3.4 `lib/filter.ts` — MODIFY

- **Effort:** S.
- **Keep:** `matchesQuery`, `sortTemples`, `collectTags`, `countActiveFilters`, the `TempleFilters` shape.
- **Add:** `sortTemples` needs a "Most visited" option (currently has featured / rating / name / cost). Add it as a synthetic "popularity" sort.
- **Modify:** `SORT_OPTIONS` becomes `[{ key: "rating", label: "Top rated" }, { key: "popularity", label: "Most visited" }, { key: "name", label: "A–Z" }]`. Remove "Featured" and "Lowest cost" from the public sort list (Featured is the default order in absence of a sort; cost was a prototype convenience).
- **Add:** `searchTemples(list, query, options)` — the alias-aware ranked search from UX spec §4. This is a *new* function, not a replacement for `matchesQuery`. It returns `{ results, matchedAliases }`.

### 3.5 `lib/format.ts` — KEEP + ADD

- **Effort:** XS.
- **Keep:** `formatRupees`, `parseRupeeRange`, `cheapestBudget`, `formatDistance`, `formatRating`, `formatCoordinates`, `pluralize`.
- **Add:** `formatRelativeDistance(km)` — "38 km away" / "412 km" / "1,204 km" (used on "Within 100 km" cards on the detail page).

### 3.6 `lib/regions.ts` — MODIFY

- **Effort:** XS.
- **Keep:** `REGION_ORDER`, `regionPigment` function, the `RegionMeta` shape.
- **Modify:** the pigments shift to the new region palette per `DESIGN_SYSTEM_V2.md` §1.4. The `token` field can stay (mapped to the new token names, e.g. `region-north` instead of `lapis`).
- **Add:** `regionIconPath(region)` — returns an SVG path for the region icon (mountain / wave / sun / leaf / star / mandala). This is the "icon + label + position" identity required by the design system.

### 3.7 `lib/validate.ts` — MODIFY

- **Effort:** S.
- **Add:** validators for the new `Temple` fields (`whyVisit`, `architecturalStyleSlug`, `media[]`). The "placeholder dataset" vitest suite grows to include these.

### 3.8 `lib/utils.ts` — MODIFY

- **Effort:** XS.
- **Keep:** `cn`.
- **Modify:** `shimmer` — the base64 SVG uses `nightstone` colors; replace with `canvas-soft`/`line`/`ink-subtle` gradient.

### 3.9 `lib/temple-queries.test.ts`, `lib/filter.test.ts`, `lib/format.test.ts`, `lib/validate.test.ts`, `lib/data.test.ts` — MODIFY

- **Effort:** S (collectively).
- **Keep:** the existing tests.
- **Add:** tests for the new helpers (`pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius`, `haversineKm`, `formatRelativeDistance`, the alias-aware `searchTemples`).

### 3.10 `lib/__fixtures__/` — MODIFY

- **Effort:** XS.
- **Keep:** the existing fixtures.
- **Add:** 1–2 fixtures with new fields populated (`whyVisit`, `architecturalStyleSlug`, `media[]`) so the new code paths are testable.

### 3.11 `data/temples.ts` — MODIFY

- **Effort:** M.
- **Keep:** the 15 temple records.
- **Modify:** each record gets:
  - `whyVisit: "..."` — 3–4 sentences per temple, hand-written.
  - `architecturalStyleSlug: "dravidian" | "nagara" | ...` — derived from the existing `architecturalStyle`.
  - `tripDuration?: { ... }` — optional, populated for ~6 temples.
  - `media: MediaItem[]` — refactor `heroImage` + `gallery` into a single list.
- **Add:** `lat`/`lng` for the existing records are already present (used by the existing `TempleMap`). The new geo-distance helpers use them.

---

## 4. Components — brand

### 4.1 `components/brand/gopuram-mark.tsx` — KEEP

- **Effort:** 0.
- The line-drawn gopuram is on-spec. Used as the brand mark, the divider motif, the back-to-top icon, and the deity-tile decorative element.

### 4.2 `components/brand/divider.tsx` — MODIFY

- **Effort:** XS.
- The current divider has a 6-px gopuram mark between brass-gradient hairlines. Update the hairlines to `line` color (1-px warm-gold at 30% opacity) and recolor the gopuram to `warm-gold`. The 1-px gold hairline at 30% opacity is the section-divider rule from the design system.

### 4.3 `components/brand/mandala-mark.tsx` — KEEP

- **Effort:** 0.
- Decorative only. The 90-second slow rotation is dropped (the design system removes ambient loops), but the SVG itself is useful as a backdrop motif on a premium section.

---

## 5. Components — UI

### 5.1 `components/ui/button.tsx` — MODIFY

- **Effort:** S.
- **Keep:** the `Button` / `ButtonLink` API (`variant`, `size`, `className`).
- **Modify:**
  - Variants: `primary` (temple-red bg, canvas text), `secondary` (canvas bg, ink text, line-strong border), `tertiary` (transparent, temple-red text, hover temple-red-soft), `warm` (warm-gold bg, canvas text), `destructive` (danger bg, canvas text).
  - Sizes: `sm` (32 px), `md` (44 px, default), `lg` (52 px). Add the new `lg`.
  - Drop the `shadow-lift` and the `bg-vermilion-deep` references.
  - Focus ring: 2-px `temple-red` outline, 2-px offset (per design system §3.3).
  - Hover/active: per the hover matrix.

### 5.2 `components/ui/eyebrow.tsx` — KEEP

- **Effort:** XS.
- The eyebrow component (mono, uppercase, brass-colored) is the design system's eyebrow pattern. Recolors to `temple-red` by default with an optional `tone="warm"` for premium sections.

### 5.3 `components/ui/pill.tsx` (Tag, RegionBadge) — MODIFY

- **Effort:** S.
- **Keep:** the `Tag` and `RegionBadge` component APIs.
- **Modify:**
  - `Tag` — light pill: `bg-canvas-soft text-ink border-line`, with hover `border-temple-red text-temple-red`.
  - `RegionBadge` — light surface: the dot recolors to the new region pigments; text recolors to `ink-muted`; the `ring-2 ring-inset ring-black/20` is dropped (it was a dark-mode artifact).
- **Add:** `ActiveFilterChip` — the removable chip used in the active filters row (per design system §8.7).
- **Add:** `DeityBadge` — deity icon + name, for the deity tiles and "By the same deity" cards on the detail page.

### 5.4 `components/ui/section-heading.tsx` — KEEP

- **Effort:** XS.
- The section heading is on-spec. The H2 styling and the optional action slot match the design system. Recolors: `text-ink` instead of `text-limewash`.

### 5.5 `components/ui/rating.tsx` — MODIFY

- **Effort:** XS.
- **Keep:** the `Star` icon and the `aria-label`.
- **Modify:** the brass color becomes `sand-yellow` (filled star) and `ink-muted` for the rating number. On dark photo overlays (hero overlay), the rating remains `limewash` text.

### 5.6 `components/ui/stat.tsx` — MODIFY

- **Effort:** XS.
- **Modify:** the value color from `text-limewash` to `text-ink`; the eyebrow color from `text-limewash/50` to `text-ink-muted`. The four-stat strip on the homepage remains.

### 5.7 `components/ui/stat.tsx` removal of stats strip from homepage — DELETE

- **Effort:** XS.
- The current homepage has a 4-stat strip ("2,000+ temples · 28 states · 6 cultural regions · 100s of festivals"). Per the redesigned homepage (§1 of UX spec), this strip is replaced by the "Trip ideas" section. The `Stat` component itself is **KEEP** for the "Why this temple" callout and the `/about` page stats, but the homepage usage is deleted.

---

## 6. Components — motion

### 6.1 `components/motion/reveal.tsx` (Reveal, Stagger, RevealItem) — MODIFY

- **Effort:** S.
- **Keep:** the three components and their API.
- **Modify:** timing per design system §11.2: reveal duration 350 ms (was 700 ms), stagger 60 ms (was 80 ms), ease `cubic-bezier(0.22, 1, 0.36, 1)` (was `cubic-bezier(0.16, 1, 0.3, 1)`). The blur amount drops from 4 px to 3 px to match the design system.
- **Keep:** `useReducedMotion` gating.

### 6.2 `components/motion/parallax.tsx` — DELETE

- **Effort:** 0.
- The parallax on the home hero is removed (the new hero is a static full-bleed photo with no parallax). The component is no longer used; remove it.

### 6.3 `components/motion/transition-link.tsx` — KEEP

- **Effort:** XS.
- The `TransitionLink` component is used by the card → detail morph and the back link. Keep as-is, with the type API ("nav-forward" / "nav-back") preserved.

### 6.4 `components/motion/view-transition.tsx` — KEEP

- **Effort:** 0.
- Re-export of React's native View Transitions API. Keep.

---

## 7. Components — layout

### 7.1 `components/layout/header.tsx` — REPLACE

- **Effort:** L.
- The current header has 4 nav items (Home / Explore / About / Partner) + a mobile sheet. The new header has:
  - Logo (top-left).
  - Explore ▾ (with a dropdown showing Pilgrimage / Architecture / Discover presets).
  - About (top-level).
  - Search button (opens the header search overlay).
  - Language pill (top-right, with a 8-language dropdown, all but English "Coming soon").
  - Mobile: logo + hamburger; sheet mirrors the desktop nav with expand/collapse for Explore.
- **Styling:** sticky, white surface, 1-px warm-gold hairline at the bottom. No `bg-nightstone-900/70 backdrop-blur-md`. No brass `border-b border-brass/15`.
- **A11y:** skip-to-content is the first focusable element. The Explore dropdown dismisses on outside-click and Esc. The mobile sheet traps focus. The language pill is keyboard-operable.

### 7.2 `components/layout/footer.tsx` — REPLACE

- **Effort:** M.
- The current footer has 3 columns (logo+blurb, "By region", "More"). The new footer has 3 columns:
  - **About:** logo, one-line description, "About" link, "Methodology" link.
  - **Contribute:** "Suggest a temple →" (`/suggest`), "Partner with us →" (`/contact`).
  - **Connect:** social placeholders (UI-only), copyright, "Made in India."
- **Add:** a "v0.1 prototype" tag in the bottom bar.
- **Drop:** the "By region" list of 6 regions (now lives on the homepage state strip and the Explore map).
- **Styling:** white surface, 1-px `line` border-top. No `bg-nightstone-900/50`.

### 7.3 `components/layout/` ADD: language banner (homepage)

- **Effort:** S.
- A thin, full-width, dismissible strip above the header on the homepage only. "Available in 8 Indian languages — coming soon. Notify me →" Dismiss persists in `localStorage` for 30 days.

---

## 8. Components — media

### 8.1 `components/media/temple-image.tsx` — KEEP

- **Effort:** XS.
- The image primitive is correct. The "if no src, fall back to scene" branch is preserved. The `priority` prop is correct.

### 8.2 `components/media/photo-with-fallback.tsx` — KEEP

- **Effort:** XS.
- The Wikimedia `unoptimized` detection is correct. The `onError` fallback to `TempleScene` is correct. The blur-up via `shimmer` is correct; only the shimmer palette updates (see §3.8).

### 8.3 `components/media/temple-scene.tsx` — REPLACE

- **Effort:** L.
- The current `TempleScene` is a stylized night-time scene (deep nightstone sky, vermilion/marigold sun, diya glow). Per the new direction, the procedural scene needs a **daytime** palette:
  - Sky: `canvas-soft` (#FAF7F0) → `canvas` (#FFFFFF) with a sand-yellow horizon.
  - Towers: `ink` (#1A1A1A) silhouette, with `warm-gold` (#B8860B) accents on the ledges.
  - No stars, no moon. A small sun disc in `sand-yellow`.
  - Optional: temple-region accent (the region pigment at 30% opacity) in the foreground.
  - No diya glow.
- **Keep:** the procedural, deterministic-from-seed approach. Each temple still gets a distinct composition.
- **Keep:** the `region` prop, the `variant` prop, the `label` prop.
- **Add:** `mode: "day" | "dusk"` — for the rare cases where a dusk hero is wanted (none in the new spec, but kept for future).
- **Performance:** keep the same file size (~7 KB). The visual is simpler (no gradients needed for the sun, no diya circles).

---

## 9. Components — home

### 9.1 `components/home/hero.tsx` — REPLACE

- **Effort:** XL.
- The current hero is a single, parallax, cinematic, "scroll inward" cue with one H1. The new hero is:
  - A full-bleed photo carousel (no autoplay).
  - 5–6 slides, each with a real photo + eyebrow + H1/H2 + primary CTA + secondary CTA.
  - 16:9 desktop, 4:3 mobile, 60 vh max on mobile.
  - No parallax, no embers, no 3D accent, no `bg-sanctum-glow` gradient, no `bg-grain`.
  - The "scroll inward" cue is deleted.
- **Keep:** the `useReducedMotion` import (still used for the slide transition).
- **Component split:** `Hero` (orchestrator), `HeroSlide` (single slide), `HeroControls` (dots + arrows).

### 9.2 `components/home/region-explorer.tsx` — DELETE

- **Effort:** 0.
- The 6-wedge mandala with the "Browse by region" 6-tile list is replaced by:
  - **State strip** on the homepage (new component, see §9.6).
  - **By deity** 6-tile grid (new component, see §9.7).
  - **Region pills** on the Explore map mode (new component, see §12.5).
- The mandala SVG itself is reused as a decorative element in the methodology teaser or a "Made in India" line in the footer.

### 9.3 `components/home/hero-embers.tsx`, `hero-embers-mount.tsx` — DELETE

- **Effort:** 0.
- The 3D embers accent is removed. The light-mode hero has no 3D accent. Both files are deleted.
- **Side effect:** the `three` and `@react-three/fiber` dependencies are removed from `package.json` (and the optional 3D accent is documented as out-of-scope for the new design).

### 9.4 ADD: `components/home/editorial-paragraph.tsx`

- **Effort:** XS.
- The "2 sentences framing the site" component on the homepage. Centered, max 640 px, between the hero and the Trip ideas section.

### 9.5 ADD: `components/home/trip-ideas.tsx` + `trip-idea-card.tsx`

- **Effort:** M.
- 4 trip-idea cards in a row (desktop) / 2×2 (tablet) / 1 column (mobile). Each card has a photo, title, 1-line description, "X temples · Y days · ~Z km" meta, and an inline "Explore →" link. Cards link to pre-canned Explore URLs.

### 9.6 ADD: `components/home/state-strip.tsx` + `state-tile.tsx` + `state-popover.tsx`

- **Effort:** M.
- The state strip is a horizontal scroll (mobile) / 6-up grid (desktop). Each tile is a button (not a link) that opens a popover with the state's top 4 temples + a "See all →" link. The trailing tile in the strip is a "See all states →" link that opens a full picker popover with 37 states/UTs and a search input.
- **State silhouette SVGs:** needed for the tiles. 8–10 hand-drawn or simplified-from-GeoJSON silhouettes. (See §11 — a state outline GeoJSON may be needed for the Explore map; the same data can drive the state-strip silhouettes.)

### 9.7 ADD: `components/home/deity-tiles.tsx`

- **Effort:** M.
- 6 deity tiles in a 3×2 grid. Each tile: deity icon (SVG, hand-built), deity name (Fraunces H3), temple count (Space Mono). Click → `/explore?view=list&deity=<slug>`.
- **Deity icons:** 6 hand-built SVGs (trishul, sudarshana-chakra, lotus, ankusha, vel, gadaa). Place under `components/brand/deity-icons.tsx` for reuse on the Explore page and the "By the same deity" detail-page section.

### 9.8 ADD: `components/home/popular-searches.tsx`

- **Effort:** S.
- A row of 6 chips: "Shiva temples," "Tamil Nadu," "UNESCO sites," "Pilgrimage," "Himalayan temples," "Living temples." Each chip is a link to a pre-canned Explore URL.

### 9.9 ADD: `components/home/methodology-teaser.tsx`

- **Effort:** XS.
- A short paragraph + "How we choose →" link. Replaces the methodology callout in the current stats strip.

### 9.10 DELETE: stats strip (see §5.7)

- **Effort:** 0.
- The 4-stat strip on the homepage is deleted in favor of the Trip ideas + state strip + deity tiles.

---

## 10. Components — explore

### 10.1 `components/explore/explore-client.tsx` — REPLACE

- **Effort:** XXL.
- This is the biggest single change. The current component is a list-only client component with search, region chips, tag chips, sort, and load-more pagination. The new component is **two modes** (list + map) with a mode toggle, four filters, a smart-search banner, an active-filters row, and pagination (not load-more).
- **Component split:**
  - `ExploreShell` (server component, reads URL params, hands data to client).
  - `ExploreList` (list mode, client).
  - `ExploreMap` (map mode, client).
  - `ExploreSearchBar` (the top-of-page search input).
  - `FilterRow` (the 4 filter triggers + reset).
  - `FilterPopover` (the popover used by each filter).
  - `ActiveFiltersRow` (the removable chips).
  - `ResultGrid` + `TempleCard` (already in §11.1).
  - `Pagination` (the ‹ 1 2 3 … N › control).
  - `EmptyState` (the "no results" UI).
  - `YourStatePill` (the "pick your state" prompt).
  - `SmartMatchBanner` (the "Showing X for Y" banner).
- **URL contract:** matches the spec (`?view=map|list`, `?q=`, `?state=`, `?deity=`, `?tag=`, `?sort=`, `?preset=`, `?page=`).
- **Server-side search:** the `?q=` parameter triggers a server-side `searchTemples` call (per UX spec §4.1). The client only displays.

### 10.2 `components/explore/filter-chip.tsx` — KEEP

- **Effort:** XS.
- The chip component is on-spec for the "popular searches" row and the legacy filter chips. The new design system uses a more structured filter-row (trigger buttons + popovers), so `FilterChip` is repurposed for the popular-searches row and the optional region pills on the map. The full color rebuild matches §1.

---

## 11. Components — temple

### 11.1 `components/temple/temple-card.tsx` — MODIFY

- **Effort:** M.
- **Keep:** the morph wiring (`<ViewTransition name="temple-${id}">` + `TransitionLink`).
- **Modify:**
  - Photo aspect ratio: 16:9 (was 4:5).
  - Card: white surface, 1-px `line` border, 12-px corner radius. No `bg-nightstone-800/60`.
  - Photo zoom on hover: 1.03 (was 1.06). Card lift: 2 px.
  - Sand-yellow ring on hover (replaces the brass `border-brass/40`).
  - RegionBadge: new color tokens. Rating: `sand-yellow` star.
  - Drop the dark `bg-gradient-to-t from-nightstone-900` overlays on the photo.
  - Drop the top-right rating chip's `bg-nightstone-900/70` background.
  - Add a "Why this temple" 1-line caption (Hanken 14 px, ink-muted, 2 lines max with ellipsis) per the new card anatomy in §4.1.1 of the design system.

### 11.2 `components/temple/detail/detail-hero.tsx` — MODIFY

- **Effort:** M.
- **Keep:** the `<ViewTransition>` morph wiring, the back link, the region badge, the rating, the city/state line.
- **Modify:**
  - Recolor: white overlay text via `text-ink` (no `text-limewash`).
  - Photo: 16:9 desktop, 4:3 mobile, 60 vh max. Same `next/image priority`.
  - Drop the dark `bg-gradient-to-t from-nightstone-900` and `bg-grain` overlays.
  - Add: Save / Share / Get directions action row (bottom-right of hero, per UX spec §3.2).
  - Add: star rating + visit count in the overlay.
  - Update the back link: "← Back to [state] temples" → `/explore?view=map&state=<state-slug>` (was `← All temples` → `/explore`).

### 11.3 `components/temple/detail/quick-facts.tsx` — MODIFY

- **Effort:** S.
- **Modify:** 6 facts (was 4): Built · Dynasty · Style · Deity · Open today · Entry. Horizontal row, horizontally scrollable on mobile with right-edge fade. Light surface.

### 11.4 `components/temple/detail/detail-section.tsx` — KEEP

- **Effort:** XS.
- The section header pattern is on-spec. Drop the brass `text-brass/55` and `text-brass/80` for the new `text-temple-red/55` and `text-ink-muted`. Otherwise the component survives.

### 11.5 `components/temple/detail/prose.tsx` — KEEP

- **Effort:** XS.
- The `\n\n`-paragraph splitter is correct. Drop the `prose-temple` reference to `text-limewash/85` → use `text-ink/85`.

### 11.6 `components/temple/detail/fact-rows.tsx` — KEEP

- **Effort:** XS.
- The label/value list is on-spec. Recolors only.

### 11.7 `components/temple/detail/cost-table.tsx` — KEEP

- **Effort:** XS.
- The desktop table + mobile cards pattern is on-spec. Recolors only.

### 11.8 `components/temple/detail/gallery.tsx` — MODIFY

- **Effort:** M.
- **Keep:** the lightbox dialog (focus trap, Esc, keyboard nav, backdrop click), the grid layout.
- **Modify:**
  - The `images: string[]` prop becomes `media: MediaItem[]` per the schema refactor.
  - The lightbox renders video items inline (muted by default, with a visible unmute control).
  - The backdrop is `bg-canvas-soft/95` instead of `bg-nightstone-900/92`.
  - Drop the brass borders (`border-brass/25`, `border-brass/15`); use `line` and `line-strong`.

### 11.9 `components/temple/detail/best-time.tsx` — KEEP

- **Effort:** XS.
- The festivals grid is on-spec. Recolors: the festival timing chip is now `temple-red` text on `temple-red-soft` background (was `marigold`).

### 11.10 `components/temple/detail/nearby.tsx` — KEEP

- **Effort:** XS.
- The list of nearby attractions is on-spec. Recolors only.

### 11.11 `components/temple/detail/temple-map.tsx` — REPLACE

- **Effort:** M.
- The current component is a stylized coordinate plot on the nightstone canvas with a colored MapPin. The new design uses the same simplified plot (no API key, no external calls) but on a light canvas:
  - Background: `canvas-soft` with `line` graticule.
  - Marker: `temple-red` MapPin (no flicker, no glow — ambient loops are off per the design system).
  - "Open in Google Maps" link: tertiary button style, with the lat/lng pre-filled.
- **Keep:** the `lat`/`lng` placement math, the formatCoordinates call, the "Open in Google Maps" external link.

### 11.12 ADD: `components/temple/detail/why-visit.tsx`

- **Effort:** S.
- New section per UX spec §3.4. H2 + 3–4 sentences from `temple.whyVisit`.

### 11.13 ADD: `components/temple/detail/plan-around.tsx`

- **Effort:** M.
- New section per UX spec §3.5. Horizontal card carousel of 3 nearest temples (within 100 km, Haversine). Includes the "5 temples · 4 days · ~600 km" summary line. Uses `pickWithinRadius` from `lib/temple-queries.ts`. Fallback to region match if <2 temples are within 100 km.

### 11.14 ADD: `components/temple/detail/similar-by-deity.tsx`

- **Effort:** S.
- New section per UX spec §3.17. Up to 3 cards from `pickByDeity(list, temple.deity, 3)`. Hidden if no matches.

### 11.15 ADD: `components/temple/detail/similar-by-style.tsx`

- **Effort:** S.
- New section per UX spec §3.18. Up to 3 cards from `pickByArchitecturalStyle(list, temple.architecturalStyleSlug, 3)`. Hidden if no matches.

### 11.16 ADD: `components/temple/detail/nearby-temples.tsx` (within 100 km)

- **Effort:** M.
- New section per UX spec §3.16. Up to 4 cards from `pickWithinRadius(list, lat, lng, 100, 4)`. Each card shows the distance via `formatRelativeDistance`. Fallback to same-region cards if <2 temples are within 100 km; hide if no region match either.

### 11.17 `app/temples/[id]/page.tsx` — REPLACE

- **Effort:** M.
- Reorder sections per UX spec §3:
  1. Hero
  2. Quick-facts bar
  3. Why visit
  4. Plan around
  5. Best time (callout)
  6. Overview
  7. How to reach
  8. History
  9. Legends & mythology
  10. Architecture
  11. Spiritual significance
  12. Cost to visit
  13. Gallery
  14. Map
  15. Within 100 km
  16. By the same deity
  17. Same architectural style
  18. Nearby attractions
  19. Footer
- The current page has 11 sections; the new page has 18. Several sections are reordered, four are new, and "Timings & entry" is removed (timings + entry live in the quick-facts bar now).
- **Heading hierarchy:** H1 once (the H1 in the hero), H2 per major section, H3 for sub-sections (e.g. within "Architecture" — vimana, mandapa, gopuram).

---

## 12. Components — explore (map mode, NEW)

These are entirely new components for the map mode of Explore.

### 12.1 ADD: `components/explore/map/IndiaMap.tsx`

- **Effort:** XL.
- Inline SVG of India with state polygons, region clusters, and clickable states. Sourced from a public-domain GeoJSON of India states, simplified. Each state is a `<g role="button" tabindex="0">` with hover/focus/selected states. A cluster layer (circles at region centroids, sized by `log(count + 1)`) overlays the polygons. A visually-hidden `<ul>` of state links mirrors the map for screen readers.
- **Data:** needs the GeoJSON. A small `lib/india-geo.ts` module exports the parsed polygons and helpers (`stateSlug`, `stateLabel`, `polygonFor`).

### 12.2 ADD: `components/explore/map/RegionPills.tsx`

- **Effort:** S.
- 7 pills above the map: All · North · South · East · West · Northeast · Central. Click to filter the visible states.

### 12.3 ADD: `components/explore/map/StateResultsColumn.tsx`

- **Effort:** M.
- The right column on map mode. Sticky on desktop. Shows: state name (H2), temple count, scoped search input, sort dropdown, and a list of compact cards (1 column, 1 card per row, with pagination).

### 12.4 ADD: `components/explore/map/YourStatePill.tsx`

- **Effort:** S.
- Sticky pill at the top of the right column (desktop) or top of the bottom sheet (mobile). Prompts first-time visitors to pick their state. Persists in `localStorage`. On revisit, defaults to the persisted state.

### 12.5 ADD: `components/explore/map/BottomSheet.tsx`

- **Effort:** XL.
- The mobile bottom sheet with snap points (peek / half / full), drag handle, focus trap at half/full, Esc-to-close. Wraps the right-column content. Uses Framer Motion's `drag` and `useDragControls`. (See design system §7.7 for the spec.)

### 12.6 ADD: `components/explore/filters/FilterRow.tsx`

- **Effort:** M.
- The 4-filter row on list mode (and reusable on map mode): State · Deity · Tag · Sort. Each filter is a trigger button + a popover.

### 12.7 ADD: `components/explore/filters/FilterPopover.tsx`

- **Effort:** M.
- The popover used by each filter. Focus-trapping, Esc-to-close, dismissible on outside click. Generic over its content (the per-filter popovers are specialized).

### 12.8 ADD: `components/explore/filters/StateFilter.tsx`, `DeityFilter.tsx`, `TagFilter.tsx`, `SortFilter.tsx`

- **Effort:** S (each).
- Per-filter popover content. StateFilter: 37 states/UTs with a search input. DeityFilter: 6 deities. TagFilter: checkboxes, max 3. SortFilter: 3 options.

### 12.9 ADD: `components/explore/filters/ActiveFiltersRow.tsx`

- **Effort:** S.
- The removable chips below the filter row. Each chip has `aria-label="Remove filter: [name] [value]"`. Trailing "Reset all" chip.

### 12.10 ADD: `components/explore/SearchBar.tsx`

- **Effort:** S.
- The top-of-page search input. Includes the leading search icon, the trailing clear button, and the debounced URL update.

### 12.11 ADD: `components/explore/SmartMatchBanner.tsx`

- **Effort:** S.
- The "Showing X for Y" banner. `role="status"`, `aria-live="polite"`. Dismiss button (×) on the right.

### 12.12 ADD: `components/explore/Pagination.tsx`

- **Effort:** S.
- The ‹ 1 2 3 … N › control. Truncated middle. `aria-label="Page N"` on each link. `aria-current="page"` on the active page.

### 12.13 ADD: `components/explore/EmptyState.tsx`

- **Effort:** S.
- The "No temples match those filters" empty state. Sand-yellow-soft background, temple-red icon, "Reset all filters" button.

---

## 13. App routes

### 13.1 `app/page.tsx` (home) — REPLACE

- **Effort:** M.
- The current homepage has: hero, mission blurb, featured showcase, region mandala, stats strip. The new homepage has: header, hero carousel, editorial paragraph, trip ideas, state strip, popular searches, deity tiles, methodology teaser, footer.
- **Server component:** the homepage reads the same data (featured temples, region counts) but feeds it into the new sections. The hero is its own client component (carousel state).

### 13.2 `app/explore/page.tsx` — REPLACE

- **Effort:** M.
- Becomes a server component that reads URL params and renders the appropriate mode. The current "hand the full array to a client component" pattern is replaced by a server-rendered shell that delegates only the interactive bits to the client.

### 13.3 `app/temples/[id]/page.tsx` — REPLACE

- **Effort:** M.
- See §11.17. The 11-section dossier becomes an 18-section dossier with reordering and 4 new sections.

### 13.4 `app/about/page.tsx` — MODIFY

- **Effort:** S.
- **Keep:** the structure (header, approach, library, CTA).
- **Modify:** recolor to the new palette. Drop the brass `border-brass/15` etc. The "library" stats stay (2,000+ temples, 28 states, 6 cultural regions, 1 place to find them) — they're on-brand for the new direction.

### 13.5 `app/contact/page.tsx` — MODIFY

- **Effort:** XS.
- **Keep:** the partner form (UI-only) and the "perks" list.
- **Modify:** recolor to the new palette. The form is the partner inquiry, not the temple suggestion.

### 13.6 `app/not-found.tsx` — MODIFY

- **Effort:** XS.
- **Keep:** the gopuram mark, the 404 message, the CTAs.
- **Modify:** recolor to the new palette. The `bg-nightstone` → `bg-canvas-soft` and `text-limewash` → `text-ink`. Per UX spec §10.1, the message shifts to "We couldn't find that page." (was "This gate leads nowhere").

### 13.7 ADD: `app/suggest/page.tsx`

- **Effort:** M.
- A new UI-only "Suggest a temple" form. Fields: temple name, location, your name, your note. On submit, the form shows the same "this is a prototype, nothing was sent" note as the contact form. Per UX spec §10.6 and the revised architecture §1.9.

---

## 14. Skipped items (no file exists)

These are documentation-level items the spec implies but no file owns:

- **ADD: `lib/search.ts`** — the alias-aware ranked search function. Pure, unit-tested. Effort M.
- **ADD: `lib/search-aliases.ts`** — the alias map (`mahadev → shiva`, etc.). Effort XS.
- **ADD: `lib/india-geo.ts`** — the parsed India state polygons (GeoJSON) and helpers. Effort L.
- **ADD: `components/brand/deity-icons.tsx`** — the 6 deity SVG icons. Effort M.
- **ADD: `components/brand/region-icons.tsx`** — the 6 region SVG icons. Effort S.
- **ADD: `components/brand/state-silhouettes/`** — 8–10 hand-drawn or GeoJSON-derived state silhouettes. Effort L (or reuse from `lib/india-geo.ts`).
- **ADD: `components/home/popular-searches.tsx`** — see §9.8.
- **ADD: `components/home/methodology-teaser.tsx`** — see §9.9.

---

## 15. Effort summary

| Surface | Effort (person-days) |
|---|---|
| Design tokens (tailwind + globals + fonts) | 2 |
| DESIGN.md rewrite | 1 |
| Data + lib additions (search, haversine, geo, deities, state silhouettes) | 4 |
| Header + footer + language banner | 3 |
| Homepage (hero, editorial, trip ideas, state strip, deity tiles, popular searches, methodology) | 6 |
| Explore list mode (rebuild) | 4 |
| Explore map mode (India map, region pills, bottom sheet, right column) | 8 |
| Filters (4 filters, popovers, active row) | 3 |
| Temple detail reorder (4 new sections, hero actions, back link) | 4 |
| Search system (alias map, ranked search, banner, header overlay) | 3 |
| Media gallery refactor (video-ready schema, lightbox) | 2 |
| `/suggest` page | 1 |
| Contact form + about page recolor | 1 |
| 404 recolor | 0.5 |
| Performance + a11y pass (Lighthouse, axe, keyboard, reduced motion) | 2 |
| **Total** | **~45 person-days** |

A small team (2–3 engineers + 1 designer) can compress to **3–4 calendar weeks**. A solo engineer should plan for **8–10 weeks**.

---

## 16. Suggested execution order

1. **Phase 0 — tokens** (design system + globals + DESIGN.md). Stop and review the running app on every page. Nothing should still be nightstone.
2. **Phase 1 — header + footer + language banner** + schema additions (`whyVisit`, `architecturalStyleSlug`, `media[]`, `tripDuration`). Update `data/temples.ts` with the new fields.
3. **Phase 2 — homepage sections in order**: editorial paragraph → trip ideas → state strip → popular searches → deity tiles → methodology teaser. The new hero is the last thing built in this phase, so the rest of the page is reviewable first.
4. **Phase 3 — explore list mode** (new filter row, popovers, active filters, pagination, search bar, smart-match banner, empty state). Recolor and rebuild the existing `ExploreClient`.
5. **Phase 4 — explore map mode** (India map SVG, region pills, right column, your-state pill, mobile bottom sheet). This is the biggest single change.
6. **Phase 5 — temple detail reorder** (Why visit → Plan around → Best time callout → reorder the rest → 4 new sections at the end).
7. **Phase 6 — search system** (`lib/search.ts`, alias map, header overlay, smart-match banner, alias chip on results).
8. **Phase 7 — media gallery refactor** (`media: MediaItem[]`, video-ready lightbox, muted autoplay rule).
9. **Phase 8 — `/suggest` page** (new form).
10. **Phase 9 — performance + a11y pass** (Lighthouse 90+, axe clean, keyboard walkthrough, reduced motion audit, 200% zoom test, touch targets, contrast).
11. **Phase 10 — deploy readiness** (README update, Docker build, smoke test all routes).

---

## 17. Risk notes

- **The data array is the project's spine.** Anything that touches `data/temples.ts` must be a single coordinated change. The 15 records are hand-authored; a partial migration creates a confusing half-old / half-new state.
- **Region → pigment mapping has been the project's "color is data" claim.** The new region palette (per `DESIGN_SYSTEM_V2.md` §1.4) preserves that claim for the homepage and the Explore map. South and Central share hues with brand pigments; this is intentional, not a duplication.
- **3D embers removal** is irreversible in the prototype (the dependencies are uninstalled). If a future "tourism video" hero ever wants a 3D accent, the new design's hero is photo-only by spec.
- **Map mode bottom sheet** is the most complex single component (Framer Motion drag, focus trap, Esc handling, snap points). Plan a 2-day spike to validate the implementation before locking the spec.
- **The smart-search alias map is opinionated.** "mahadev → shiva" is a defensible default for an English-speaking tourist, but every addition is a content-strategy decision. Treat the alias map as data, not code.
- **The "Why visit" copy is editorial.** It is not auto-generated from `overview`. Each temple needs a hand-written 3–4-sentence "Why visit" paragraph. This is content work, not engineering work.
- **Static generation at 20,000+** is documented as a known scale step in `CLAUDE.md` (Phase 6.2 of the architecture review). Not a prototype concern; flagged for the future.

---

## 18. Out of scope (deferred)

These are in the approved architecture but explicitly out of scope for the prototype:

- Multi-language content translation (UI chrome only, English + placeholder for 7 others).
- User accounts, saved temples, trip planning.
- Real CMS / authoring tools.
- Video content (schema is ready, no real videos).
- State landing pages (`/states/[slug]`) — folded into `/explore?state=…`.
- Deity landing pages (`/deities/[slug]`) — folded into `/explore?deity=…`.
- A blog / editorial content for SEO.
- Server-side search index (Fuse.js / Meilisearch).
- Booking / "Plan visit" with third parties.
- Mobile app.
- Dark mode (the brief is light-mode only).

These are documented in `CLAUDE.md` and the architecture review. The prototype does not pretend to address them.

---

End of Redesign Plan.
