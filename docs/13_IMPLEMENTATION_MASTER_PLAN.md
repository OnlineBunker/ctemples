# 13 — Implementation Master Plan

> **CTemples Master Specification, file 13 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: `IMPLEMENTATION_PHASES.md` and `REDESIGN_PLAN.md` sequencing/effort (their 45- vs 36-day discrepancy is resolved by this re-baseline). Live completion status lives in `PROJECT_CONTEXT.md` §Build status — update it at every phase boundary (file 14 protocol).

---

## 1. Completed (actuals, for calibration)
- **P0 Foundation** ✅ tokens/fonts/globals, `DESIGN.md`, deity/state helpers, then completed 2026-07-08 with schema fields (`whyVisit`, `media[]`, `architecturalStyleSlug`, `tripDuration`), `haversineKm`, `pickBy*`, `pickWithinRadius`, `searchTemples` + aliases, `lib/media.ts`, full 15-record data migration, 102 tests. *India geometry deliberately excluded → moved to P4.*
- **P1 Chrome** ✅ header/footer/banner/about/contact/404.
- **P2 Homepage** ✅ (2026-07-08) split hero + 6 sections; 3D deps removed; adversarial review, 6 fixes. *Actual: ~1 session vs 5-day estimate — estimates below stay conservative anyway.*
- **P3 Explore list mode** ✅ (2026-07-10) Async-ified seam (`queryTemples`/`TempleSummary`/`getFacetCounts`, `React.cache()`-wrapped); list mode per file 05 §1–5 + file 02 §3 (`lib/explore-url.ts` param coercion/URL builders, round-trip tests); Radix Popover adopted (D19); golden-query suite (10 §8, 15 tests); file 04 **[DELTA]** URL migrations across the homepage; `magenta-deep` small-text correction. Replaced `explore-client.tsx`/`filter-chip.tsx` with 15 new `components/explore/*` files. Two-reviewer adversarial pass (a11y/spec-adherence + correctness/React) found 14 confirmed issues — most significant: facet counts previously ignored the active search query `q`; all fixed, with a regression test guarding the facets-vs-`q` fix. *Actual: ~1 session vs 6-day estimate.*
- **P3.5 Content foundations** ✅ (2026-07-10) `data/tag-registry.ts` (45 entries) + `lib/validate.ts` rejects unregistered tags; `lib/slug.ts` progressive-disambiguation minting (name→+city→+state→+geohash5) + `data/slug-registry.json` seeded from the 15 records; popularity model (`lib/popularity.ts`'s pure formula, real trailing-12-month Wikipedia pageviews in `data/wiki-pageviews.json`, `scripts/compute-popularity.ts` → `data/popularity.json`, merged onto `Temple.popularityScore` at the `lib/temples.ts` seam, `lib/filter.ts`'s "Most visited" sort switched to it); anti-slop lint (`data/anti-slop.ts` lexicon + `lib/anti-slop.ts` checks + `scripts/lint-anti-slop.ts`) found and fixed 2 real banned-phrase violations in `data/temples.ts`, left 21 WARN-level whyVisit voice-contract violations (wrong word count / no 2nd-person address) as documented, non-blocking content debt for a future editorial pass; interim "Images: Wikimedia Commons" credit added to the temple-detail gallery lightbox + `/about`. Three-dimension adversarial review (correctness, spec-adherence, data-integrity) found 9 confirmed issues, fixed: `getOrMintSlug` could silently collapse two distinct temples sharing name+city+state onto one slug (now also requires coordinate proximity); `mintSlug` now throws instead of silently returning a colliding slug if even the `+geohash5` tier collides; added a `data/popularity.json`-vs-live-inputs sync test (matching the slug/tag-registry pattern); fixed "delve" family lexicon double-counting; documented the `checkNGramDedupe` "newest" limitation (array-order proxy, no real timestamp yet) and the `computedAt` provenance tradeoff; corrected an inaccurate "build-time" self-check comment. One reviewer finding (committed Wikipedia pageview numbers "fabricated") was investigated and refuted by direct live re-verification against the exact documented fetch window — the committed numbers are exact. *Actual: ~1 session vs 2-day estimate.*

