# CTemples — Project Context

> **⛔ SECTIONS 1–15 SUPERSEDED (2026-07-10).** The project's normative source of truth is now the master specification in **`docs/01`–`docs/14`** (see `docs/01_PRODUCT_NORTH_STAR.md` for the decision register and precedence rules). Everything in this file below the Build-status section is retained for history only and must not be cited as authority.
>
> **What remains live in this file:** the **Build status** section immediately below — it is still the single source of truth for *what is actually implemented*, and is updated at every phase boundary per `docs/14` §3.

---

## Build status — as of 2026-07-12 (Phase 8)

> **This section is the source of truth for what is actually implemented.** For what *should* be built and how, read `docs/13_IMPLEMENTATION_MASTER_PLAN.md`.

> **📘 MASTER SPEC ADOPTED (2026-07-10).** The 14-file master specification (`docs/01`–`14`) was authored and adopted: it reconciles all prior doc contradictions (26 catalogued, resolved via rulings D1–D27 in `docs/01` §6–7), re-baselines the remaining phases (P3–P11, ≈37 person-days, `docs/13`), and rewrites `CLAUDE.md` as a thin operating doc. Legacy docs (`UX_SPEC`, `DESIGN_SYSTEM_V2`, `REDESIGN_PLAN`, `IMPLEMENTATION_PHASES`, `DESIGN.md`) carry supersession banners. The earlier palette-supersession note that lived here is fully absorbed into `docs/03`.

### Progress at a glance

| Phase | Status | Notes |
|---|---|---|
| 0 — Foundation | ✅ **Complete**, with one deliberate exception (2026-07-08) | Schema, lib helpers, search, media, and the `data/temples.ts` migration are all done (see below). **Deliberately deferred:** `lib/india-geo.ts` (India state polygons) — its GeoJSON source/licensing is an open, unresolved question (§14.3) and needs real geographic accuracy for 37 states/UTs that shouldn't be hand-fabricated; do this just-in-time for Phase 4 once a real source is picked. |
| 1 — Chrome | ✅ **Complete** | Header, footer, language banner, about/contact/404 recolor. Inherits the Modern Utsavam palette via the token aliases. |
| 2 — Homepage | ✅ **Complete** (2026-07-08) | Hero carousel (photo, no autoplay, video-ready slide DTO for future production video), editorial paragraph, trip ideas, state strip (derived counts + accessible popover), popular searches, deity tiles (derived, keyword-matched), methodology teaser. `three`/`@react-three/fiber` removed; embers/parallax/region-explorer deleted. Verified: typecheck clean, 61/61 tests, lint clean, build 23/23 pages, manual browser check. Adversarial 4-dimension code review run; all 6 confirmed findings fixed. |
| Master spec | ✅ **Adopted** (2026-07-10) | `docs/01`–`14` written; governance edits applied (CLAUDE.md rewritten thin; legacy docs bannered). |
| 3 — Explore list mode | ✅ **Complete** (2026-07-10) | `/explore` rebuilt end-to-end against `docs/05` + `docs/02` §3: async `queryTemples`/`TempleSummary`/`getFacetCounts` seam, Radix Popover (D19), search bar + 4 filter popovers + active chips + smart-match banner + result grid + pagination, golden-query suite. Replaces `explore-client.tsx`/`filter-chip.tsx`. See below for details and the adversarial-review findings fixed. |
| 3.5 — Content foundations | ✅ **Complete** (2026-07-10) | Tag registry + validator wiring, slug registry + `lib/slug.ts` minting, real-data popularity model + `lib/filter.ts` switch, anti-slop lint (2 real violations found & fixed in `data/temples.ts`; 21 WARN-level whyVisit voice-contract issues left as documented content debt), interim image attribution credit. See below for details and the adversarial-review findings fixed. |
| Amendment A — Utsavam amplification | ✅ **Complete** (2026-07-11) | User-directed spec amendment + implementation in one commit (docs/14 §3 process). **Spec:** docs/01 §3 rules 6–8, D2, D23; docs/03 §2.3–2.4, §4; docs/04 §2/§4/§9–12; docs/08 (autoplay law, dwell-scoped motion, two-tier ceiling); CLAUDE.md digest. **Code:** hero autoplay (7s dwell, wrap, pause/play toggle, hover/focus pause, stop-on-manual-nav, reduced-motion/Save-Data never start it, progress-fill active dot), Ken Burns drift on the visible slide, saffron hover glow on the primary CTA, and the trip-ideas **showcase carousel** (center-emphasis scroll-snap, peeking neighbors, arrows + drag; replaces the 1/2/4 grid). Kept deliberately: 3D ban, a11y floors, perf budgets, content-integrity rules. **Review note:** the multi-agent adversarial workflow died on a session rate limit (0 agents completed — recorded as *no review*, not a pass); a frontier-model inline review was performed instead across the same three lenses and found 4 real issues, all fixed: play-toggle icon reflected effective state instead of intent (appeared dead when clicked), offsetLeft-based carousel math broke centering at >1440px viewports (switched to rect-based), amended D23 contradicted docs/06 §12's related-carousel ban ("Plan around" is computed, not curated — removed from the sanctioned list), docs/03 §4 still said "trip ideas 1/2/4". Verified live: dwell exactly 7s with wrap, manual-nav stop + toggle restart, SR silence until interaction, carousel centering at 0px offset, 375px no overflow; typecheck/188 tests/lint/build green. |
| 4 — Explore map mode | ✅ **Complete** (2026-07-11) | `?view=map` fully built per `docs/07` + `docs/05` §6: geometry pipeline (`scripts/build-india-geo.mjs` → `lib/india-geo.ts`, datameet/maps CC BY 4.0, 0.2% simplification, 65KB), `IndiaMap` (interaction matrix, region-cluster layer, callout markers, boundary-trace), region pills, results column with compact cards + scoped search/sort/pagination + always-visible state selector, mobile bottom sheet (3 snaps, drag + keyboard, aria-modal with inert background), `checkCoordinateInState` validator, state-silhouette home tiles, attribution (map caption + `/about` + README). See below for the adversarial-review findings fixed. |
| 5 — Temple page rebuild | ✅ **Complete** (2026-07-12) | `/temples/[id]` + `components/temple/detail/*` rebuilt end-to-end against `docs/06` (18-section `visibleSections` engine, D13), `docs/12` §2 (metadata), `docs/07` §7 (state-scale map), `docs/03` §6.7 (lightbox), `docs/08` §4 (reveals). See below for details, the three build-time gallery bug-fixes, and the adversarial-review findings fixed. |
| 6 — Search system | ✅ **Complete** (2026-07-12) | Header search overlay + Cmd/Ctrl-K (docs/10 §6, D21), D10 alias upgrade (composable `AliasTarget` union + per-token matching), `matchedAliasLabel` seam threading. See below for details and the adversarial-review findings fixed. |
| 7 — Media migration completion | ✅ **Complete** (2026-07-12) | Deleted the legacy `heroImage`/`gallery`/`videoUrl` fields from `lib/types.ts` and all 15 `data/temples.ts` records; migrated the last 3 consumers (homepage hero carousel, trip-ideas, `TempleCard`) onto `getHero(media)`. See below for details. |
| 8 — /suggest + /methodology | ✅ **Complete** (2026-07-12) | Two new UI-only pages (`/suggest`, `/methodology`, D7); footer + homepage teaser links flipped from `/about` to the new routes. See below for details. |
| P9–P11 | ⬜ Not started | **Next: P9 — Consistency cleanup** per `docs/13`. |

### Phase 3 — complete (2026-07-10)

**Delivered:** `/explore` rebuilt as a full async server component per `docs/05` + `docs/02` §3. The data seam (`lib/temples.ts`) is now fully async and `React.cache()`-wrapped; `queryTemples(TempleQuery)` is the page's single data call, backed by the pure `runExploreQuery()` composition in `lib/temple-queries.ts` (filter → search → sort → paginate → contextual facets, unit-tested with 9 dedicated tests). `lib/explore-url.ts` owns URL parse/build (`parseExploreParams`, `buildExploreHref`, `withQuery`) with 15 round-trip tests. Radix Popover (D19, the sole sanctioned new dependency) powers all four filter popovers via a shared `filter-popover.tsx` wrapper. `lib/search.golden.test.ts` (15 tests, 1 skipped — typo tolerance is Meilisearch-only) locks the alias-aware ranking behavior. Homepage/header links migrated off the old `?view=map&preset=`/`?view=list` URL patterns to canonical bare facet URLs (file 04 **[DELTA]**).

**New files:** `lib/explore-url.ts` (+ test), `lib/search.golden.test.ts`, `components/explore/{active-filter-chips,deity-filter,empty-state,filter-popover,map-mode-notice,mode-toggle,pagination,result-card,result-grid,search-bar,smart-match-banner,sort-filter,state-filter,tag-filter,your-state-pill}.tsx` (15 files). **Deleted:** `components/explore/{explore-client,filter-chip}.tsx`. **Modified:** `app/explore/page.tsx` (rewritten async), `app/page.tsx` + `app/temples/[id]/page.tsx` (await the now-async seam), `lib/{temples,temple-queries,search}.ts`, `lib/temple-queries.test.ts` (+29 tests incl. `runExploreQuery`), `components/home/{deity-tiles,popular-searches,state-tile,trip-ideas}.tsx`, `components/layout/header.tsx`, `components/temple/temple-card.tsx`, `app/globals.css` (eyebrow contrast fix + popover keyframe), `docs/05`/`docs/10` (spec corrections found during review), `package.json` (added `@radix-ui/react-popover`).

**Verification:** typecheck clean · 139/140 tests (1 intentionally skipped) · lint clean · build 23/23 pages. Browser-verified (desktop + 375px): alias search + smart-match banner, facet counts narrowing correctly under an active query, alphabetical state list, a below-top-12 selected tag still pinned visible in its popover, 44×44px touch targets, "Clear search" scoping to only `q`/`exact`.

**Adversarial review (2 independent passes — a11y/spec-adherence, correctness/React) — 14 confirmed findings fixed:** facet counts previously ignored the active search query `q` (found independently by both reviewers, empirically verified — the most significant bug); State filter wasn't alphabetical per spec; `search-bar.tsx` had a stale-closure bug and no debounce-timer cleanup on unmount; `tag-filter.tsx`'s top-12 cap could hide an already-selected tag; `app/explore/page.tsx` made 3 data calls instead of the documented "one" (resolved by folding the selected-facet-safety logic into `runExploreQuery` itself); ARIA `listbox`/`option` roles were structurally invalid mixed with non-option children (replaced with plain semantic lists + `aria-pressed`); several touch targets were under the 44px floor; `result-card.tsx`'s price text used `text-magenta` (4.3:1) instead of `text-magenta-deep` (6.2:1) for small text — same bug in `temple-card.tsx`, fixed in both; `empty-state.tsx`'s "Clear search" was over-broadly clearing all filters (self-discovered, not flagged by either reviewer) — fixed to only clear the query.

### Phase 3.5 — complete (2026-07-10)

