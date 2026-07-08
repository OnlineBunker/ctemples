# CTemples — Implementation Phases

> The redesigned website, broken into independently reviewable and testable phases. Each phase has a single, verifiable objective; a stop-and-review gate before the next phase begins; the smallest possible blast radius; and a defined exit criterion. No code in this document.

The order is the same as §16 of `REDESIGN_PLAN.md`, but each phase is now its own self-contained deliverable with: scope, files touched, components touched, risks, success criteria, and review gate.

## How to read this

- **Scope** — what ships in this phase. Anything not listed is untouched.
- **Files** — every file that changes (including new ones).
- **Components** — every component (existing or new) that is built, modified, or deleted.
- **Risks** — the realistic failure modes, ranked.
- **Success criteria** — observable, testable, non-negotiable. The phase is "done" when all are met.
- **Review gate** — what must be true before the next phase can start.

Estimated effort totals: ~45 person-days, as in §15 of `REDESIGN_PLAN.md`.

---

## Phase 0 — Foundation (tokens, globals, DESIGN.md, schema, lib helpers)

**Objective:** Swap the design tokens from nightstone to the new light-mode palette, lock the design rationale in `DESIGN.md`, add the new `Temple` fields and the new pure helpers, and prepare the data layer for the new components — without changing any visible UI yet.

**Scope:** Token swap, globals CSS reset, layout-level recolor, icon swap, design rationale rewrite, schema additions, three new pure helpers in `lib/temple-queries.ts`, alias-aware search, region-pigment update, validate tests, and a one-time `data/temples.ts` migration to add the new fields.

### Files affected
- **REPLACE:** `tailwind.config.ts` (token names, palette, drop `nightstone.*`, `brass.*`, etc., add `canvas`/`ink`/`temple-red`/`sand-yellow`/`warm-gold`/`line`/region tokens).
- **REPLACE:** `app/globals.css` (body background, focus ring, selection, eyebrow, hairline, link-draw, prose, shell, view-transition selectors, reduced-motion override).
- **MODIFY:** `app/layout.tsx` (themeColor, skip-link recolor, default `<title>`).
- **MODIFY:** `app/icon.svg` (gopuram silhouette in `temple-red` + `warm-gold`).
- **REPLACE:** `DESIGN.md` (light-mode rationale; gopuram-threshold metaphor reframed).
- **MODIFY:** `lib/types.ts` (add `whyVisit`, `architecturalStyleSlug`, `media: MediaItem[]`, `tripDuration?`).
- **MODIFY:** `lib/temple-queries.ts` (add `haversineKm`, `pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius`).
- **MODIFY:** `lib/filter.ts` (add `searchTemples`, add `popularity` to `SORT_OPTIONS`, drop the "Featured" and "Lowest cost" public options).
- **MODIFY:** `lib/format.ts` (add `formatRelativeDistance`).
- **MODIFY:** `lib/regions.ts` (new region pigments, add `regionIconPath`).
- **MODIFY:** `lib/validate.ts` (validators for the new fields).
- **MODIFY:** `lib/utils.ts` (`shimmer` base64 palette).
- **MODIFY:** `lib/__fixtures__/` (1–2 fixtures with the new fields populated).
- **MODIFY:** `data/temples.ts` (all 15 records get `whyVisit`, `architecturalStyleSlug`, `media[]`; 6 records get `tripDuration`).
- **MODIFY:** all `lib/*.test.ts` (new tests for new helpers).
- **NEW:** `lib/search-aliases.ts` (the alias map).
- **NEW:** `lib/media.ts` (the `MediaItem` type and a few helpers: `getHero`, `getGallery`, `getVideo`).