- **P4 Explore map mode** ✅ (2026-07-11) Geometry pipeline (datameet/maps `Admin2.shp` → mapshaper 0.2% → `scripts/build-india-geo.mjs` → `lib/india-geo.ts`, 65KB, **CC BY 4.0** — the repo's actual license, corrected from the CC-BY 2.5 IN the spec assumed); `IndiaMap` (D17 matrix, cluster layer, callout markers with real hit targets, 350ms boundary-trace, parallel SR list mirroring the region-dim gate); region pills; results column (compact cards, scoped search/sort/pagination, always-visible `MapStateSelect` per 07 §5#3); mobile bottom sheet (3 snaps, drag + handle + keyboard, aria-modal with `inert` background, reduced-motion → instant + fade); `checkCoordinateInState` (12-unit tolerance) in the validator suite; `STATE_REGION` table; state-silhouette home tiles (resolved server-side, no client geometry); attribution (map caption + /about + README); `?view=map` code-split behind a client `ssr:false` boundary so list mode stays lean. 4-dimension adversarial Workflow (spec/correctness/a11y/perf) + refute pass: 19 raw → 17 confirmed, all addressed (15 code fixes incl. a real `distanceToRings` closing-edge bug and the bundle-split regression that had put 65KB of geometry on the home route; 1 docs amendment — "both wired" a11y; 1 surfaced for a D17 decision — rest-map boundary contrast; 2 refuted). typecheck/201 tests/lint/build green; desktop+375px browser-verified; bundle split verified against the build manifest (/explore First Load JS 221 → 161 kB). *Actual: ~1 session vs 8-day estimate.*

## 2. Remaining phases (single estimates; total ≈ 21 person-days)

| # | Phase | Scope (normative source) | Est |
|---|---|---|---|
| **P5** | **Temple page rebuild** | File 06 in full: 18 sections + `visibleSections`, quick-facts bar, hero/action row/back link, section index + back-to-top, computed sections 15–17, state-scale map (D18 — reuses the now-shipped `lib/india-geo.ts`/`lib/geo.ts`), lucide transport icons, print stylesheet, metadata templates (12 §2). Begins `media[]` consumption. | 6d |
| **P6** | **Search system** | Header overlay + Cmd-K (10 §6); **alias upgrade to D10** (typed targets, per-token, CI target-resolution); typeahead path; `SearchDoc` projection if perf warrants. | 4d |
| **P7** | **Media migration completion** | All consumers on `lib/media.ts`; lightbox rebuild w/ attribution line + video handling (06 §6, 03 §6.7); delete `heroImage`/`gallery`/`videoUrl` from type + data; update validators/fixtures. | 3d |
| **P8** | **/suggest + /methodology** | Both UI-only pages (02 §1.1, 12 §6); footer/teaser links flip to `/methodology` (D7). | 2d |
| **P9** | **Consistency cleanup** | Migrate hand-rolled popovers (header dropdowns, state tiles) to Radix (D19's named phase); **delete legacy token aliases** + add CI grep (D1); deity-icon stroke-draw (08 §5#1); sweep for stale classes/emoji/z-values outside the scale. | 2d |
| **P10** | **Perf & a11y hardening** | Lighthouse ≥90/85 + axe-clean gates on all three page types; reduced-motion full audit (08 §7 matrix); 200% zoom + SR walkthroughs; image/JS budget verification (04 §9, 05 §9). | 3d |
| **P11** | **Deploy readiness** | README rewrite, Docker verify, smoke script, `PROJECT_CONTEXT` final status. | 1d |

**Production track (post-prototype, trigger-driven — not scheduled):** Stage B/C/D per file 11 §2; **Production-SEO flip** as one dedicated phase (12 §12) blocked on: attribution UI ✚ methodology ✚ JSON-LD ✚ sitemaps.

## 3. Dependency graph
```
P4 done ─→ (P5, P6 in any order; P4's map geometry feeds P5's detail-page plot)
P5 ─→ P7          P3..P7 ─→ P9 ─→ P10 ─→ P11
P8: independent after P3
```
Parallelization is allowed only across independent phases and only with separate worktrees.

## 4. Per-phase gates (every phase, no exceptions)
1. `npm run typecheck && npm run test && npm run lint && npm run build` — all green.
2. Browser verification of the changed surface (desktop + 375px; keyboard pass on new interactive elements).
3. Adversarial review (file 14 §5) — confirmed findings fixed before commit.
4. `PROJECT_CONTEXT.md` §Build status updated in the same commit.
5. Commit per file 14 §4 git rules; push.

## 5. Standing constraints (unchanged, restated)
No new dependencies beyond Radix (D19). Never `npm audit fix --force`. Unmigrated legacy pages are not "fixed" piecemeal — their owning phase converts them. Nothing hardcodes dataset size. Every count/copy template derives. Reduced-motion and the a11y floor apply to every new component at build time, not at P10.

## 6. Acceptance criteria (for this plan itself)
- At any moment, `PROJECT_CONTEXT` build status + this file answer "what's done / what's next / what blocks it" without reading code.
- No phase ships partial scope silently — descoping is an explicit note in the build status + an amendment if it changes a D-ruling.

## 7. Anti-patterns
Re-estimating mid-phase instead of descoping visibly; starting P4 before P3's `queryTemples` exists (the map's results column consumes it — **now satisfied**, P3 is complete); "while I'm here" fixes crossing phase boundaries; skipping the adversarial review because the change "is small".

## 8. What Sonnet does next
**Start P5 — Temple page rebuild.** Read file 06 in full (18 sections, `visibleSections`, tier degradation) + file 12 §2 (metadata templates) + file 07 §7 (the state-scale detail-page map — reuse the now-shipped `lib/india-geo.ts`/`lib/geo.ts`), then follow the file-14 session protocol. `/temples/[id]` + `components/temple/*` are still the pre-existing nightstone page; this phase converts them and begins `media[]` consumption.