**Delivered** (docs/13 §2, docs/09, docs/11 §8 items 3–7):
- **Tag registry** — `data/tag-registry.ts` (45 entries: `{ tag, slug, kind, prominence? }`, covering every tag in `data/temples.ts`); `lib/validate.ts` now rejects any temple tag not in the registry.
- **Slug registry** — `lib/slug.ts` (`mintSlug`/`getOrMintSlug`, progressive disambiguation: name → +city → +state → +geohash5, own geohash encoder); `data/slug-registry.json` seeded from the 15 current records (with coordinates, after the review fix below).
- **Popularity model** — real trailing-12-month Wikipedia pageviews fetched for all 15 temples into `data/wiki-pageviews.json` (committed input, `fetchedAt`); `lib/popularity.ts`'s pure scoring formula (docs/09 §4); `scripts/compute-popularity.ts` deterministically writes `data/popularity.json` (no network calls, offline-reproducible); `lib/temples.ts` merges the score onto `Temple.popularityScore` (new optional stub field, `lib/types.ts`); `lib/filter.ts`'s "Most visited" sort now uses the real score instead of the old featured+rating proxy.
- **Anti-slop lint** — `data/anti-slop.ts` (banned-phrase lexicon, docs/01 §3.2) + `lib/anti-slop.ts` (pure checks: banned phrases anywhere/as-opener, cross-record 10-gram dedupe, unsourced-visitor-count tripwire — all error-level; opener-diversity cap and whyVisit voice-contract — warn-level, per docs/09 §7's own "warn→error at scale") + `scripts/lint-anti-slop.ts` (`npm run lint:content`). Running it found and fixed 2 real banned-phrase violations in `data/temples.ts` ("stands as a testament", "spiritual journey" used as a noun phrase). **Known, documented content debt (not fixed — out of scope for a lint-script sub-task):** 21 warn-level whyVisit voice-contract violations (wrong word count and/or no 2nd-person address) across nearly all 15 records — a future editorial pass should rewrite these to match docs/01 §3.2's contract.
- **Interim image attribution** — "Images: Wikimedia Commons" credit line added to the existing (not-yet-redesigned) temple-detail gallery lightbox, plus a licensing-note paragraph on `/about`.

**New files:** `data/{tag-registry,anti-slop}.ts`, `data/{popularity,slug-registry,wiki-pageviews}.json`, `lib/{slug,popularity,anti-slop}.ts` (+ tests each), `lib/tag-registry.test.ts`, `scripts/{compute-popularity,lint-anti-slop}.ts`. **Modified:** `lib/{types,temples,filter,validate}.ts`, `lib/__fixtures__/temple.ts`, `data/temples.ts` (2 prose fixes only), `app/about/page.tsx`, `components/temple/detail/gallery.tsx`, `package.json` (added `tsx` devDependency + `popularity`/`lint:content` scripts).

**Verification:** typecheck clean · 188/189 tests (1 intentionally skipped) · lint clean · `npm run lint:content` 0 errors/21 known warnings · build 23/23 pages. Browser-verified the two attribution surfaces (`/about` and the gallery lightbox).

**Adversarial review (3 independent passes — correctness, spec-adherence, data-integrity) — 9 confirmed findings fixed:** `getOrMintSlug` matched only on name+city+state, so two genuinely distinct temples sharing all three (plausible at 20k scale) would silently collapse onto one slug — fixed by requiring coordinate proximity (≤2km) too, `SlugRegistryEntry` now carries `coordinates`; `mintSlug` returned a colliding slug unconditionally if even the final `+geohash5` tier collided — now throws instead of silently corrupting the identity contract; no test guarded `data/popularity.json` against drifting from its live inputs (unlike the analogous slug/tag-registry sync tests) — added one; the "delve"/"delves"/"delving"/"delved" lexicon entries double-counted a single violation as two findings — consolidated into one rule with variant forms; `checkNGramDedupe`'s "newest" is only an array-order proxy (no `createdAt` field exists yet) — documented as a known Stage-B-dependent limitation; an inaccurate "build-time self-check" comment in `data/tag-registry.ts` overclaimed protection `next build` doesn't currently exercise — corrected; `computedAt`'s deliberate tie to the wiki-fetch date (not wall-clock "now", to preserve byte-identical regeneration) was undocumented — added a clarifying comment. **One reviewer finding was investigated and refuted:** a claim that the committed Wikipedia pageview numbers were fabricated, based on a live re-query that didn't match; re-fetching with the *exact* documented window (2025-07 through 2026-06) reproduced the committed numbers exactly — the original data was accurate; the mismatch was the verifying agent using a different date range, not fabrication.

### Phase 4 — Explore map mode — complete (2026-07-11)

**Delivered** (docs/07 in full, docs/05 §6, docs/03 §6.8):
- **Geometry pipeline (D16).** Source = datameet/maps `States/Admin2.shp` (36 features). Stage A (manual, committed): `mapshaper … -simplify visvalingam keep-shapes 0.2%` → `scripts/geo-src/india-states-simplified.geojson`. Stage B (`node scripts/build-india-geo.mjs`): equirectangular projection with `cos(meanLat)` correction into a 1000×1100 viewBox → `lib/india-geo.ts` (generated, 65KB): `INDIA_STATES` (36, `{slug,name,path,labelPoint,area}`), `STATE_CENTROIDS`, `STATE_SILHOUETTES`, `CALLOUT_STATE_SLUGS` (computed from area, not hardcoded), `GEO_PROJECTION`. **License correction:** the repo README states **CC BY 4.0**, not the CC-BY 2.5 IN the spec originally assumed — fixed in docs/01 D16 + docs/07.
- **`IndiaMap`** — inline SVG, 36 interactive `<g role="button">` polygons driving the D17 interaction matrix from React state; region-cluster density layer (`r = 8 + 10·log(count+1)`, hidden once a state is selected); callout markers for the 4 sub-target UTs (Chandigarh, Dadra & Nagar Haveli and Daman & Diu, Lakshadweep, Puducherry) with an enlarged transparent hit circle so the marker — not the near-invisible sliver — is the tap target; one-shot 350ms boundary-trace on select (skipped under reduced motion); a visually-hidden parallel `<ul>` (the SR contract) that mirrors the polygons' behavior including the region-lens dimmed gate; floating desktop label chip.
- **Region pills** (client-side lens, never a URL param, `aria-pressed`), **results column** (compact 4:3 cards sharing the view-transition morph name, scoped search/sort/pagination, always-visible `MapStateSelect` state switcher per docs/07 §5#3, two map-specific empty states), **mobile bottom sheet** (Framer Motion, 3 snaps peek/half/full, drag + handle-button cycle + keyboard, aria-modal with the background made `inert`, Esc→peek, focus trap/restore, reduced-motion → instant reposition + content fade + buttons).
- **`checkCoordinateInState`** (`lib/geo.ts`) joined the validation suite (docs/09 §6) with a 12-viewBox-unit tolerance for simplification artifacts (Rameswaram/Pamban Island). **`STATE_REGION`** hand-authored map (36 → 6 regions) so the region lens works for zero-temple states; verified consistent with every temple's own `region`.
- **State-silhouette home tiles** (docs/07 §8) — resolved server-side and passed as a path-string prop so the client `StateTile` ships no geometry. **Attribution** — map-mode caption + `/about` credit + README, all CC BY 4.0.
- **`?view=map` is code-split** behind a client `ssr:false` lazy boundary (`explore-map-view.lazy.tsx`) so list mode never downloads the map bundle.

**New files:** `scripts/build-india-geo.mjs`, `scripts/geo-src/india-states-simplified.geojson`, `lib/india-geo.ts` (generated), `lib/geo.ts` (+ test), `components/explore/{india-map,region-pills,map-results-column,result-card-compact,map-state-select,map-attribution,explore-map-view,explore-map-view.lazy,bottom-sheet}.tsx`. **Modified:** `lib/regions.ts` (+`STATE_REGION`, + test), `lib/validate.ts` (+ coordinate check, + test), `components/explore/search-bar.tsx` (`useId`, placeholder prop), `components/home/state-tile.tsx` + `app/page.tsx` (silhouette-via-prop), `app/explore/page.tsx` (map branch), `app/about/page.tsx` + `README.md` (attribution), `docs/01`/`docs/07`. **Deleted:** `components/explore/map-mode-notice.tsx`.

**Verification:** typecheck clean · 201/202 tests (1 intentionally skipped; geo suite +9) · lint clean · build 23/23 pages. Browser-verified desktop + 375px: map renders and highlights the URL-selected state, region pills dim/undim (selected state never dimmed), callout tap selects a UT, bottom sheet cycles peek→half→full→peek + Esc→peek with correct measured pixel positions, background goes inert while the sheet is modal and clears on collapse, the state selector navigates, keyboard Enter on a polygon selects. Bundle split verified empirically against `app-build-manifest.json` + chunk greps: home route ships **zero** map geometry; `/explore` First Load JS dropped 221 → **161 kB** with the map + geometry moved to an on-demand chunk.

**Adversarial review (4-dimension Workflow — spec-compliance, correctness, accessibility, security/perf — + an adversarial refute pass per finding): 19 raw findings, 17 survived verification, all addressed.** Fixed in code (15): map attribution was desktop-only (added to mobile); callout markers were decorative dead-taps (made the marker interactive with an enlarged hit circle); bottom-sheet z-index was `z-40`, colliding with filter popovers (→ `z-[60]` per docs/03 §4); mobile map strip was `z-30` (→ `z-20`); no visible state selector for touch/zoom users (added `MapStateSelect`, docs/07 §5#3); reduced-motion still *slid* the sheet (→ instant reposition + content fade); the SR parallel list ignored the region-dim gate the polygons enforce (→ disabled dimmed list buttons for parity); `distanceToRings` skipped each ring's closing edge — a real off-by-one that would wrongly flag a near-boundary temple (fixed + regression test); the sheet remounted on every `window.innerHeight` change, so mobile URL-bar collapse mid-scroll reset scroll/drag (→ re-key on width/orientation only); `onDragEnd` reconstructed position as `yFor(snap)+offset` instead of the live motion value (→ `y.get()`); duplicate `id="explore-search"` from two mounted SearchBars (→ `useId()`); `aria-modal` was asserted without making the background inert (→ `inert` on map + pills while modal); region pills lacked `aria-pressed`; the compact card's link `aria-label` dropped the rating from the a11y tree (→ folded in); and the `next/dynamic` split wasn't actually deferring the map — the 65KB geometry shipped on the home route (via the silhouette import) and in the list-mode `/explore` chunk (→ server-side silhouette resolution + a client `ssr:false` lazy boundary, both verified by build analysis). Recorded as a **docs/07 amendment (1):** the "both wired" a11y strategy (parallel list + interactive polygons, double tab-stop) was kept as the spec's stated default, with a note that the VoiceOver A/B to collapse to a single path wasn't run (no AT environment available at build time). **Surfaced for a product decision (1):** the D17 rest-map palette (`#F4EADF` fill + `#FFFFFF` stroke ≈ 1.19:1 boundary contrast) is below WCAG 1.4.11's 3:1 — spec-mandated, so left unchanged pending a decision on amending D17. **Two findings were refuted** by the verification pass.

### Files changed in the 2026-07-08 session (Phase 0 minimum + Phase 2, then full Phase 0)

**Phase 2 pass:** New: `DESIGN.md` (rewritten for Modern Utsavam), `lib/deities.ts` (+ test), `components/brand/{deity-icons,kolam-motif}.tsx`, `components/home/{hero-slide,hero-controls,editorial-paragraph,trip-ideas,trip-idea-card,state-strip,state-tile,state-popover,popular-searches,deity-tiles,methodology-teaser}.tsx`. Modified: `tailwind.config.ts`, `app/globals.css`, `app/fonts.ts`, `app/layout.tsx`, `app/page.tsx`, `lib/{regions,temple-queries,temples,utils}.ts`, `components/ui/{button,pill,section-heading}.tsx`, `components/motion/reveal.tsx`, `components/brand/divider.tsx`, `components/media/temple-scene.tsx`, `components/temple/temple-card.tsx`, `package.json` (dropped `three`/`@react-three/fiber`). Deleted: `components/home/{hero-embers,hero-embers-mount,region-explorer}.tsx`, `components/motion/parallax.tsx`.

**Phase 0 completion pass:** New: `lib/distance.ts` (`haversineKm`), `lib/search.ts` (`searchTemples`, the alias-aware ranked search per UX_SPEC §4.2), `lib/search-aliases.ts` (12 entries), `lib/media.ts` (`getHero`/`getGallery`/`getVideo`) — plus a test file for each. Modified: `lib/types.ts` (added `MediaItem`, `Temple.whyVisit`/`media`/`architecturalStyleSlug`/`tripDuration?` — `heroImage`/`gallery` are **kept alongside** `media` for backward compatibility with not-yet-migrated Phase 5/7 consumers, not removed), `lib/temple-queries.ts` (`pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius`), `lib/format.ts` (`formatRelativeDistance`), `lib/filter.ts` (`popularity` SortKey — additive, the old `SortKey`/`SORT_OPTIONS` are unchanged for the untouched `/explore` page's sake; new `PUBLIC_SORT_OPTIONS` for Phase 3), `lib/regions.ts` (`regionIconPath`), `lib/validate.ts` (validators for all new fields), `lib/__fixtures__/temple.ts` (defaults for the new required fields). **`data/temples.ts` migrated** — all 15 records now have `whyVisit` (hand-written, 3–4 sentences each), `architecturalStyleSlug` (hand-curated groupings — see below, not a mechanical per-record slugify, which would make every temple a singleton), `media: MediaItem[]` (wraps `heroImage`+deduped `gallery`), and `tripDuration` on 6 records tied to real documented circuits (Panch Kedar, Golden Triangle of Odisha, Great Living Chola Temples, etc.).

Architectural style groups after curation: `dravidian`×5, `nagara`×2, `kalinga`×2, `modern`×2, and four singletons (`sikh`, `maru-gurjara`, `nilachala`, `cave-shrine`).

Git: repo initialized this session, connected to `https://github.com/OnlineBunker/ctemples.git`, pushed to `master`.

### Phase 0 — complete, with one deliberate exception

Phase 0 was originally split (token subset first, to unblock Phase 1), then finished in full on 2026-07-08 in a dedicated completion pass, after Phase 2 shipped.

**Done (token layer, 07-07):**
- `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/icon.svg` — see the palette-supersession callout at the top of this section; these now carry the Modern Utsavam palette, not the originally-planned temple-red/sand-yellow/warm-gold literal hexes.

**Done (completion pass, 07-08):** schema (`whyVisit`, `media: MediaItem[]`, `architecturalStyleSlug`, `tripDuration?` — `heroImage`/`gallery` kept alongside `media`, not replaced, so Phase 5/7's not-yet-migrated consumers keep compiling), `haversineKm`/`pickByDeity`/`pickByArchitecturalStyle`/`pickWithinRadius`, `formatRelativeDistance`, `searchTemples` + `lib/search-aliases.ts` (12 entries), `lib/media.ts`, `regionIconPath`, `lib/validate.ts` validators, the full `data/temples.ts` migration (all 15 records), `DESIGN.md`. Deity accent colors were implemented as inline hex styles in `lib/deities.ts` rather than named Tailwind tokens (avoids the purge/safelist risk the original plan flagged, functionally equivalent).

**Deliberately deferred:** `lib/india-geo.ts` (parsed India state polygons for the Explore map, Phase 4). Its GeoJSON source and license are an explicitly open, unresolved question in this document (§14.3) — shipping fabricated/approximate boundary data for 37 states/UTs would be worse than not shipping it. Pick a real source before Phase 4 needs it. `components/brand/region-icons.tsx` (the presentational component consuming `regionIconPath`) is also deferred — it's Phase 4's map-region-pills UI, not a Phase 0 lib concern.

**Schema note:** `MediaItem`/`Temple.media` is a *locked schema addition* (CLAUDE.md), but the actual *removal* of `heroImage`/`gallery` and the *consumption* of `media[]` by the gallery/lightbox is explicitly Phase 7 scope (IMPLEMENTATION_PHASES.md). Phase 0 adds the field and populates it in the data; Phase 7 is when components switch over.

### Phase 1 — complete

**Delivered:** new light-mode chrome (sticky white header with Explore ▾ dropdown, About, search button, 8-language pill, and a focus-trapped mobile sheet), a 3-column footer with a v0.1 tag, a homepage-only dismissible language banner (30-day localStorage), and recolor of the About / Contact / 404 pages and the shared UI primitives.

**Files created/modified (16 total):**
- *New:* `components/home/language-banner.tsx`.
- *Replaced:* `components/layout/header.tsx`, `components/layout/footer.tsx`.
- *Modified (recolor):* `components/ui/eyebrow.tsx` (+ `tone="warm"`), `components/ui/section-heading.tsx`, `components/ui/rating.tsx` (+ `tone="overlay"`), `components/ui/stat.tsx`, `components/brand/divider.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `components/contact/contact-form.tsx`, `app/not-found.tsx`.
- *Token layer (Phase 0 subset):* `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/icon.svg`.

**Verification (2026-07-07):** `npm run typecheck` clean · `npm run test` 48/48 · `npm run lint` clean · `npm run build` 23/23 static pages (incl. all 15 `/temples/[id]`). Prerendered HTML: about/contact/404 carry zero legacy tokens; the language banner is correctly absent from SSR (client-hydrated). Not exercised in a live browser: the interactive keyboard/focus behaviors (dropdown dismiss/trap, language ↑/↓, mobile-sheet focus trap, 30-day banner persistence) — implemented to standard patterns, typecheck/build clean, but manually unverified.

### Implementation decisions (Phase 1)

- **`button.tsx` left untouched** (its 5-variant rework is Phase 2). CTAs on `/about`, `/404`, and the contact form are **inline temple-red styles** instead of `<ButtonLink>`; Phase 2's new Button should reabsorb them.
- **`contact-form.tsx` recolored** even though it isn't in Phase 1's file list — it *is* the substance of `/contact`, so recoloring it was required to meet the "no nightstone on /contact" gate.
- **Language banner mounted in `layout.tsx`, gated to `/`** via `usePathname`, rather than editing the old `app/page.tsx` (which Phase 2 replaces). SSR-safe: renders `null` until hydration.
- **Menus/sheet are hand-rolled** (no Radix/react-aria) with Esc + outside-click + focus restore + roving arrows + Tab trap. Phase 3's filter popovers may want a shared primitive — consider extracting one there.
- **Deity color tokens deferred**; `display-*` sizes kept fluid (not refined to the §2.2 fixed scale); `transitionTimingFunction.threshold` kept (retuned to the new easing) for back-compat with un-migrated components.

### Deviations from the original plan

- **Phase 0 split** into "token layer now / rest later" — not in the original sequencing; a deliberate call to unblock Phase 1 without touching the data spine.
- **Footer "Methodology" link omitted** — `/methodology` has no route and is an open question (§14.4); linking it would 404. "About the project" → `/about` is present instead.
- **Footer "Suggest a temple →" added now** → `/suggest`, which **404s until Phase 8** (the plan's Phase 8 note sanctions placing the link early).
- **Header Explore ▾ presets** link to `/explore?view=map&preset=…`; the **old** Explore page ignores `?view`/`?preset`, so they currently just land on the list — they start working in Phase 3/4.
- **Header search button** navigates to `/explore` (the search overlay is Phase 6).

### Current state of the running app (transitional)

On the **new Modern Utsavam palette:** all chrome (header/footer/banner) site-wide, `/about`, `/contact`, 404, the **full homepage** (Phase 2), **`/explore`** list + map modes (Phases 3/4), and now **`/temples/[id]`** + `components/temple/detail/*` (Phase 5). No core surface remains on the old nightstone look.

Not-yet-built routes (new surfaces, not recolors): the header **search overlay** (Phase 6), **`/methodology`** and **`/suggest`** (Phase 8 — the footer link to `/suggest` 404s until then). Every Phase 0 blocker for the remaining phases is cleared.

### Environment & repo

- Git repository initialized 2026-07-08, connected to `https://github.com/OnlineBunker/ctemples.git`, pushed to `master`.
- `node_modules` is installed. Dev server: `npm run dev` → http://localhost:3000. Per-phase gate: `npm run typecheck && npm run test && npm run lint && npm run build`.
- `npm audit fix --force` remains forbidden (it downgrades Next and breaks the app).

### Phase 5 — Temple page rebuild — complete (2026-07-12)

**Delivered** (docs/06 in full, docs/12 §2, docs/07 §7, docs/03 §6.7, docs/08 §4):
- **Section engine (`lib/detail-sections.ts`, D13).** `visibleSections(temple, related)` computes which of the 18 fixed-order sections render purely on data presence — never on `editorial.tier` — and assigns 1-based display indices over only the visible set, so removing a section renumbers the rest with no gaps. `computeRelatedSections` resolves the computed-discovery sections (15–17) with cross-section dedup ("a temple appears once, first section wins", docs/06 §7) and the within-100km → same-region-top-rated fallback. `reachModes` filters how-to-reach to modes with real text. Unit-tested (`lib/detail-sections.test.ts`, 18 tests): renumber-with-gaps, dedup order, always-present floor (overview + map), architecturalStyleSlug-absent guarding.
- **SEO helpers (`lib/seo.ts`, docs/12 §2 [NOW]).** `buildTempleTitle` (≤60ch, drops the city before ever truncating the name) and `buildTempleDescription` (155ch, whyVisit → tagline → overview). 6 tests.
- **`pickSameRegionTopRated`** added to `lib/temple-queries.ts` for section 15's remote fallback (+3 tests, suite now 32).
- **Components (`components/temple/detail/*`)** all rebuilt off the dead nightstone tokens onto Modern Utsavam: back link (D8), contained 16:9 hero + morph target + action row (Save / Share / Get directions), sticky quick-facts bar (absorbs timings + entry fee, docs/06 §5 B2), desktop scroll-spy section index (D20) + mobile `<details>` disclosure + back-to-top, plan-around (grid, not carousel, D23), best-time, how-to-reach (lucide transport icons), cost table (From-city / Distance / Time / Budget / Mid-range / Luxury columns), gallery + portaled focus-trapped lightbox (docs/03 §6.7), state-scale map (docs/07 §7, reuses the Phase 4 `INDIA_STATES`/`projectLngLat` geometry re-windowed to the temple's state bbox), and the three related-content grids. Print stylesheet appended to `app/globals.css` (docs/06 §9). `app/temples/[id]/page.tsx` rewritten to render sections from the `visibleSections` array with `title.absolute` metadata (docs/12 §2). Begins `media[]` consumption via `lib/media.ts`.

**New files:** `lib/detail-sections.ts` (+ test), `lib/seo.ts` (+ test), `components/temple/detail/{action-row,back-link,back-to-top,how-to-reach,mobile-section-nav,plan-around,related-grid,section-index}.tsx`. **Modified:** `app/temples/[id]/page.tsx`, `app/globals.css`, `lib/temple-queries.ts` (+ test), `components/temple/detail/{best-time,cost-table,detail-hero,detail-section,fact-rows,gallery,nearby,quick-facts,temple-map}.tsx`, `docs/06` §10 + `docs/07` §7 (spec reconciliations, below).

**Verification:** typecheck clean · 228/229 tests (1 intentionally skipped) · lint clean · build 23/23 pages. Browser-verified (Meenakshi Amman, 7 gallery images): gallery focus-trap keeps focus inside the dialog across all three transitions (container / first / last → Shift+Tab / Tab), festival grid caps at 2 columns, section ordinal renders `ink-muted` (not sub-AA magenta), coordinates render in Space Mono, and the lightbox closes without leaving a click-blocking backdrop (`aria-hidden` / `pointer-events:none` / `opacity:0`).

**Three gallery lightbox bugs found & fixed during build-time browser verification** (before the adversarial pass): (1) the `position:fixed` lightbox rendered offset rather than viewport-covering, because a `Reveal`-animated ancestor's resting `transform` created a CSS containing block — fixed by portaling to `document.body`; (2) that portal then crashed SSR (`document is not defined`) — fixed with a post-mount `mounted` gate; (3) after close, `AnimatePresence` never fired its unmount, leaving an invisible `pointer-events:auto` backdrop that silently blocked every page click — fixed by never unmounting the backdrop and driving visibility purely via `opacity`/`pointer-events`/`aria-hidden` with a `displayItem` freeze.

**Adversarial review (5-dimension workflow — engine-correctness, page-wiring, spec-section-conformance, map-conformance, a11y-motion-gallery; each finding independently re-verified by a skeptic agent) — 4 confirmed findings fixed, 1 rejected:** the gallery focus trap could be escaped by the *initial* Shift+Tab (focus starts on the dialog container, which the Tab handler didn't treat as a boundary — the one substantive fix, docs/06 §6/§11); festival cards used `lg:grid-cols-3` vs docs/06 §5's "2-col cards"; the section ordinal used `text-magenta/60` (below AA) vs docs/03 §2.2's rule that small brand-colored text use magenta-deep (switched to `ink-muted`); the map coordinates rendered in the body face vs docs/07 §7's "mono coordinates caption". **Rejected (correctly):** a claim that the section index must be visible beside sections 1–3 — refuted as a UX preference with no cited spec requirement (every attribute docs/06 §4 actually specifies is implemented). The engine-correctness and page-wiring dimensions returned zero findings.

**Two spec reconciliations recorded in the same commit** (docs/14 §3 — code deviations get written back into the canonical spec): (a) **docs/07 §7** — the "up to 5 nearbyAttractions dots" map element is *deferred* with a dated amendment, because the `NearbyAttraction` schema carries no coordinates and inventing dot positions would fabricate geography (D12's spirit); the dots return unchanged once the schema gains coordinates. (b) **docs/06 §10** — the temple-page title/description template contradicted `docs/12 §2` (the metadata authority, which self-declares "canonical" and is marked complete-in-Phase-5); §10 now defers to §2 (`"{Name}, {City} — history, timings & how to visit"`, ≤60ch, city dropped first).

### Phase 6 — Search system — complete (2026-07-12)

**Delivered** (docs/10 in full, docs/01 D21, docs/03 §6.6):
- **D10 alias upgrade (`lib/search-aliases.ts`, rewritten).** `SEARCH_ALIASES` moved from `Record<string, DeityKey>` to a composable `SearchAlias[]` (`AliasTarget = {type:"deity"|"temple"|"place"|"tag", ...}`) — 14 entries, each with a required `note`. `jagannath` (`[deity:vishnu, place:{city:"Puri"}]`) and `balaji` (`[deity:vishnu, temple:tirumala-venkateswara-temple]`) are the spec's own composable-target worked examples, now actually shipped. `matchAliases()` does per-token/word-boundary matching (fixes the old whole-query-only lookup — "mahadev temple ujjain" now fires the alias); `resolveTargetLabel`/`resolveAliasLabel` resolve the smart-match banner's display label from a fired alias's first target.
- **`lib/search.ts` scoring.** `targetScore()` applies docs/10 §4's per-target weights (temple +2.5 pin, deity/place +2.0, tag +1.5) for every fired alias's every target, replacing the old single-canonical-deity boost. The golden-query suite (`lib/search.golden.test.ts`, frozen contract) passes unchanged — verified, not assumed.
- **`matchedAliasLabel` seam threading.** `runExploreQuery` (`lib/temple-queries.ts`) computes the resolved label once, using the full temple list it already holds (no second `getAllTemples()` call, D25); `queryTemples`/`PagedTemples` (`lib/temples.ts`) pass it through. `SmartMatchBanner` simplified to a plain `label: string | null` prop — no alias/deity lookup of its own.
- **Header search overlay + Cmd/Ctrl-K (`components/layout/search-overlay.tsx`, D19's Radix Dialog).** One responsive trigger (icon-only on mobile, "Search ⌘K" pill on desktop) — not two DOM-separate triggers, since both need to open the same `Dialog.Root`. Desktop: 480px top-anchored panel, z-70; mobile: half-height (`50vh`) bottom sheet, rounded-card top corners. 150ms-debounced typeahead via a new server action (`lib/search-actions.ts`, wraps `queryTemples` — one engine, every entry point, docs/10 §1), min 2 chars, a monotonic request-id guard against stale responses. Full combobox keyboard model: `role="listbox"/"option"`, `aria-activedescendant`, wrapping Arrow-Up/Down rove, Enter opens the highlighted result (or Explore when none), Escape closes (Radix default, focus returns to trigger). Empty state reuses the homepage's exact `POPULAR_SEARCH_CHIPS` (exported, not duplicated). Footer "See all results for '{q}' →" link.
- **Two spec reconciliations in `docs/10`** (docs/14 §3): §2's ranking-formula line grouped tag with deity/place at 2.0, contradicting §4's explicit "tag +1.5" — §2 now matches §4 (the more granular, authoritative source).

**New files:** `components/layout/search-overlay.tsx`, `lib/search-actions.ts`, `lib/search-aliases.test.ts` (63 tests: CI target-resolution gate — every alias's every target validated against the real dataset/registries — plus `matchAliases`/`resolveAliasLabel`/`resolveTargetLabel` behavior). **Modified:** `lib/search-aliases.ts`, `lib/search.ts`, `lib/temple-queries.ts`, `lib/temples.ts`, `components/explore/smart-match-banner.tsx`, `components/home/popular-searches.tsx` (exported its chip list), `components/layout/header.tsx`, `app/explore/page.tsx`, `lib/search.test.ts`, `docs/10`.

**Verification:** typecheck clean · 291/292 tests (1 intentionally skipped) · lint clean · build 23/23 pages. Browser-verified: Cmd-K opens/toggles the overlay from the homepage; typing "balaji" fires the alias, pins Tirumala Venkateswara Temple #1 with Jagannath Temple #2, shows "Matched: 'balaji' → Vishnu"; Arrow-Down + Enter navigates to the highlighted result and closes the overlay; Explore's own smart-match banner correctly shows "Showing Vishnu results for 'jagannath'" via the new seam-computed label; 375px mobile sheet renders correctly with rounded top corners; no-results and empty-query states render correctly with no dangling ARIA references (see adversarial-review fixes below).

**Adversarial review (4-dimension workflow — alias-engine-correctness, seam-data-flow, overlay-spec-conformance, a11y-keyboard-focus; each finding independently re-verified) — 2 confirmed findings fixed, 2 rejected:** `aria-controls`/`aria-expanded` on the overlay's input were computed independently of each other and of the listbox's actual mount condition, so `aria-controls` referenced a nonexistent id in 2 of 4 render states (empty query, no-results) and `aria-expanded` could read `false` while an empty listbox was genuinely mounted (the pending-just-crossed-2-chars window) — fixed by deriving both from one shared `listboxRendered` boolean; the typeahead's request-id guard only bumped at debounce-*fire* time, so a fast edit-then-revert (e.g. "shiv"→"shiva"→"shi") could still apply a stale in-flight response over a since-changed query — fixed by bumping the id on every keystroke instead. **Rejected (correctly):** a claim that `resolveAliasLabel`'s place/stateSlug branch never compares state (refuted — I had already independently found and fixed this exact bug during my own recon, before the review even ran, and added dedicated `resolveTargetLabel` unit tests proving it); a claim that docs/10 §6's "alias chip" wording requires a per-result badge rather than the existing single list-level banner (refuted — §4/§7's "banner unchanged"/"banner behavior... never change" is the more authoritative, D10-governing text, and matches the already-shipped `SmartMatchBanner` precedent).

### Phase 7 — Media migration completion — complete (2026-07-12)

**Delivered** (docs/13 P7 scope):
- **Consumer migration finished.** The last 3 remaining `Temple.heroImage` readers — `app/page.tsx`'s homepage hero carousel, `components/home/trip-ideas.tsx`'s representative-photo lookup, and `components/temple/temple-card.tsx`'s card image — now all read `getHero(temple.media)?.url ?? ""` via `lib/media.ts`, the same seam every other surface (Explore, temple detail, related grids) has used since Phases 3 and 5. `components/home/hero-slide.tsx`'s own `HeroSlideData.videoUrl` field is untouched — confirmed independent of `Temple.videoUrl`, never fed from it.
- **Legacy fields deleted.** `heroImage: string`, `gallery: string[]`, `videoUrl: string` removed from `Temple` in `lib/types.ts`, and from all 15 records in `data/temples.ts` — `media: MediaItem[]` (already complete and correct for every record since Phase 0) is the sole image source now. `lib/validate.ts`'s now-redundant `t.gallery` length check removed (the `media[]` check a few lines below already covers it). `lib/__fixtures__/temple.ts`'s test fixture no longer sets the dead fields.
- **Lightbox attribution + video handling** (docs/06 §6, docs/03 §6.7): already fully satisfied by Phase 5's `components/temple/detail/gallery.tsx` (interim "Images: Wikimedia Commons" credit, `kind==="video"` poster+tap-to-play+muted branch) — confirmed unchanged and untouched this phase; docs/09 §8 is explicit that the *real* per-image `MediaAttribution` field is Stage B/production, not due now, so there was no lightbox code to add.
- **Zero visual/behavioral change, verified two ways:** (a) a read-only script confirmed `media[0].url === heroImage` for all 15 records *before* the legacy fields were deleted — the substitution is byte-identical; (b) post-migration, DOM-level checks (`img.src`/`complete`/`naturalWidth`) confirmed every migrated consumer resolves the correct photo URL live in the browser (homepage hero carousel, all 4 Trip Ideas cards, and `TempleCard` instances in a temple detail page's related-grids).

**Modified files:** `lib/types.ts`, `data/temples.ts`, `app/page.tsx`, `components/home/trip-ideas.tsx`, `components/temple/temple-card.tsx`, `lib/validate.ts`, `lib/__fixtures__/temple.ts`. No new files.

**Verification:** typecheck clean · 291/292 tests (1 intentionally skipped) · lint clean · build 23/23 pages. Browser-verified live (homepage hero carousel, Trip Ideas, a temple detail page's related-temple cards) — all render the correct photos with zero regressions.

**Adversarial review (3-dimension workflow — data-integrity, consumer-migration-completeness, spec-conformance-and-docs; each finding independently re-verified) — 0 confirmed findings, 2 rejected:** both rejected findings correctly identified as out-of-scope documentation-staleness in files this diff never touches (`docs/13`'s P7 row and `docs/09` §2's own forward-reference sentence both still describe already-shipped Phase 5 work / the now-completed migration in future tense) — consistent with this project's established precedent of never retroactively editing a spec file's "what Sonnet does next" section after the phase it describes ships; `PROJECT_CONTEXT.md` alone is the live "what's actually done" tracker per `docs/14`. Two full review dimensions (data-file integrity across all 15 records; exhaustive consumer-migration completeness) returned zero findings.

### Phase 8 — /suggest + /methodology — complete (2026-07-12)

**Delivered** (docs/02 §1.1/§2, docs/12 §6, D7):
- **`app/methodology/page.tsx` (new).** A thin route (D7 — "same content the About page embeds") rendering a new shared `MethodologyContent` component under its own H1/intro.
- **`components/methodology/methodology-content.tsx` (new).** The methodology prose lives in exactly one place, rendered on both `/about` and `/methodology` — satisfies D7's "same content" literally rather than duplicating similar-but-drifting text in two files. Covers docs/12 §6's four required beats: how entries are researched (hand-written from freely-licensed public sources), the no-fabrication policy (omission over guessing; every claim checked against a source; screened for banned marketing phrases and duplicated passages — verified these checks are real, existing code in `lib/anti-slop.ts`, not aspirational), the licensing note (reused verbatim from the pre-existing `/about` paragraphs — image licensing + map-data attribution), and a link to `/suggest`. Deliberately does **not** claim a live CI-enforced pipeline, a tier system, or verification badges the prototype doesn't have (`lint:content` is a real but standalone script, not wired into build/CI) — honest about the current stage, consistent with D12/the anti-slop charter's own spirit applied to the methodology copy itself.
- **`app/about/page.tsx` (modified).** Its 3 trailing note-paragraphs replaced with the shared `MethodologyContent` under a new "How we choose" section — so `/about` and `/methodology` render identical prose from one source, not two copies that could drift.
- **`components/suggest/suggest-form.tsx` + `app/suggest/page.tsx` (new).** Modeled directly on the existing `ContactForm`/`/contact` pattern (docs/02 §1.1: "Forms never submit anywhere — visible 'prototype — nothing was sent' notice, no fake success"): a prototype disclaimer, `e.preventDefault()` + an honest non-submission status message (verified both the name-populated and empty-name interpolation branches live), never a fake success. Fields: temple name, city/state, optional email, why it belongs.
- **Link flips.** `components/home/methodology-teaser.tsx`'s "How we choose →" now points to `/methodology` (was `/about`, with a code comment noting the route didn't exist yet — now stale, removed). `components/layout/footer.tsx` gained a "Methodology" → `/methodology` link alongside the existing "About the project" → `/about` (docs/02 §2's exact footer spec); the stale "`/suggest` ships in Phase 8" forward-reference comment removed since the page now exists.
- **Self-caught fix before the review even ran:** `MethodologyContent`'s three section headings were `<h3>` with no `<h2>` above them on either consuming page (`Eyebrow` renders a `<p>` by default, not a heading) — a skipped heading level (h1→h3). Promoted to `<h2>`, matching how every other section on `/about` already uses h2.

**New files:** `app/methodology/page.tsx`, `app/suggest/page.tsx`, `components/methodology/methodology-content.tsx`, `components/suggest/suggest-form.tsx`. **Modified:** `app/about/page.tsx`, `components/home/methodology-teaser.tsx`, `components/layout/footer.tsx`.

**Verification:** typecheck clean · 291/292 tests (1 intentionally skipped) · lint clean · build 25/25 pages (up from 23 — the two new routes). Browser-verified live: both new pages render correctly desktop + 375px; the shared methodology prose is byte-identical on `/about` and `/methodology`; footer and homepage-teaser links resolve to the right routes; the suggest form's honest non-submission message correctly interpolates the temple name when provided and falls back cleanly when not; zero console errors.

**Adversarial review (3-dimension workflow — content-honesty-spec-conformance, ia-and-link-completeness, form-a11y-and-behavior; each dimension independently investigated) — 0 confirmed findings, 0 rejected:** all three dimensions returned genuinely empty findings (confirmed via the workflow journal, not just the summary) — no fabricated claims in the methodology copy, no stale `/about`-as-methodology-stand-in references left anywhere else in the repo, well-formed heading hierarchy on both `/about` and `/methodology` after the pre-emptive fix above, and the `SuggestForm` correctly mirrors `ContactForm`'s accessible-label/honest-status pattern with no drift.

### Recommended next step

**Proceed to Phase 9 — Consistency cleanup** per `docs/13_IMPLEMENTATION_MASTER_PLAN.md`. Start sequence for a future session:

1. Read this **Build status** section, then D19 (Radix popover migration) and D1 (legacy token aliases) in `docs/01_PRODUCT_NORTH_STAR.md`, and `docs/08 §5#1` (deity-icon stroke-draw micro-interaction).
2. Migrate the remaining hand-rolled popovers (header dropdowns, state-tile popovers) to Radix; **delete the legacy Tailwind color-alias tokens** (`temple-red`, `sand-yellow`, `warm-gold`, etc. — still present across nearly every page today, intentionally, per D1) now that every page has migrated to Modern Utsavam, and add the CI grep D1 calls for; ship the deity-icon stroke-draw hover/focus micro-interaction; sweep for stale classes/emoji/z-index values outside the docs/03 scale.
3. Finish on `typecheck && test && lint && build` green, browser verification (desktop + 375px, keyboard pass), and an adversarial review pass, per `docs/14_CLAUDE_CODE_OPERATING_SYSTEM.md`.

**One open product decision, carried from P4 and still unresolved (not blocking P9):** the D17 rest-map palette gives ~1.19:1 boundary contrast between adjacent unselected states (`#F4EADF` fill + `#FFFFFF` stroke), below WCAG 1.4.11's 3:1 for meaningful graphical boundaries. It is exactly what D17 specifies, so changing it is a D17 amendment — decide whether to darken the rest stroke.

---

## 1. Project vision

CTemples is a **Wikipedia-style encyclopedia of Indian temples** — a content platform that aims to be the most comprehensive, trustworthy, and tourist-friendly guide to temples in India.

The visual and emotional identity is **light-mode, vibrant, premium, and welcoming** — closer to a high-end travel magazine than to a museum site.

### Design tenets

- **Light mode is primary and default.** No dark mode. No "switch theme" UI.
- **Vibrant, not minimal.** Information density is the goal. The site rewards long reading sessions.
- **Spiritual + tourist-friendly.** Premium without being austere. The look says: "This is a serious reference work, and you should want to visit these places."
- **Mobile-first.** The most common reader is on a phone, planning a trip, with intermittent connectivity.

### Color palette (the canonical hex)

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#FFFFFF` | Page background |
| `canvas-soft` | `#FAF7F0` | Alternate sections, soft surfaces |
| `ink` | `#1A1A1A` | Body text, primary ink |
| `ink-muted` | `#5A5A5A` | Secondary text, captions |
| `ink-subtle` | `#8A8A8A` | Tertiary text, metadata |
| `line` | `#E5E0D6` | 1-px hairlines, card borders |
| `line-strong` | `#C9C2B0` | Card hover borders, emphasis |
| `temple-red` | `#C62828` | Brand primary, CTAs, links, eyebrow default |
| `temple-red-soft` | `#FBE9E7` | Active states, selected surfaces |
| `temple-red-deep` | `#8E1F1F` | Hover on primary CTA |
| `sand-yellow` | `#E6C068` | Star fills, accent surfaces, premium highlight |
| `sand-yellow-soft` | `#FBF1D9` | Empty-state surfaces, soft accents |
| `sand-yellow-deep` | `#B68A3C` | Borders on warm surfaces |
| `warm-gold` | `#B8860B` | Premium accents, region motifs, divider gopurams |
| `warm-gold-soft` | `#F5E9C8` | Background tints on premium cards |

### Typography

- **Display:** Fraunces (serif, "carved-stone feel") — H1, H2, section titles.
- **Body:** Hanken Grotesk (humanist sans) — body copy, UI text.
- **Mono:** Space Mono (eyebrows, coordinates, fees, indices, "X temples · Y days · ~Z km" meta).

All three are self-hosted via `next/font` (no third-party requests at runtime).

### Visual inspiration

Wikipedia (information depth) + Lonely Planet / Nat Geo Travel (premium tourism feel) + Indian cultural heritage portals (warmth, ornamentation) + premium tourism platforms (modern UX patterns).

---

## 2. Final sitemap

### 2.1 Routes

```
/                          Home (hero carousel + 6 sections)
/explore                   Searchable / filterable grid
/explore?view=map          Same data, map mode
/temples/[id]              One temple dossier (18 sections)
/about                     About the project + methodology
/contact                   Partner inquiry (UI-only form)
/suggest                   "Suggest a temple" form (UI-only)
/not-found                 404
```

There is **no** `/states/[slug]`, `/deities/[slug]`, `/regions/[slug]`, or `/blog`. State, deity, and region are **filters** on `/explore`, not top-level routes. The 3-click rule is the goal, and one filter URL is a click away from the homepage.

### 2.2 URL contract for `/explore`

```
?view=list|map            Default: list
?q=<query>                Alias-aware search
?state=<slug>             28 states + 8 UTs
?deity=<slug>             6 deities
?tag=<slug>               Repeats up to 3 times
?sort=rating|popularity|name   Default: rating
?preset=<slug>            Pilgrimage | Architecture | Discover (top of Explore)
?page=<n>                 Paginated
```

The URL is the **single source of truth**. Every filter round-trips through the URL. The back/forward buttons restore any filter combination.

### 2.3 URL contract for `/temples/[id]`

```
/temples/<slug>           e.g. /temples/tirupati
```

No query parameters on the detail page. (Filters are on `/explore`; deep linking to a filtered Explore state is the contract for the back link from the detail page.)

---

## 3. Information architecture

### 3.1 The 3-click rule

A user should reach any temple in **3 clicks** from the homepage:

```
Click 1:  Homepage → /explore (any CTA: trip idea, state tile, deity tile,
          popular search, hero CTA, or "Explore India" nav)
Click 2:  /explore → filter (state, deity, tag, or search) or just browse
Click 3:  /explore → /temples/[id]
```

The previous prototype allowed 4+ clicks. The new design budget is **3 clicks max, 2 preferred**.

### 3.2 Navigation surfaces

| Surface | Where | Purpose |
|---|---|---|
| Sticky header | All pages | Brand, primary nav, search, language |
| Hero CTA | Homepage | Direct entry to a curated Explore state |
| Trip ideas | Homepage | Pre-canned Explore URLs |
| State strip | Homepage | Pick-by-state; 6 visible + popover for 37 |
| Popular searches | Homepage | 6 chips → pre-canned Explore URLs |
| Deity tiles | Homepage | 6 tiles → `/explore?deity=<slug>` |
| Mode toggle | `/explore` | List ⇄ Map |
| Filter row | `/explore` | State · Deity · Tag · Sort |
| Region pills | Map mode | 6 regions + All |
| Back link | Detail | "← Back to [state] temples" |

### 3.3 Content hierarchy

```
Temple (canonical record, in data/temples.ts)
├── Hero (1 photo, 16:9, with overlay)
├── Quick facts (6 inline)
├── Why visit (3–4 sentences, editorial)
├── Plan around (3 nearest temples + summary)
├── Best time (months + time of day + festivals)
├── Overview (long-form)
├── How to reach (long-form)
├── History (long-form)
├── Legends & mythology (long-form)
├── Architecture (long-form)
├── Spiritual significance (long-form)
├── Cost to visit (table)
├── Gallery (image + video, lightbox)
├── Map (lat/lng plot, no API key)
├── Within 100 km (up to 4 cards, by Haversine)
├── By the same deity (up to 3 cards)
├── Same architectural style (up to 3 cards)
└── Nearby attractions (free text list)
```

Sections are reordered from the current dossier (which had 11 sections in a different order). The new order puts **tourist-relevant** information first (why visit, plan around, best time) and **encyclopedic depth** (history, legends, architecture) later — closer to how a Lonely Planet or Wikipedia entry would be structured.

---

## 4. UX decisions (locked)

### 4.1 Carousels: limited and sensible

- The **only** carousel on the site is the homepage hero (5–6 slides, no autoplay).
- All other "scrollable" content is a **horizontal scroll** on mobile / **grid** on desktop — not a carousel.
- No autoplay. No infinite loop. No autoplay-paused-on-hover UX. The hero carousel has visible prev/next buttons, dots, and keyboard control.
- The mobile bottom sheet on map mode uses **snap points** (peek / half / full), not a carousel.

### 4.2 Autoplay: muted by default

- Video in the lightbox is **muted, playsInline, no controls** initially.
- A visible "Tap to unmute" button is the only path to sound.
- No autoplay on the hero. The hero is photo-only.
- No autoplay on the "trip ideas" or "popular searches" rows.

### 4.3 Search: alias-aware, single list

- One search bar, on `/explore`, with a header-search overlay as a quick entry.
- The same `lib/search.ts` powers both.
- The search returns **one ranked list** (no "smart" vs "all" split).
- Aliases (`mahadev → shiva`, `nataraja → shiva`, etc.) surface the matched alias as a "matched as 'Shiva temples'" chip in the smart-match banner.
- The alias map is **data, not code**. It's `lib/search-aliases.ts` — easy to extend without code review.

### 4.4 Map mode: simplified India, no API key

- An inline SVG of India with state polygons. No Mapbox, no Leaflet, no Google Maps JS API.
- Each state is a clickable button (`<g role="button" tabindex="0">`).
- Region cluster circles overlay the polygons, sized by `log(count + 1)`.
- A visually-hidden `<ul>` of state links mirrors the map for screen readers.
- State names appear in the right column (desktop) or bottom sheet (mobile).
- The detail page's small map is a coordinate plot, not a real map. It links out to Google Maps for directions.

### 4.5 Detail page back link

- "← Back to [state] temples" → `/explore?view=map&state=<slug>`
- Not "← All temples" → `/explore`. The back link is state-aware.

### 4.6 Filter UX: structured, not chaotic

- 4 filters in a row: State · Deity · Tag · Sort.
- Each filter is a **trigger button + popover** (focus-trapping, Esc-to-close, dismissible on outside click).
- The active filters appear as **removable chips** below the filter row.
- Max 3 tags (the design system enforces this; UX-spec'd to prevent over-narrowing).
- No "show more" disclosure; the 4 filters are always visible.

### 4.7 Mobile bottom sheet: snap points, not full-screen

- The map mode's right column on mobile is a **bottom sheet** with peek (just the handle + state name), half (compact results list), and full (full results list + filters) snap points.
- The sheet uses Framer Motion's `drag` and `useDragControls`.
- Focus is trapped at half/full; Esc closes.
- Replaces the "modal takeover" pattern that mobile sites often use.

### 4.8 Forms: UI-only, explicit disclaimer

- `/contact` and `/suggest` are **UI-only** forms. They show a visible "this is a prototype, nothing was sent" notice.
- No network call. No fake success. No optimistic update.
- The forms exist to demonstrate the *design* of the form, not to actually submit.

### 4.9 3D embers: removed

- The `react-three-fiber` 3D embers accent on the previous hero is **removed**.
- The light-mode hero is photo-only.
- `three` and `@react-three/fiber` are removed from `package.json`. There is no 3D in the prototype.

### 4.10 Region mandala: removed

- The 6-wedge mandala on the old homepage ("Browse by region") is **removed**.
- The mandala SVG itself is reused as a decorative element in the methodology teaser or footer.
- Region navigation now happens via:
  - The state strip (homepage, by state, not by region).
  - The deity tiles (homepage, by deity).
  - The region pills on the map mode (Explore).

---

## 5. Homepage specification

### 5.1 Section order

1. **Sticky header** (logo, Explore ▾, About, search button, language pill)
2. **Language banner** (homepage only; dismissible; "Available in 8 Indian languages — coming soon.")
3. **Hero carousel** (5–6 slides, no autoplay; full-bleed photo, eyebrow, H1/H2, primary + secondary CTA)
4. **Editorial paragraph** (2 sentences; max 640 px; centered)
5. **Trip ideas** (4 cards; "X temples · Y days · ~Z km" meta; "Explore →")
6. **State strip** (6 tiles + trailing "See all states →" tile; horizontal scroll on mobile)
7. **Popular searches** (6 chips; pre-canned Explore URLs)
8. **Deity tiles** (6 tiles in a 3×2 grid; deity icon + name + temple count)
9. **Methodology teaser** (paragraph + "How we choose →")
10. **Footer** (3 columns: About / Contribute / Connect)

### 5.2 Hero carousel

- 5–6 slides; each slide has a real photo, eyebrow, H1/H2, primary CTA, secondary CTA.
- Aspect ratio: 16:9 desktop, 4:3 mobile, 60 vh max on mobile.
- Visible prev/next buttons (left/right edge of photo), visible dots, visible counter ("2 of 6").
- Keyboard: ←/→ moves, Home/End jumps, dots are buttons.
- No autoplay. No "tap to pause" UX. A small "(no autoplay)" caption is fine.
- Respects `prefers-reduced-motion` — the slide transition is a fade, not a slide.
- The first slide is `priority` (LCP); subsequent slides are lazy-loaded.
- Photos are real Wikimedia Commons URLs (consistent with the existing prototype).

### 5.3 State strip

- 6 visible tiles; horizontal scroll on mobile, grid on desktop.
- Each tile: state silhouette (SVG) + state name (Fraunces) + temple count (Space Mono).
- Each tile is a **button**, not a link. Tapping opens a popover with the state's top 4 temples + "See all →" link.
- The 7th tile is "See all states →" — a link that opens a full picker popover with 37 states/UTs and a search input.
- State silhouettes are 8–10 hand-drawn or GeoJSON-derived SVGs (the same data drives the India map on Explore).

### 5.4 Deity tiles

- 6 tiles in a 3×2 grid.
- Each tile: deity icon (hand-built SVG) + deity name (Fraunces H3) + temple count (Space Mono).
- Each tile is a **link** → `/explore?view=list&deity=<slug>`.
- Deities: Shiva, Vishnu, Devi, Buddha, Ganesha, Murugan.
- Icons: trishul, sudarshana-chakra, lotus, ankusha, vel, gadaa.

### 5.5 Popular searches

- 6 chips: "Shiva temples," "Tamil Nadu," "UNESCO sites," "Pilgrimage," "Himalayan temples," "Living temples."
- Each chip is a **link** → pre-canned Explore URL (using aliases, not raw filter values).
- Chips are the `FilterChip` component (recolored to the new palette).

### 5.6 Trip ideas

- 4 cards in a row (desktop) / 2×2 (tablet) / 1 column (mobile).
- Each card: photo, title, 1-line description, "X temples · Y days · ~Z km" meta, "Explore →".
- Trip ideas are pre-canned: e.g. "The Chola Trail · Tamil Nadu" (4 temples, 5 days, ~600 km) → `/explore?view=list&preset=chola-trail&state=tamil-nadu`.

### 5.7 Methodology teaser

- A short paragraph + "How we choose →" link.
- Replaces the methodology callout in the old 4-stat strip.
- The mandala SVG from the old region-explorer is reused here as a decorative motif.

### 5.8 Removed from the homepage

- The 3D embers accent (`components/home/hero-embers.tsx` + `hero-embers-mount.tsx`).
- The region mandala (`components/home/region-explorer.tsx`).
- The 4-stat strip ("2,000+ temples · 28 states · 6 cultural regions · 100s of festivals").
- The "Featured temples" grid (folded into the trip ideas + popular searches).
- The parallax motion on the hero.
- The "scroll inward" cue at the bottom of the hero.

---

## 6. Explore page specification

### 6.1 Two modes

- **List mode (default):** 3-column grid on desktop, 2-column tablet, 1-column mobile.
- **Map mode:** India map on the left (60% width on desktop), right column on the right (40% width). On mobile, the map is full-width and the right column is a bottom sheet.

### 6.2 Mode toggle

- Two buttons: "List" (with list icon) and "Map" (with map icon).
- The active mode has `aria-pressed="true"` and a temple-red underline.
- Clicking a button updates `?view=` in the URL.

### 6.3 Filter row

- 4 trigger buttons: State · Deity · Tag · Sort.
- Each is a button that opens a popover. Active filters show a count badge ("State: 1").
- A "Reset all" link is at the right end of the row (only visible when ≥1 filter is active).

### 6.4 Filter popovers

- **State popover:** 37 states/UTs with a search input (filter as you type). Selecting a state closes the popover.
- **Deity popover:** 6 deities (the same 6 as the homepage tiles). Selecting one closes the popover.
- **Tag popover:** 5–6 popular tags as checkboxes. Max 3 selected. "Done" button to close.
- **Sort popover:** 3 options — Top rated (default), Most visited, A–Z.

All popovers trap focus, dismiss on Esc, and dismiss on outside click.

### 6.5 Active filters row

- Removable chips below the filter row.
- Each chip: filter name + value + "×" remove button. `aria-label="Remove filter: [name] [value]"`.
- Trailing "Reset all" chip.

### 6.6 Search bar

- Top of the page, full width, sticky on scroll.
- Leading search icon, trailing clear button.
- Debounced URL update (≤300 ms on idle).
- The query is server-side computed (per `lib/search.ts`).

### 6.7 Smart-match banner

- Below the search bar.
- "Showing 47 temples for 'mahadev' (matched as 'Shiva temples')." + dismiss (×) button.
- `role="status"`, `aria-live="polite"`.
- Hidden when the query is empty.

### 6.8 Result grid

- 3 columns desktop, 2 tablet, 1 mobile.
- Cards use the `TempleCard` component (16:9 photo, white surface, 12-px radius, 1-px `line` border, sand-yellow ring on hover).
- The cards are the source of the **view-transition morph** to the detail hero.

### 6.9 Pagination

- ‹ 1 2 3 … N › control at the bottom of the grid.
- Truncated middle (no more than 7 visible page indicators).
- `aria-label="Page N"` on each link; `aria-current="page"` on the active page.

### 6.10 Empty state

- Sand-yellow-soft background, temple-red icon (gopuram).
- "No temples match those filters." H3 + paragraph.
- "Reset all filters" primary button.

### 6.11 Map mode — map (left)

- Inline SVG of India, 60% width on desktop, full-width on mobile (when bottom sheet is closed).
- State polygons are `line` fill, hover/selected are `temple-red`.
- Region cluster circles overlay the polygons.
- A visually-hidden `<ul>` of state links mirrors the map for screen readers.
- `next/dynamic` lazy-loaded (not in the initial bundle).

### 6.12 Map mode — right column (desktop) / bottom sheet (mobile)

- **Sticky on desktop.** Scrolls with the page on mobile.
- **Your-state pill:** sticky at the top. Prompts first-time visitors to pick a state. Persists in `localStorage`.
- **State header:** state name (H2) + temple count.
- **Scoped search input** (filters within the selected state).
- **Sort dropdown** (3 options).
- **Compact card list:** 1 column, 1 card per row. The cards are a slimmer variant of the standard `TempleCard`.
- **Pagination** at the bottom.

### 6.13 Mobile bottom sheet

- Framer Motion drag with snap points: peek (handle + state name), half (compact list), full (full list + filters).
- Drag handle at the top; the sheet is dismissible by dragging below peek.
- Focus is trapped at half/full; Esc closes.
- Respects `prefers-reduced-motion` (the drag is disabled; the sheet opens/closes with a fade).

---

## 7. Temple page specification

### 7.1 Section order (18 sections)

1. **Hero** (16:9 photo, 1 photo, with overlay)
2. **Quick-facts bar** (6 facts: Built · Dynasty · Style · Deity · Open today · Entry)
3. **Why visit** (3–4 sentences from `temple.whyVisit`)
4. **Plan around** (3 nearest temples + "X temples · Y days · ~Z km" summary)
5. **Best time** (callout: months + time of day + festivals)
6. **Overview** (long-form)
7. **How to reach** (long-form)
8. **History** (long-form)
9. **Legends & mythology** (long-form)
10. **Architecture** (long-form)
11. **Spiritual significance** (long-form)
12. **Cost to visit** (table)
13. **Gallery** (image + video, lightbox)
14. **Map** (lat/lng plot, no API key, "Open in Google Maps" link)
15. **Within 100 km** (up to 4 cards, by Haversine)
16. **By the same deity** (up to 3 cards)
17. **Same architectural style** (up to 3 cards)
18. **Nearby attractions** (free text list)

### 7.2 Hero

- 16:9 desktop, 4:3 mobile, 60 vh max on mobile.
- The view-transition morph source — `view-transition-name="temple-${id}"` on the photo.
- Back link: "← Back to [state] temples" → `/explore?view=map&state=<slug>`.
- Action row (top-right): Save · Share · Get directions.
- Overlay: region badge (left), star rating + visit count (right), H1 name (center), tagline + city/state (below).
- The first photo is `priority` (LCP).

### 7.3 Quick-facts bar

- 6 facts in a horizontal row on desktop, horizontally scrollable on mobile with a right-edge fade.
- Each fact: label (Space Mono, 11 px, ink-subtle) + value (Hanken 14 px, ink).
- The "Open today" and "Entry" facts are derived (e.g. "Open 6:00 AM – 9:00 PM" and "Free" or "₹ 20–100").

### 7.4 Why visit

- H2 + 3–4 sentences from `temple.whyVisit`.
- The text is **editorial**, not auto-generated from the overview.
- Hanken body, 18 px, 1.7 line-height, `text-ink/85`.

### 7.5 Plan around

- 3 nearest temples (Haversine distance, fallback to region match if <2 within 100 km).
- Summary line: "5 temples · 4 days · ~600 km" (uses `temple.tripDuration` if set, else derived from the 3 nearest temples).
- Cards are the standard `TempleCard` in a horizontal row (1 column on mobile, 3 columns on desktop).

### 7.6 Best time

- A 2-up callout: "Ideal months" (Jan, Feb, Mar, …) + "Time of day" (sunrise, sunset, etc.).
- Festivals grid: each festival has a name, a 1-line description, and a date range.

### 7.7 Long-form sections (Overview, How to reach, History, Legends, Architecture, Significance)

- H2 + `\n\n`-delimited paragraphs.
- Hanken body, 18 px, 1.7 line-height, `text-ink/85`.
- The "Architecture" section may have H3 sub-sections (vimana, mandapa, gopuram).

### 7.8 Cost to visit

- A 2-column table on desktop, a 1-column card list on mobile.
- Each row: line item (label) + value (formatted rupees).

### 7.9 Gallery

- 2-column grid on desktop, 1-column on mobile.
- Lightbox (focus-trapping, Esc, keyboard nav, backdrop click).
- Image items: `<Image>` from `next/image`.
- Video items: `<video controls muted playsInline preload="metadata">` with a visible "Tap to unmute" button.
- Failed media falls back to the procedural `TempleScene`.

### 7.10 Map

- Inline SVG coordinate plot, no API key.
- Background: `canvas-soft` with `line` graticule.
- Marker: `temple-red` MapPin (no flicker, no glow).
- "Open in Google Maps" link below the map, with the lat/lng pre-filled.

### 7.11 Within 100 km

- Up to 4 cards, by `pickWithinRadius` (Haversine).
- Each card shows the distance via `formatRelativeDistance` ("38 km away").
- Fallback to same-region cards if <2 temples are within 100 km.
- Hidden if no match.

### 7.12 By the same deity / Same architectural style

- Up to 3 cards each.
- Hidden if no match.

### 7.13 Nearby attractions

- A free-text list of nearby non-temple attractions (parks, museums, viewpoints).
- Not a "related temples" list — that's covered by the 3 previous sections.

---

## 8. Search system

### 8.1 Two entry points

- **Header search button** (top-right of the sticky header) → opens the search overlay.
- **Search bar** at the top of `/explore` → the persistent search.

Both use the same `lib/search.ts` and the same alias map.

### 8.2 Header search overlay

- Full-screen on mobile, right-side panel on desktop.
- Traps focus. Closes on Esc. Closes on outside click.
- Live results as the user types (debounced ≤100 ms for the 15-temple dataset).
- Result groups: **Top match** (one temple) and **Mentions** (deity, state, architectural style).
- Empty state: "No results for X" + popular searches.

### 8.3 Explore search bar

- Top of the page, sticky on scroll.
- Debounced URL update (≤300 ms on idle).
- Server-side computation: the page reads `?q=`, calls `lib/search.ts`, and renders results.
- The smart-match banner appears below the search bar when an alias is matched.

### 8.4 Alias map

- `lib/search-aliases.ts` exports the alias map. Data, not code.
- Initial seed: 8–20 entries. Examples: `mahadev → shiva`, `nataraja → shiva`, `vishnu → vishnu`, `gautama-buddha → buddha`, `parvati → devi`, `murugan → murugan`.
- Aliases are typed `Record<string, string>` with a "Why this alias?" comment per entry.
- The map is extended in Phase 6 of the implementation plan.

### 8.5 Smart-match banner

- "Showing 47 temples for 'mahadev' (matched as 'Shiva temples')."
- `role="status"`, `aria-live="polite"`.
- Dismissable (× button). Hides on dismiss; re-shows on a new query.

---

## 9. Navigation system

### 9.1 Sticky header

- Logo (top-left, gopuram silhouette + "CTemples" wordmark).
- Explore ▾ (dropdown with 3 presets: Pilgrimage · Architecture · Discover).
- About (top-level link).
- Search button (top-right, opens the search overlay).
- Language pill (top-right, 8-language dropdown, all but English "Coming soon").
- Mobile: logo + hamburger; sheet mirrors the desktop nav with expand/collapse for Explore.

### 9.2 Footer

- 3 columns: **About** (logo, one-line description, About link, Methodology link) · **Contribute** (Suggest a temple →, Partner with us →) · **Connect** (social placeholders, copyright, "Made in India.").
- Bottom bar: "v0.1 prototype" tag.

### 9.3 Skip-to-content

- The first focusable element on every page.
- Becomes visible on focus.
- `bg-temple-red text-canvas` for AA contrast.

### 9.4 Keyboard map

| Action | Shortcut |
|---|---|
| Skip to content | Tab (from page load) |
| Open search overlay | Click search button / `Cmd-K` (TBD) |
| Close overlay / popover / sheet | Esc |
| Move carousel | ← / → / Home / End |
| Activate tile / button | Enter / Space |
| Move between filter popovers | Tab (from filter row) |

### 9.5 URL is the source of truth

- Every filter, sort, page, and mode round-trips through the URL.
- The back/forward buttons restore any state.
- The URL is shareable.

---

## 10. Design decisions (locked)

### 10.1 Visual identity

- Light mode only. No dark mode toggle. No system theme detection.
- White canvas, ink text, temple-red CTAs, sand-yellow accents, warm-gold for premium surfaces.
- Hairlines are 1 px `line` (or warm-gold at 30% opacity for premium sections).
- Focus ring: 2-px `temple-red` outline, 2-px offset, no rounded corners.
- Selection: `temple-red-soft` background, `ink` color.

### 10.2 Motion philosophy

- **Three motion types only:** scroll reveals, page transitions, and the one memorable moment (the card → hero morph).
- Scroll reveal: 16-px translate + 3-px un-blur, 350 ms, 60 ms stagger, ease `cubic-bezier(0.22, 1, 0.36, 1)`.
- Page transition: the shared-element morph (card → hero) only. No directional slide.
- The one memorable moment: the card → hero morph. Everything else is restrained.
- **No ambient loops.** No diya flicker, no mandala spin, no 3D embers.
- `prefers-reduced-motion` is a floor: every animation is reduced or disabled.

### 10.3 Components and primitives

The design system has these primitives:

- **Buttons** (5 variants × 3 sizes): primary, secondary, tertiary, warm, destructive. sm (32 px), md (44 px, default), lg (52 px).
- **Cards** (5 compositions): `TempleCard` (standard), `TempleCardCompact` (slim for map mode), `TripIdeaCard`, `DeityTile`, `StateTile`.
- **Pills / chips** (4 types): `Tag`, `RegionBadge`, `DeityBadge`, `ActiveFilterChip`.
- **Sections**: `SectionHeading` (H2 + eyebrow + optional action slot), `DetailSection` (H2 + content), `StatFigure`, `Rating`, `Eyebrow`.
- **Filter popover** (generic over content), filter triggers, active filters row, pagination.
- **Search**: `SearchBar`, `SearchOverlay`, `SearchResult`, `SearchEmpty`, `SmartMatchBanner`.
- **Map**: `IndiaMap`, `RegionPills`, `StateResultsColumn`, `YourStatePill`, `BottomSheet`, `ModeToggle`.
- **Brand**: `GopuramMark`, `MandalaMark`, `Divider`, 6 `DeityIcon`s, 6 `RegionIcon`s, 8–10 `StateSilhouette`s.
- **Media**: `TempleImage`, `PhotoWithFallback`, `TempleScene` (procedural fallback, daytime palette).

### 10.4 Accessibility floor

- WCAG 2.1 AA contrast on every surface.
- Keyboard-operable on every interactive element.
- Visible focus on every focusable element.
- `prefers-reduced-motion` respected everywhere.
- `prefers-reduced-data` considered (no autoplay video, no autoplay carousel).
- Touch targets ≥ 44×44 px.
- 200% zoom test passes (no horizontal scroll).
- Screen reader walkthrough passes on every page.
- Semantic HTML, labelled controls, alt text on every image.

### 10.5 Performance floor

- Lighthouse Performance ≥ 90 on `/`, `/explore`, `/temples/<id>`.
- Lighthouse Accessibility ≥ 95 on every page.
- Lighthouse Best Practices ≥ 95 on every page.
- LCP < 2.5 s on simulated 4G Moto G4.
- Single `priority` image per page (the hero).
- All other images are lazy-loaded with `next/image`.
- `next/dynamic` for the India map (map mode only).
- `next/font` self-hosts all three fonts.

### 10.6 Out-of-design decisions

- **No skeletons.** A loading state is a banner ("Loading temples…") or a static empty state. No shimmering rectangles.
- **No tooltips on touch.** Tooltips are keyboard-only on desktop.
- **No modals** (except the search overlay, the lightbox, and the bottom sheet). All other UI is inline.
- **No pop-ups, no banners** beyond the language banner on the homepage.
- **No newsletter signup.** Out of scope for the prototype.

---

## 11. Feature prioritization

### 11.1 In-scope for the prototype (must ship)

- All routes in the sitemap.
- Hero carousel on the homepage (5–6 slides, no autoplay).
- Trip ideas, state strip, popular searches, deity tiles, methodology teaser.
- Explore list mode with 4 filters, search, active filters, pagination, empty state.
- Explore map mode with India map SVG, region pills, right column, your-state pill, mobile bottom sheet.
- Temple detail page with 18 sections, including the 4 new "related" sections.
- Header search overlay, alias-aware search, smart-match banner.
- Media gallery with image and video support.
- `/suggest` form (UI-only).
- Lightbox for the gallery.
- View transition morph (card → hero).
- All a11y and perf floors.

### 11.2 In-scope but lower priority (ship if time allows)

- Trip ideas carousel (4 cards is the current spec; can expand to 6).
- More deity icons (beyond the 6 in the spec).
- More state silhouettes (beyond 8–10).
- A "Methodology" page at `/methodology` (currently a link in the footer, no destination).
- A "Recently viewed" pill on the homepage (localStorage, no server).

### 11.3 Out of scope (deferred)

- Multi-language content (UI chrome only; English + 7 placeholders).
- User accounts, saved temples, trip planning.
- Real CMS / authoring tools.
- Real video content (schema is ready).
- State landing pages (`/states/[slug]`) — folded into `/explore?state=…`.
- Deity landing pages (`/deities/[slug]`) — folded into `/explore?deity=…`.
- A blog / editorial content.
- Server-side search index (Fuse.js, Meilisearch, etc.).
- Booking / "Plan visit" with third parties.
- Mobile app.
- Dark mode.
- Real-time data (festivals, timings).

---

## 12. Architectural constraints

### 12.1 The content contract

- `data/temples.ts` is a single typed array of `Temple` records.
- `lib/types.ts` is the schema.
- `lib/validate.ts` is a dev-time shape validator (the `placeholder dataset` vitest suite).
- To go live, replace the array with the full generated set (15 → 2,000+). Nothing else needs to change.
- **Nothing in the app hardcodes the current count.** No "showing 1 of 15" copy, no "we have 15 temples" stats — every count is derived.

### 12.2 The lib layer

```
data/temples.ts  →  lib/temples.ts  (data-bound public API)
                  ↘  lib/temple-queries.ts  (pure helpers, unit-tested)
                  ↘  lib/filter.ts  (Explore search/filter/sort, pure)
                  ↘  lib/format.ts  (cost/number/distance formatters)
                  ↘  lib/regions.ts  (REGION_ORDER, region → pigment mapping)
                  ↘  lib/search.ts  (alias-aware ranked search)
                  ↘  lib/search-aliases.ts  (the alias map)
                  ↘  lib/india-geo.ts  (parsed India state polygons)
                  ↘  lib/media.ts  (MediaItem helpers)
                  ↘  lib/distance.ts  (Haversine)
                  ↘  lib/validate.ts  (shape validator)
                  ↘  lib/utils.ts  (cn, shimmer)
```

- `lib/temples.ts` is the only file pages import for data.
- Everything else in `lib/` is **pure** (no data import) and unit-tested with `lib/__fixtures__/`.
- Path alias `@/*` → repo root.
- Vitest only picks up `lib/**/*.test.ts`. `app/` and `components/` have no test files by design.

### 12.3 Static generation

- `next.config.mjs` has `output: "standalone"` (for the Dockerfile).
- `reactStrictMode: true`.
- `experimental.viewTransition: true`.
- At 20,000+ temples, `generateStaticParams` for `/temples/[id]` is a known scale step (deferred; documented in `CLAUDE.md`).
- The Explore page is server-rendered (the page component reads URL params and hands data to the client).

### 12.4 Stack

- Next.js 15 (App Router).
- React 19.
- TypeScript (strict).
- Tailwind v3 (custom tokens).
- Framer Motion (reveals, bottom sheet drag).
- React View Transitions API (native, via `experimental.viewTransition`).
- `next/font` (Fraunces, Hanken Grotesk, Space Mono).
- `lucide-react` (icons).
- **Removed:** `react-three-fiber`, `three` (the 3D embers are gone).

### 12.5 Tooling

- ESLint (`next/core-web-vitals`) ignores `.agents/`, `.claude/`, `skill-observations/`, `skill-updates/`.
- `tsconfig.json` excludes the same directories and uses path alias `@/*` → repo root.
- No Cursor rules, no Copilot rules. Project conventions live in `CLAUDE.md`, `UX_SPEC.md`, `DESIGN_SYSTEM_V2.md`, `REDESIGN_PLAN.md`, `IMPLEMENTATION_PHASES.md`, and this file.
- `npm audit` reports dev-only advisories (esbuild/vite/postcss). **Do not run `npm audit fix --force`** — it downgrades Next.js and breaks the app.

### 12.6 Images

- Real URLs flow through `next/image` with blur-up.
- Wikimedia Commons URLs are served `unoptimized` (browser → Wikimedia's CDN) to avoid rate-limiting the Next optimizer's proxy.
- Self-hosted photos add their host to `images.remotePatterns` in `next.config.mjs`.
- Failed images fall back to the procedural `TempleScene` (extended in Phase 7 to cover failed videos).
- Empty `""` also renders the procedural scene.
- Fixed aspect-ratio boxes ensure zero CLS.

### 12.7 Forms and APIs

- All forms are **UI-only**. No backend, no API routes, no fetch calls.
- The forms explicitly say so on submit ("this is a prototype, nothing was sent").
- No optimistic updates. No fake success. No fake loading.

---

## 13. Implementation roadmap

The full 11-phase build order is in `IMPLEMENTATION_PHASES.md`. The phases are independently reviewable, independently testable, and have stop-and-review gates between them.

> **Build progress:** Phase 0 is *partially* done (token layer only) and Phase 1 is *complete* as of 2026-07-07. See the **Build status** section at the top of this document for the authoritative status, the exact files changed, the decisions/deviations, and the recommended next step (Phase 2).

| # | Phase | Effort | What ships |
|---|---|---|---|
| 0 | Foundation | 4 d | Tokens, globals, DESIGN.md, schema, lib helpers, data migration |
| 1 | Chrome | 3 d | Header, footer, language banner, about/contact/404 recolor |
| 2 | Homepage | 6 d | Hero carousel, editorial, trip ideas, state strip, deity tiles, popular searches, methodology |
| 3 | Explore list mode | 4 d | Filter row, popovers, active filters, search, smart-match, pagination, empty state |
| 4 | Explore map mode | 8 d | India map SVG, region pills, right column, your-state pill, mobile bottom sheet |
| 5 | Temple detail | 4 d | Section reorder, 4 new sections, hero actions, quick-facts bar, gallery refactor, map recolor |
| 6 | Search system | 3 d | Header overlay, alias-aware search, smart-match banner integration |
| 7 | Media gallery | 2 d | `media: MediaItem[]` refactor, video-ready lightbox |
| 8 | `/suggest` page | 1 d | New UI-only form |
| 9 | Perf + a11y pass | 2 d | Lighthouse, axe, keyboard, reduced motion, zoom, contrast |
| 10 | Deploy readiness | 1 d | README, Docker, smoke test |
| | **Total** | **~36 d** | |

A 2–3-engineer team + 1 designer can compress to **3–4 calendar weeks**. A solo engineer should plan for **8–10 weeks**.

### 13.1 Phase 0 is special

- It is the only phase with no visible UI change.
- It locks the design system, the schema, and the pure helpers.
- It is the foundation for every subsequent phase.
- A 1-day review of the design tokens, the schema, and the data migration is mandatory.

### 13.2 Phase 4 is the largest

- 8 days. The India map SVG, the bottom sheet, and the right column are the bulk.
- Plan a 2-day spike to validate the bottom sheet (Framer Motion drag + focus trap + snap points) before integration.
- If the bottom sheet spike fails, the fallback is a simpler full-screen sheet (no snap points).

### 13.3 Phase 9 is non-negotiable

- The perf + a11y pass is not a "polish" step. It is a gate.
- If Lighthouse Performance is < 90 or axe-core reports critical issues, the prototype is not shippable.
- The `prefers-reduced-motion` audit is reviewed by an a11y expert.

### 13.4 Documentation set

The full documentation set, in the order a new Claude Code session should read it:

1. **`PROJECT_CONTEXT.md`** (this file) — the index.
2. **`CLAUDE.md`** — the project rulebook.
3. **`UX_SPEC.md`** — section-by-section UX spec for every page.
4. **`DESIGN_SYSTEM_V2.md`** — 14-section design system.
5. **`REDESIGN_PLAN.md`** — file-by-file audit, keep/modify/replace/delete.
6. **`IMPLEMENTATION_PHASES.md`** — 11-phase build order.

---

## 14. Open questions

These are the questions that are still undecided or could use input. None block the prototype, but each is worth a deliberate answer before production.

### 14.1 Content

- **"Why visit" copy** — each of the 15 temples needs a hand-written 3–4-sentence "Why visit" paragraph. Who writes this, and when?
- **Trip ideas** — the 4 trip ideas are pre-canned (e.g. "The Chola Trail," "Buddhist Circuit," "Living Temples of Tamil Nadu," "Himalayan Pilgrimage"). Who curates these, and is the 4-card grid the right count?
- **"How we choose" methodology** — the methodology teaser links to `/methodology` (a page that doesn't exist yet). What's the methodology? Is this an early-phase content task or a Phase 10 task?
- **Festival dates** — the current data has festival names + 1-line descriptions, but no machine-readable date ranges. Do we need them? (UX spec says yes for the "Best time" callout.)

### 14.2 Design

- **State silhouettes** — 8–10 hand-drawn or GeoJSON-derived. Is the GeoJSON-derived path the right one, or are hand-drawn silhouettes more on-brand? (The data set drives both the state strip and the India map; the silhouettes can be a simplified view of the same polygons.)
- **Deity icons** — 6 hand-built SVGs. Who designs them? Is the trishul/sudarshana-chakra/lotus/ankusha/vel/gadaa set the right one?
- **Hero photos** — 5–6 photos for the hero carousel. The current data has 15 temples; the hero carousel needs only 5–6. Which 5–6? Is this a content-strategy decision or a designer decision?
- **The mandala SVG** — the old region-explorer mandala is reused as a decorative element in the methodology teaser. Is this the right reuse, or should it appear elsewhere (footer, about page)?

### 14.3 Technical

- **Static generation at 20,000+** — `generateStaticParams` for `/temples/[id]` will be slow at 20,000 records. Deferred to a future scale step. When? Is it a CI/infra decision or a code decision?
- **Server-side search at 20,000+** — a naive substring search on 20,000 records is O(n) but 1,300× slower than on 15. Is Fuse.js / Meilisearch in the prototype's future? Deferred; documented.
- **The `media: MediaItem[]` refactor** — the data migration in Phase 0 adds `media[]` to all 15 records. The `heroImage` and `gallery` fields are removed. Is the migration strategy (single coordinated change) safe for the 20,000-record future?
- **The `lib/india-geo.ts` source** — the India map needs state polygons. Where does the GeoJSON come from? A public-domain source (e.g. Survey of India, Natural Earth)? Is the license compatible with the prototype's distribution?
- **The bottom sheet's drag interaction** — Framer Motion's `drag` prop on iOS Safari conflicts with the native rubber-band scroll. What is the fallback if the conflict is unresolvable? (Simpler full-screen sheet is the documented fallback.)
- **The alias map's coverage** — the initial seed has 8–20 entries. Is 20 enough? Should the map be expanded to 50+ before launch? Who curates it?

### 14.4 Product

- **The language banner's "Notify me →" CTA** — currently a dead link. Should it open an email composer, a `/contact` form, or a Tally / Formspree widget?
- **The footer social links** — currently placeholders (UI-only). What services? Twitter? Instagram? YouTube?
- **The "v0.1 prototype" tag** — the footer is honest about its prototype status. Should this tag persist in production, or only in the prototype?
- **The "How we choose" page** — the methodology teaser links to a page that doesn't exist. Should `/methodology` be a Phase 0 deliverable (a 1-page static doc) or a Phase 10 deliverable?

### 14.5 A11y

- **The "tap to unmute" button** — visible on the lightbox. Is the language clear? Should it be "Tap to unmute" or "🔊 Unmute" (icon + label)?
- **The smart-match banner's "matched as 'X'" chip** — does this need a screen-reader-friendly alternative? The current text is "Showing 47 temples for 'mahadev' (matched as 'Shiva temples')." which is screen-reader-readable, but the dismiss button is on the right.
- **The bottom sheet's "peek" state** — the peek state is a handle + state name. On mobile, the state name is the only visible text. Is this enough context for a screen reader user to know what's open?

---

## 15. Document maintenance

This document is **permanent**. It is the first thing a new Claude Code session should read.

When any of the following change, update this document first, then the source documents:

- A build phase is started, completed, or partially completed (update the **Build status** section at the top).
- A new route is added or removed.
- A new homepage section is added or removed.
- A new filter is added or removed.
- A new deity, region, or state is added.
- A new design system primitive is added.
- A new architectural constraint is added.
- An open question is answered.

The source documents (`CLAUDE.md`, `UX_SPEC.md`, `DESIGN_SYSTEM_V2.md`, `REDESIGN_PLAN.md`, `IMPLEMENTATION_PHASES.md`) are the canonical sources. This document is the index.

---

End of Project Context.