### Components affected
None visible. All changes are at the design-system, data, and pure-helper layer. The components still import the old tokens (broken Tailwind classes will be obvious in the running app — that's intentional, this is the audit pass).

### Risks
- **TypeScript errors cascade from `lib/types.ts` changes.** Mitigate by keeping `heroImage` and `gallery: string[]` as optional legacy fields in the type, or by removing them and accepting the visual breakage on the cards and gallery (they get re-rendered in Phase 2/3/4).
- **Tailwind class purging drops the new tokens.** Mitigate by using `safelist` in `tailwind.config.ts` for the brand and region palettes during the transition.
- **`data/temples.ts` is a 241 KB hand-authored file.** Mitigate with a one-time, scripted migration that adds the new fields with sensible defaults; review the diff before commit.
- **Alias map is opinionated.** Use a small, defensible seed list; treat additions as content-strategy decisions.
- **No visual diff possible at this phase** — the app is partially broken on purpose. Document this in the PR.

### Success criteria
1. `npm run typecheck` passes.
2. `npm run test` passes, including the new tests for `haversineKm`, `pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius`, `formatRelativeDistance`, and `searchTemples`.
3. The new tokens resolve in `tailwind.config.ts` (verified by `@tailwindcss/jit` compilation and a `npm run build` smoke test).
4. All 15 temple records in `data/temples.ts` have `whyVisit` (≥3 sentences), `architecturalStyleSlug`, and `media[]` populated.
5. `DESIGN.md` describes the new direction; the old nightstone rationale is removed.
6. `lib/regions.ts` exports the new pigments; `regionIconPath` is implemented for all 6 regions.
7. Alias map has at least 8 entries (e.g. `mahadev → shiva`, `vishnu → vishnu`, `buddha → gautama-buddha`, `nataraja → shiva`).
8. **No regressions** in the existing `lib/*.test.ts` suites.

### Review gate
- Two reviewers sign off: one engineering (token + lib correctness), one design (DESIGN.md + token palette match with `DESIGN_SYSTEM_V2.md`).
- A static screenshot of the homepage shows the visual breakage is consistent (the whole site is now off-tone, but uniformly so).
- The schema is **locked**: any future changes to `Temple` go through a new review, not a Phase-0 follow-up.

---

## Phase 1 — Header, footer, language banner, page-level shell recolor

**Objective:** Replace the chrome (header, footer, language banner) and recolor the small page-level surfaces (about, contact, 404). The visible site is now on the new palette, even though the major content surfaces (homepage hero, Explore, detail dossier) are still in their old layouts.

**Scope:** Header rewrite, footer rewrite, language banner (homepage only), about-page recolor, contact-page recolor, 404 recolor, drop the old nightstone `themeColor` references.

### Files affected
- **REPLACE:** `components/layout/header.tsx` (logo + Explore ▾ + About + search button + language pill; sticky white surface, 1-px warm-gold hairline at bottom; mobile hamburger sheet with focus trap).
- **REPLACE:** `components/layout/footer.tsx` (3 columns: About / Contribute / Connect; 1-px `line` border-top).
- **REPLACE:** `components/home/language-banner.tsx` (new, dismissible strip; `localStorage` 30-day persist).
- **MODIFY:** `app/about/page.tsx` (recolor; drop brass `border-brass/15`).
- **MODIFY:** `app/contact/page.tsx` (recolor).
- **MODIFY:** `app/not-found.tsx` (recolor; update message to "We couldn't find that page.").

### Components affected
- **NEW:** `components/home/language-banner.tsx`.
- **MODIFY:** `components/ui/eyebrow.tsx` (recolor; optional `tone="warm"`).
- **MODIFY:** `components/ui/section-heading.tsx` (recolor; `text-ink`).
- **MODIFY:** `components/ui/rating.tsx` (sand-yellow star, ink-muted number; preserves light text on photo overlays).
- **MODIFY:** `components/ui/stat.tsx` (recolor; component survives for use in `/about`).
- **MODIFY:** `components/brand/divider.tsx` (hairline to `line`, gopuram to `warm-gold`).

### Risks
- **Sticky header performance regression** when the hairline + shadow stack. Mitigate with a single `shadow-sm` on `isScrolled` rather than a heavy backdrop.
- **Mobile sheet focus trap** is the trickiest a11y piece. Test with keyboard-only and screen reader.
- **Language pill dropdown** has 7 placeholder languages. Use a single `aria-disabled` pattern; do not show a fake "loading" or pretend-success state.
- **Localstorage guard:** the language-banner dismiss must be SSR-safe. Render nothing on the server, then hydrate.

### Success criteria
1. Header is sticky, white, 1-px hairline at the bottom; no nightstone colors anywhere in `header.tsx`.
2. Header's Explore ▾ dropdown opens, dismisses on outside click, dismisses on Esc, traps focus.
3. Header's language pill is keyboard-operable (Enter/Space opens the menu, Esc closes, ↑/↓ moves between options, Enter activates).
4. Mobile hamburger sheet mirrors the desktop nav, traps focus, dismisses on Esc.
5. Language banner shows on first visit, hides after dismiss, persists across page navigations, and re-shows 30 days later.
6. `/about`, `/contact`, and 404 pages have no nightstone classes; AA contrast is verified.
7. Lighthouse Performance on `/` does not regress by >3 points.
8. axe-core reports 0 critical issues on `/`, `/about`, `/contact`, and the 404 page.

### Review gate
- Reviewer walks the site on desktop and mobile (375 px, 768 px, 1280 px) and signs off on the chrome.
- The existing homepage content (hero, mission, featured, region mandala, stats) is still in the old layout — that is acceptable, since Phase 2 owns the homepage rebuild.

---

## Phase 2 — Homepage rebuild (editorial, trip ideas, state strip, popular searches, deity tiles, methodology teaser, hero carousel)

**Objective:** Rebuild the homepage in the new direction, with all the new sections, ending in the hero carousel as the last item. After this phase, the homepage is on-spec and reviewable as a coherent whole.

**Scope:** The seven new homepage sections in dependency order, ending with the hero. Old homepage sections (region mandala, featured showcase, 4-stat strip) are deleted. Drop the 3D embers and the parallax component as part of this phase. Recolor the procedural `TempleScene` to a daytime palette.

### Files affected
- **REPLACE:** `app/page.tsx` (orchestrates the new sections).
- **REPLACE:** `components/home/hero.tsx` (orchestrator: slide state, dots, arrows, prev/next keyboard, autoplay off).
- **REPLACE:** `components/home/hero-slide.tsx` (new — single slide: photo, eyebrow, H1/H2, primary + secondary CTA).
- **REPLACE:** `components/home/hero-controls.tsx` (new — dots + arrows + counters, keyboard-accessible).
- **REPLACE:** `components/home/editorial-paragraph.tsx` (new — centered 640-px max, 2 sentences).
- **REPLACE:** `components/home/trip-ideas.tsx` (new — section heading + 4-up grid).
- **REPLACE:** `components/home/trip-idea-card.tsx` (new — photo, title, 1-line description, "X temples · Y days · ~Z km" meta, inline "Explore →").
- **REPLACE:** `components/home/state-strip.tsx` (new — horizontal scroll mobile / 6-up grid desktop).
- **REPLACE:** `components/home/state-tile.tsx` (new — silhouette + state name + temple count; button that opens popover).
- **REPLACE:** `components/home/state-popover.tsx` (new — top 4 temples + "See all →"; "See all states" full picker with 37 states/UTs + search).
- **REPLACE:** `components/home/deity-tiles.tsx` (new — 3×2 grid; 6 deity tiles).
- **REPLACE:** `components/home/popular-searches.tsx` (new — 6 chips, each links to a pre-canned Explore URL).
- **REPLACE:** `components/home/methodology-teaser.tsx` (new — paragraph + "How we choose →").
- **DELETE:** `components/home/region-explorer.tsx`.
- **DELETE:** `components/home/hero-embers.tsx`.
- **DELETE:** `components/home/hero-embers-mount.tsx`.
- **DELETE:** `components/motion/parallax.tsx`.
- **REPLACE:** `components/media/temple-scene.tsx` (daytime palette; mode prop; remove diya glow, sun disc, sand-yellow horizon).
- **MODIFY:** `package.json` (drop `three` and `@react-three/fiber`; lockfile updates).
- **MODIFY:** `components/ui/button.tsx` (5 variants, 3 sizes; new focus ring).
- **MODIFY:** `components/ui/pill.tsx` (Tag, RegionBadge recolor; new ActiveFilterChip and DeityBadge).
- **MODIFY:** `components/temple/temple-card.tsx` (16:9 aspect, light surface, "Why this temple" caption, no dark overlays).
- **NEW:** `components/brand/deity-icons.tsx` (6 hand-built SVGs).
- **NEW:** `components/brand/region-icons.tsx` (6 hand-built SVGs).
- **NEW:** `components/brand/state-silhouettes/` (8–10 hand-drawn or GeoJSON-derived SVGs).
- **NEW:** `lib/india-geo.ts` (parsed India state polygons; reused in Phase 4 for the Explore map).
- **MODIFY:** `components/motion/reveal.tsx` (new timing 350 ms, 60 ms stagger, new ease).
- **MODIFY:** `components/motion/transition-link.tsx` (preserve; recolor to temple-red for `type="nav-back"` arrow).
- **MODIFY:** `components/motion/view-transition.tsx` (preserve; add `::view-transition-group(*)` to reduced-motion override).

### Components affected
Everything in §9 of `REDESIGN_PLAN.md`, plus the `TempleCard` and `TempleScene` recolors, the new brand icon modules, and the new India GeoJSON loader. The `Header` from Phase 1 is reused.

### Risks
- **Hero carousel is the highest-risk visual element.** Mitigate with a 1-day spike to validate keyboard + autoplay-off + reduced-motion behavior on the photo overlay.
- **State silhouettes depend on the GeoJSON.** If `lib/india-geo.ts` is not ready, fall back to a numbered text list ("Tamil Nadu · 1,247 temples"); the silhouettes are added later.
- **Deity icons are bespoke SVGs.** Plan for 2 days of design iteration. If the icons ship unfinished, fall back to a single-line label per tile.
- **TempleCard recolor is visible everywhere it appears.** Mitigate by also being the place we change the card aspect ratio (16:9) — accept the visible layout shift and update tests for the related-temples section.
- **Dropping 3D embers removes a runtime dependency.** `three` and `@react-three/fiber` are removed from `package.json`. No code path outside the embers component uses them.
- **Reveal/Stagger timing change is felt site-wide.** Test scroll-revealed sections on each page after the change.

### Success criteria
1. The new homepage, in order, renders: hero carousel → editorial paragraph → trip ideas → state strip → popular searches → deity tiles → methodology teaser.
2. The hero carousel is keyboard-operable (←/→ moves, Home/End jumps, dots are buttons), has no autoplay, has a visible pause control, and respects `prefers-reduced-motion`.
3. Each state tile opens a popover with the state's top 4 temples + "See all →" link; the trailing tile opens a 37-state picker with a search input.
4. Each deity tile links to `/explore?view=list&deity=<slug>`; the slug is correctly resolved to a temple.
5. Each popular search chip links to a valid Explore URL that renders results.
6. The old `region-explorer.tsx`, `hero-embers.tsx`, `hero-embers-mount.tsx`, and `parallax.tsx` are deleted; no `import` remains.
7. The procedural `TempleScene` renders a daytime palette on every fallback (cards without photos, no-network fallback).
8. `npm run build` completes; the 15 `/temples/[id]` routes are pre-rendered.
9. `npm run test` passes.
10. axe-core reports 0 critical issues on `/`.

### Review gate
- A design reviewer walks the homepage on desktop and mobile and signs off that it matches `UX_SPEC.md` §1.
- The hero photo licensing is reviewed (no copyrighted photos; the placeholder photos continue to be Wikimedia Commons URLs).
- A second engineer signs off that the `data/temples.ts` is unchanged from Phase 0 (regression check).

---

## Phase 3 — Explore list mode

**Objective:** Replace `ExploreClient` with a list-mode Explore page that matches `UX_SPEC.md` §2.1. After this phase, list-mode Explore is on-spec; map mode is the next phase.

**Scope:** Server-side shell that reads URL params, four filter popovers, an active-filters row, a search bar, a smart-match banner, pagination (replacing load-more), and an empty state. The cards are the same `TempleCard` from Phase 2 (no further changes). The "load more" pattern is removed.

### Files affected
- **REPLACE:** `app/explore/page.tsx` (server component, reads URL params, hands to client).
- **REPLACE:** `components/explore/explore-shell.tsx` (new — server wrapper).
- **REPLACE:** `components/explore/explore-list.tsx` (new — client list mode).
- **REPLACE:** `components/explore/filters/filter-row.tsx` (new — 4 trigger buttons + reset).
- **REPLACE:** `components/explore/filters/filter-popover.tsx` (new — generic popover; focus trap, Esc, outside-click).
- **REPLACE:** `components/explore/filters/state-filter.tsx` (new — 37 states/UTs with search input).
- **REPLACE:** `components/explore/filters/deity-filter.tsx` (new — 6 deities).
- **REPLACE:** `components/explore/filters/tag-filter.tsx` (new — checkboxes, max 3).
- **REPLACE:** `components/explore/filters/sort-filter.tsx` (new — 3 options: Top rated, Most visited, A–Z).
- **REPLACE:** `components/explore/filters/active-filters-row.tsx` (new — removable chips).
- **REPLACE:** `components/explore/search-bar.tsx` (new — input with leading icon and clear button; debounced URL update).
- **REPLACE:** `components/explore/smart-match-banner.tsx` (new — "Showing X for Y" banner).
- **REPLACE:** `components/explore/pagination.tsx` (new — ‹ 1 2 3 … N › with truncation).
- **REPLACE:** `components/explore/empty-state.tsx` (new — sand-yellow-soft background, temple-red icon, "Reset all filters" button).
- **DELETE:** `components/explore/explore-client.tsx` (replaced by the new shell + list + filter components).
- **MODIFY:** `components/explore/filter-chip.tsx` (kept for the popular-searches row; recolor to new tokens).

### Components affected
All of the above. The `TempleCard` is reused unchanged from Phase 2.

### Risks
- **URL contract is the spine of this phase.** Every filter must round-trip through the URL (`?view=&state=&deity=&tag=&sort=&q=&preset=&page=`). Any filter that doesn't survive a page refresh is a regression.
- **Server-side search for `?q=` must be SSR-compatible** — the search is computed on the server in the page component, not on the client. Avoid passing the full temple array to the client.
- **Filter popover focus trap is the most error-prone piece** of this phase. Use a battle-tested headless primitive (e.g. Radix `Popover` or `react-aria` `useOverlay`), not a hand-rolled one.
- **Pagination state is in the URL.** Back/forward must restore the page. Test with the browser back button.
- **Sort "Most visited" is a synthetic field** (not in the data yet). Either add a `popularity` field to `Temple` in this phase, or use a deterministic derivation (e.g. `rating * Math.log(visits + 1)` from a synthetic seed). Document the choice.
- **The "popular searches" chips must not collide with the filter row.** They're in different parts of the page; the design system is clear on this, but check the visual hierarchy.

### Success criteria
1. URL round-trips: every filter survives a page refresh, and the back/forward buttons restore each filter combination.
2. Each filter popover traps focus, dismisses on Esc, dismisses on outside click.
3. `?q=mahadev` returns the same temples that the alias map resolves to "shiva"; the smart-match banner displays "Showing 47 temples for 'mahadev' (matched as 'Shiva temples')."
4. Pagination shows ‹ 1 2 3 … N › with truncated middle; `aria-current="page"` on the active page; `aria-label="Page N"` on each link.
5. The empty state appears when no temples match; "Reset all filters" clears the URL.
6. Search debounce is ≤300 ms; the URL update happens on idle.
7. `npm run typecheck` passes; `npm run test` passes.
8. Lighthouse Performance on `/explore` ≥ 90.

### Review gate
- Reviewer sets 5 different filter combinations, refreshes the page, and verifies the URL is the source of truth.
- Reviewer tests with `?q=mahadev` and `?q=mahakaleshwar` to validate the alias map; suggests additions to the alias map if any obvious ones are missing.
- A design reviewer signs off that the filter row, active-filters row, and pagination match `DESIGN_SYSTEM_V2.md` §8.

---

## Phase 4 — Explore map mode

**Objective:** Add the second mode of the Explore page. After this phase, the Explore page has both list mode (Phase 3) and map mode (this phase), and a mode toggle between them.

**Scope:** The India map SVG, region pills, right column (state results), your-state pill, mobile bottom sheet, and the mode toggle.

### Files affected
- **REPLACE:** `app/explore/page.tsx` (now dispatches to list or map mode based on `?view=`).
- **REPLACE:** `components/explore/mode-toggle.tsx` (new — list / map toggle; 2 buttons with icon + label; `aria-pressed`).
- **REPLACE:** `components/explore/map/india-map.tsx` (new — inline SVG, state polygons, region clusters, clickable states; visually-hidden `<ul>` mirror).
- **REPLACE:** `components/explore/map/region-pills.tsx` (new — 7 pills: All + 6 regions).
- **REPLACE:** `components/explore/map/state-results-column.tsx` (new — sticky on desktop; state name H2, temple count, scoped search input, sort dropdown, paginated card list).
- **REPLACE:** `components/explore/map/your-state-pill.tsx` (new — sticky pill; `localStorage` persist; first-time prompt).
- **REPLACE:** `components/explore/map/bottom-sheet.tsx` (new — Framer Motion drag; snap points peek/half/full; focus trap at half/full; Esc-to-close).
- **REPLACE:** `components/explore/map/state-silhouette.tsx` (new — small silhouette for the right column header; reused from `components/brand/state-silhouettes/`).
- **MODIFY:** `lib/india-geo.ts` (expanded; polygon centerpoints, region centroids, region-cluster sizing).
- **MODIFY:** `lib/temples.ts` (add `getTemplesByState(stateSlug)` helper).

### Components affected
All of the above. Reuses `TempleCard`, `FilterRow`, `FilterPopover`, `ActiveFiltersRow`, `SearchBar`, `SmartMatchBanner`, `Pagination`, `EmptyState` from Phase 3.

### Risks
- **The bottom sheet is the most complex component in the project.** Framer Motion drag + focus trap + snap points + Esc + reduced-motion. Plan a 2-day spike with a static storybook before integration. If the spike fails, the fallback is a simpler full-screen sheet (no snap points).
- **India map SVG size.** A 100 KB inline SVG hurts LCP. Mitigate with `next/dynamic` import of the map (only loaded when `?view=map` is set).
- **Cluster sizing** at region centroids must be readable for both 1 and 100+ temples. Use `log(count + 1) * k` for the radius.
- **State polygon accessibility.** Each state must be focusable, must have an `aria-label`, and the visually-hidden `<ul>` is the screen-reader contract; the SVG itself is decorative.
- **State silhouettes and India map use the same GeoJSON.** If the GeoJSON is wrong, both surfaces are wrong. Build a unit test that snapshots the polygon count and the region assignment for each state.
- **`?view=map` is a non-default mode.** Direct linking works (the server-rendered page reads the param). The mode toggle in the UI must round-trip through the URL.
- **Mobile bottom sheet on iOS Safari** — the drag interaction conflicts with the native rubber-band scroll. Test on real iOS.

### Success criteria
1. `/explore?view=map` renders the map mode; `/explore?view=list` renders list mode; no `?view=` defaults to list.
2. Mode toggle round-trips through the URL.
3. The India map renders all 28 states + 8 UTs; each is clickable, focusable, and has an `aria-label`.
4. Region pills filter the visible states; "All" shows all states.
5. Clicking a state opens the right column (desktop) or bottom sheet (mobile) with the state's temples.
6. The bottom sheet has peek/half/full snap points; dragging past the half threshold snaps; Esc closes; focus is trapped at half/full.
7. `?view=map&state=tamil-nadu` deep-links to Tamil Nadu with the bottom sheet open.
8. `your-state-pill` prompts on first visit, persists in `localStorage`, defaults to the persisted state on revisit.
9. `npm run build` passes; the map component is `next/dynamic` lazy-loaded.
10. Lighthouse Performance on `/explore?view=map` ≥ 85.
11. axe-core reports 0 critical issues on `/explore?view=map` and `/explore?view=map&state=tamil-nadu`.

### Review gate
- A design reviewer validates the map's color treatment (states are `line` fill, hover/selected are `temple-red`, no saturated fills).
- An a11y reviewer tests the bottom sheet with keyboard-only and screen reader (VoiceOver on iOS, NVDA on Windows).
- A second engineer reviews the GeoJSON loader for SSR-safety and bundle-size impact.

---

## Phase 5 — Temple detail reorder and 4 new sections

**Objective:** Reorder the temple detail dossier, add the four new "related" sections (Plan around, Within 100 km, By the same deity, Same architectural style), and update the hero with the new back link and action row. After this phase, the detail page is on-spec.

**Scope:** Section reorder, new "Why visit" section (uses `temple.whyVisit`), new "Plan around" section, new "Within 100 km" section, new "By the same deity" section, new "Same architectural style" section, hero back link update, hero action row, quick-facts bar expansion to 6 facts, gallery media-schema refactor, map recolor.

### Files affected
- **REPLACE:** `app/temples/[id]/page.tsx` (section order matches `UX_SPEC.md` §3).
- **REPLACE:** `components/temple/temple-card.tsx` (no change to the card itself; the related sections consume it).
- **MODIFY:** `components/temple/detail/detail-hero.tsx` (16:9 desktop, 4:3 mobile, 60 vh max; new back link "← Back to [state] temples"; action row Save / Share / Get directions; rating + visit count in overlay).
- **MODIFY:** `components/temple/detail/quick-facts.tsx` (6 facts: Built · Dynasty · Style · Deity · Open today · Entry; horizontally scrollable on mobile with right-edge fade).
- **MODIFY:** `components/temple/detail/gallery.tsx` (`media: MediaItem[]` prop; lightbox renders video muted; `bg-canvas-soft/95` backdrop; line-based borders).
- **REPLACE:** `components/temple/detail/temple-map.tsx` (`canvas-soft` background, `line` graticule, `temple-red` MapPin, tertiary button "Open in Google Maps").
- **REPLACE:** `components/temple/detail/why-visit.tsx` (new — H2 + 3–4 sentences from `temple.whyVisit`).
- **REPLACE:** `components/temple/detail/plan-around.tsx` (new — horizontal card carousel of 3 nearest temples + summary line "X temples · Y days · ~Z km").
- **REPLACE:** `components/temple/detail/nearby-temples.tsx` (new — up to 4 cards from `pickWithinRadius`; shows `formatRelativeDistance`; fallback to same-region; hide if no match).
- **REPLACE:** `components/temple/detail/similar-by-deity.tsx` (new — up to 3 cards from `pickByDeity`; hidden if no match).
- **REPLACE:** `components/temple/detail/similar-by-style.tsx` (new — up to 3 cards from `pickByArchitecturalStyle`; hidden if no match).
- **MODIFY:** `components/temple/detail/{detail-section, prose, fact-rows, cost-table, best-time, nearby}.tsx` (recolor only).
- **MODIFY:** `lib/temple-queries.ts` (expose `pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius` from the data-bound layer if not already; ensure SSR-safe).

### Components affected
All of the above.

### Risks
- **The detail page is the longest content surface in the app.** A reorder that breaks heading hierarchy (H1 once, H2 per major section) is a SEO and a11y regression. Use a single review pass for the heading tree.
- **"Plan around" depends on the trip-duration data** (6 of 15 temples have it). For the other 9, the section shows the cards but no summary line. Document this in the PR.
- **"Within 100 km" depends on accurate lat/lng.** A 1° error shifts the radius by 111 km. Validate `haversineKm` against a known pair (e.g. Tirupati to Chennai ≈ 110 km).
- **The hero action row** (Save / Share / Get directions) is UI-only. Save does nothing; Share uses `navigator.share` if available, otherwise copies a link; Get directions is an external link to Google Maps. Make the UI-only nature explicit in the code.
- **The `media: MediaItem[]` refactor** changes the gallery's prop type. Other consumers of `temple.gallery` (the homepage hero, the explore cards) need to be updated. Audit and update in this phase.
- **"By the same deity" with 0 matches** is hidden. Verify each temple's `deity` field maps to the 6 deity slugs used elsewhere.

### Success criteria
1. The detail page renders sections in the order from `UX_SPEC.md` §3.
2. Heading hierarchy: one H1 (in the hero), H2 per major section, H3 for sub-sections.
3. The hero back link is "← Back to [state] temples" and resolves to `/explore?view=map&state=<slug>`.
4. Hero action row is keyboard-operable; Share uses `navigator.share` when available, copies a link otherwise; Get directions is a tertiary button linking to Google Maps.
5. Quick-facts bar shows 6 facts on desktop; horizontally scrolls on mobile with a right-edge fade.
6. "Why visit" section is present on every temple and renders the `whyVisit` text.
7. "Plan around" shows the 3 nearest temples + a summary line for the 6 temples with `tripDuration`; the cards-only version for the other 9.
8. "Within 100 km" shows up to 4 cards with `formatRelativeDistance`; fallback to same-region; hidden if no region match.
9. "By the same deity" and "Same architectural style" each show up to 3 cards, hidden if no match.
10. `npm run typecheck` passes; `npm run test` passes.
11. Lighthouse Performance on `/temples/<id>` ≥ 90.
12. axe-core reports 0 critical issues on the detail page.

### Review gate
- Reviewer walks the detail page on desktop and mobile, in light of `UX_SPEC.md` §3, and confirms the section order, heading hierarchy, and visual treatment.
- Reviewer checks 3 temples (one with `tripDuration`, one with another temple within 100 km, one with a same-deity match) to validate the related sections.

---

## Phase 6 — Search system (header search overlay, alias-aware search, smart-match banner integration)

**Objective:** Add the header search overlay, integrate the alias-aware search into the Explore search bar, and surface the smart-match banner in both the header overlay and the Explore page. After this phase, search is the primary navigation entry point.

**Scope:** Header search button → overlay; header overlay debounced input with live results from `lib/search.ts`; Explore search bar wired to the alias-aware `searchTemples`; smart-match banner wired in both contexts; URL contract extended for `?q=`.

### Files affected
- **REPLACE:** `components/layout/header.tsx` (add the search button to the right of the language pill; wire to the overlay).
- **REPLACE:** `components/search/search-overlay.tsx` (new — full-screen overlay on mobile, right-side panel on desktop; Esc-to-close; focus trap; live results from `lib/search.ts`).
- **REPLACE:** `components/search/search-result.tsx` (new — single result row: thumbnail, name, "Temple · State · Deity").
- **REPLACE:** `components/search/search-results.tsx` (new — the results list; grouped by Top match (temple) and Mentions (deity, state)).
- **REPLACE:** `components/search/search-empty.tsx` (new — "No results for X" with popular searches).
- **REPLACE:** `components/search/smart-match-banner.tsx` (new — "Showing X for Y" with optional "matched as Z" chip).
- **REPLACE:** `components/explore/search-bar.tsx` (rebuilt to use `lib/search.ts` server-side; debounced URL update).
- **REPLACE:** `components/explore/smart-match-banner.tsx` (reuse from `components/search/`).
- **MODIFY:** `lib/search.ts` (export `searchTemples(list, query, options)` with alias-aware ranking; surface matched aliases).
- **MODIFY:** `lib/search-aliases.ts` (expand to ≥20 entries; add deity aliases, state aliases, and architectural-style aliases).
- **MODIFY:** `app/explore/page.tsx` (read `?q=`; call `searchTemples` server-side; pass to client).
- **MODIFY:** `app/page.tsx` (popular-searches chips link to `/explore?view=list&q=<alias>`).
- **MODIFY:** `lib/filter.ts` (deprecate `matchesQuery`; keep for tests; `searchTemples` is the new public API).
- **MODIFY:** `lib/filter.test.ts` (new tests for `searchTemples`; alias map coverage; rank order).

### Components affected
All of the above.

### Risks
- **Server-side search latency** for 20,000+ temples. At 15 temples, this is trivially fast. At 20,000, a naive substring search is still O(n) but 1,300× slower. The prototype is 15; the architecture review flags the search index as a future concern.
- **Alias map expansion is opinionated.** Each entry is a content-strategy decision. Add a "Why this alias?" comment to each entry.
- **Header overlay z-index** must be above the sticky header and any modal. Use a single global z-index scale documented in `DESIGN_SYSTEM_V2.md`.
- **The smart-match banner must be aria-live="polite"** so screen readers announce "Showing 47 temples for 'mahadev'" without interrupting.
- **Header search result thumbnails** are visual only; the data lookup is by id. Cache the first 6 by id; lazy-render the rest.
- **URL contract:** `?q=mahadev` and `?q=shiva` may yield different result sets (one matches the alias, one matches the literal). Document the difference; the smart-match banner is the user's signal.

### Success criteria
1. The header search button opens the overlay; the overlay traps focus and closes on Esc.
2. Typing in the header overlay shows live results within 100 ms (for the 15-temple dataset).
3. Typing "mahadev" surfaces "Shiva temples" as the top group with a "matched as 'Shiva temples'" chip.
4. The Explore page's `?q=` uses the same alias-aware search; the smart-match banner is identical to the header overlay's.
5. The popular-searches chips on the homepage use the alias-aware URLs (e.g. "Shiva temples" links to `/explore?view=list&q=shiva`, not `/explore?view=list&tag=shiva`).
6. `npm run test` passes with new tests for `searchTemples`.
7. Lighthouse Performance on `/` and `/explore?view=list&q=mahadev` does not regress.
8. axe-core reports 0 critical issues on the search overlay.

### Review gate
- Reviewer tests the alias map with a list of 10 expected aliases (each one should return results).
- Reviewer confirms that the URL contract is the single source of truth (no client-side state mirroring).
- A second reviewer walks the search flow on mobile (header → overlay → type → result → tap → detail page) and confirms it works end-to-end.

---

## Phase 7 — Media gallery refactor (video-ready schema, lightbox)

**Objective:** Refactor the media model from `heroImage + gallery: string[]` to `media: MediaItem[]` and add video support to the lightbox (muted by default, with a visible unmute control). After this phase, the schema and the lightbox are video-ready even though no videos ship in the prototype.

**Scope:** Schema refactor, `lib/media.ts` helpers, `TempleScene` recolor (already done in Phase 2), gallery component updates, hero photos, card photos.

### Files affected
- **MODIFY:** `lib/types.ts` (add `MediaItem` type: `{ kind: "image" | "video"; url: string; poster?: string; alt: string; width?: number; height?: number; durationSec?: number }`; `Temple.media: MediaItem[]`).
- **NEW:** `lib/media.ts` (`getHero(media)`, `getGallery(media)`, `getVideo(media)`, `MediaItemSchema`).
- **MODIFY:** `lib/validate.ts` (validate the new `media` field).
- **MODIFY:** `data/temples.ts` (refactor each temple's `heroImage` + `gallery` into a single `media[]`).
- **MODIFY:** `components/temple/detail/gallery.tsx` (consume `media[]`; render video with `controls`, `muted`, `playsInline`, `preload="metadata"`; lightbox shows video inline).
- **MODIFY:** `components/temple/temple-card.tsx` (consume `media[0]` for the card photo; no other change).
- **MODIFY:** `components/home/hero-slide.tsx` (consume `media[]`; cycle through the first photo of each featured temple's `media[]`).
- **MODIFY:** `components/media/temple-image.tsx` (new prop: `mediaItem: MediaItem` in addition to `src`; render `<Image>` or `<video>` based on `kind`).
- **MODIFY:** `components/media/photo-with-fallback.tsx` (same; pass `mediaItem`).
- **MODIFY:** `lib/__fixtures__/` (1 fixture with a `video` MediaItem).

### Components affected
All of the above.

### Risks
- **The schema refactor is a breaking change.** `Temple` consumers (cards, hero, gallery, map) all need to be updated in this phase. Audit and update in one pass.
- **`<video>` autoplay rules** are strict: muted + playsInline + no controls initially. The lightbox must show a visible "Tap to unmute" button.
- **iOS Safari and Android Chrome** handle `<video>` differently. Test on both; a video that doesn't play on the first tap is a regression.
- **`<video>` bandwidth cost** — a 30-second poster-frame is a 1–2 MB JPEG. Compress or use a still poster.
- **No real videos ship.** All `kind: "video"` entries in the placeholder data are stub URLs that fail. The lightbox must show the procedural `TempleScene` fallback for failed videos (extend the `onError` branch).
- **Backwards compat with `heroImage` + `gallery`** — drop them. There's no production data to migrate.

### Success criteria
1. `Temple.media: MediaItem[]` is the only media field; `heroImage` and `gallery` are removed.
2. `lib/media.ts` has the three helpers (`getHero`, `getGallery`, `getVideo`); each is unit-tested.
3. The gallery lightbox renders image and video items; video is muted by default; the unmute button is visible and keyboard-accessible.
4. A failed video falls back to the procedural `TempleScene` (extending the `onError` branch in `temple-image.tsx`).
5. `npm run typecheck` passes; `npm run test` passes; new tests cover `getHero`, `getGallery`, `getVideo`, the `MediaItem` validator, and the fallback.
6. Lighthouse Performance does not regress by >3 points on `/temples/<id>`.

### Review gate
- A design reviewer confirms the lightbox's video treatment matches `DESIGN_SYSTEM_V2.md` §7.6.
- A second engineer signs off that no `heroImage` or `gallery` reference remains in the codebase.

---

## Phase 8 — `/suggest` page

**Objective:** Add the missing UI-only "Suggest a temple" page. The form is intentionally not wired — same disclaimer as `/contact`.

**Scope:** A new route, a new form, the same "this is a prototype" notice.

### Files affected
- **NEW:** `app/suggest/page.tsx` (the new route).
- **NEW:** `components/suggest/suggest-form.tsx` (the form).
- **NEW:** `components/suggest/suggest-notice.tsx` (the "this is a prototype, nothing was sent" notice).
- **MODIFY:** `components/layout/footer.tsx` (the "Suggest a temple →" link in the Contribute column is already added; verify).

### Components affected
All of the above.

### Risks
- **Trivial risks.** This is a 1-day phase.
- **The form must be obviously UI-only.** Use the same `ContactForm` disclaimer language; do not animate a "sending..." state.
- **The page must not look like a "broken" partner form.** Use the same eyebrow + page header pattern as the other pages.

### Success criteria
1. `/suggest` renders the form (temple name, location, your name, your note).
2. Submitting shows the "this is a prototype" notice; no network call is made.
3. The page passes axe-core with 0 critical issues.
4. The footer link to `/suggest` works.

### Review gate
- A reviewer confirms the form's "do not submit" notice is visible on initial render (not just after submit).

---

## Phase 9 — Performance and a11y pass

**Objective:** Run the full site through Lighthouse, axe-core, and a manual keyboard / screen-reader walkthrough. Fix any regressions introduced in Phases 0–8. No new features.

**Scope:** A focused pass on:
- Lighthouse Performance ≥ 90 on `/`, `/explore`, `/temples/<id>`.
- Lighthouse Accessibility ≥ 95 on every page.
- Lighthouse Best Practices ≥ 95 on every page.
- axe-core 0 critical issues on every page.
- Manual keyboard walkthrough on `/`, `/explore` (list + map), `/temples/<id>`, the search overlay, and `/suggest`.
- `prefers-reduced-motion` is respected on every animation, including the hero carousel, the view-transition morph, the bottom sheet, the scroll-reveals, and the lightbox.
- 200% zoom test on each page; no horizontal scroll; touch targets ≥ 44×44 px.
- Color contrast AA across all light surfaces.
- Image weight: every photo is served via `next/image` with `sizes` set; lazy-loaded except the hero `priority`.
- LCP < 2.5s on a simulated 4G Moto G4.

### Files affected
None in scope of new features. Fixes are limited to:
- `tailwind.config.ts` (re-tune tokens if contrast fails).
- `app/globals.css` (focus ring contrast, selection contrast, link-draw contrast).
- Component-level styling if a specific page fails.

### Components affected
Per the fixes above.

### Risks
- **Lighthouse regressions are often pre-existing** and unrelated to this redesign. A 2-day pass is realistic; a 5-day pass is also realistic.
- **axe-core may flag false positives.** Document and skip with a comment; do not suppress without justification.
- **The bottom sheet** is the most likely a11y regression. Re-test with VoiceOver on iOS.

### Success criteria
1. Lighthouse Performance ≥ 90 on `/`, `/explore`, `/temples/<id>`.
2. Lighthouse Accessibility ≥ 95 on every page.
3. Lighthouse Best Practices ≥ 95 on every page.
4. axe-core 0 critical issues on every page.
5. Manual keyboard walkthrough passes on every page.
6. `prefers-reduced-motion` is respected everywhere.
7. 200% zoom test passes; no horizontal scroll.
8. LCP < 2.5s on a simulated 4G Moto G4.

### Review gate
- A second engineer reviews the Lighthouse report and signs off.
- The `prefers-reduced-motion` audit is reviewed by an a11y expert.

---

## Phase 10 — Deploy readiness

**Objective:** Ship-ready. Update `README.md`, build the Docker image, smoke-test every route, document the prototype's scope and known limitations.

**Scope:**
- Update `README.md` to reflect the new design direction (the existing README describes the old nightstone system).
- Smoke-test every route: `/`, `/explore?view=list`, `/explore?view=map`, `/explore?view=map&state=tamil-nadu`, `/temples/<id>`, `/about`, `/contact`, `/suggest`, and a 404 path.
- Build the Docker image and verify it runs.
- Add a "v0.1 prototype" tag to the footer.
- Document the alias map in the README.

### Files affected
- **MODIFY:** `README.md` (refresh the design description, the project vision, the screenshot, the data scale note).
- **MODIFY:** `components/layout/footer.tsx` (already has the "v0.1 prototype" tag from Phase 1; verify).

### Components affected
None new.

### Risks
- **The README is the first thing a new contributor or reviewer sees.** A stale README is a credibility hit. Treat this as a real, not nominal, step.
- **Docker build can fail** for reasons unrelated to the redesign (e.g. network access for `npm install`). Pre-validate the build before the final smoke test.

### Success criteria
1. `npm run build` passes.
2. `npm run start` serves the production build.
3. `docker build -t ctemples . && docker run -p 3000:3000 ctemples` succeeds.
4. Every route in the smoke-test list returns 200 (or 404 for the not-found path).
5. The README accurately describes the prototype's scope and known limitations.

### Review gate
- A second engineer signs off that the smoke test passes.
- The README is reviewed for accuracy and clarity.

---

## Cross-phase notes

- **Every phase ends with `npm run typecheck && npm run test && npm run build` clean.** No phase leaves the tree in a broken state.
- **Every phase is independently reviewable.** Each phase produces a working app at the end. Some phases (e.g. Phase 4) are larger than others; allocate review time accordingly.
- **The review gate is not optional.** The "design system V2" pivot is the project's biggest design change; a skipped review is a regression waiting to happen.
- **A solo engineer should plan for 8–10 weeks.** A 2–3-engineer team + 1 designer can compress to 3–4 calendar weeks.
- **No new dependencies** are added by any phase. Phase 2 removes `three` and `@react-three/fiber`; no new packages are introduced.
- **All `npm audit` advisories remain dev-only** (esbuild/vite/postcss via vitest). Do not run `npm audit fix --force`.

---

## Total effort recap (from `REDESIGN_PLAN.md` §15, restated as phase totals)

| Phase | Effort (person-days) | Surface |
|---|---|---|
| 0 — Foundation | 4 | tokens, globals, DESIGN.md, schema, lib helpers |
| 1 — Chrome | 3 | header, footer, language banner, about/contact/404 recolor |
| 2 — Homepage | 6 | hero carousel, editorial, trip ideas, state strip, deity tiles, popular searches, methodology, scene recolor |
| 3 — Explore list mode | 4 | filter row, popovers, active row, search bar, smart-match banner, pagination, empty state |
| 4 — Explore map mode | 8 | India map SVG, region pills, right column, your-state pill, bottom sheet, mode toggle |
| 5 — Temple detail | 4 | reorder, 4 new sections, hero actions, back link, quick-facts bar, gallery media refactor, map recolor |
| 6 — Search system | 3 | header overlay, alias-aware search, smart-match banner integration |
| 7 — Media gallery | 2 | `media: MediaItem[]` refactor, video-ready lightbox |
| 8 — `/suggest` page | 1 | new form |
| 9 — Perf + a11y pass | 2 | Lighthouse, axe, keyboard, reduced motion, zoom, contrast |
| 10 — Deploy readiness | 1 | README, Docker, smoke test |
| **Total** | **~36** | — |

(Recapped as 36 days here, vs. 45 in `REDESIGN_PLAN.md` — the difference is the foundation work and the early-phase deltas, which were double-counted in the original estimate.)

---

End of Implementation Phases.
