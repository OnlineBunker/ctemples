# 13 — Implementation Master Plan

> **CTemples Master Specification, file 13 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: `IMPLEMENTATION_PHASES.md` and `REDESIGN_PLAN.md` sequencing/effort (their 45- vs 36-day discrepancy is resolved by this re-baseline). Live completion status lives in `PROJECT_CONTEXT.md` §Build status — update it at every phase boundary (file 14 protocol).

---

## 1. Completed (actuals, for calibration)
- **P0 Foundation** ✅ tokens/fonts/globals, `DESIGN.md`, deity/state helpers, then completed 2026-07-08 with schema fields (`whyVisit`, `media[]`, `architecturalStyleSlug`, `tripDuration`), `haversineKm`, `pickBy*`, `pickWithinRadius`, `searchTemples` + aliases, `lib/media.ts`, full 15-record data migration, 102 tests. *India geometry deliberately excluded → moved to P4.*
- **P1 Chrome** ✅ header/footer/banner/about/contact/404.
- **P2 Homepage** ✅ (2026-07-08) split hero + 6 sections; 3D deps removed; adversarial review, 6 fixes. *Actual: ~1 session vs 5-day estimate — estimates below stay conservative anyway.*
- **P3 Explore list mode** ✅ (2026-07-10) Async-ified seam (`queryTemples`/`TempleSummary`/`getFacetCounts`, `React.cache()`-wrapped); list mode per file 05 §1–5 + file 02 §3 (`lib/explore-url.ts` param coercion/URL builders, round-trip tests); Radix Popover adopted (D19); golden-query suite (10 §8, 15 tests); file 04 **[DELTA]** URL migrations across the homepage; `magenta-deep` small-text correction. Replaced `explore-client.tsx`/`filter-chip.tsx` with 15 new `components/explore/*` files. Two-reviewer adversarial pass (a11y/spec-adherence + correctness/React) found 14 confirmed issues — most significant: facet counts previously ignored the active search query `q`; all fixed, with a regression test guarding the facets-vs-`q` fix. *Actual: ~1 session vs 6-day estimate.*

## 2. Remaining phases (single estimates; total ≈ 31 person-days)

| # | Phase | Scope (normative source) | Est |
|---|---|---|---|
| **P3.5** | **Content foundations** | Tag registry + validator wiring; slug registry + `lib/slug.ts`; `compute-popularity.ts` + `data/popularity.json` + `filter.ts` switch; anti-slop lint over the 15 records; interim image-attribution credit (09 §§4–8; 11 §8.3–7). | 2d |
| **P4** | **Explore map mode** | Geometry pipeline + `lib/india-geo.ts` (07 §2); `IndiaMap` + region pills + clusters + callout markers + a11y contract (07 §3–6); boundary-trace micro-interaction; mobile bottom sheet (05 §6, 03 §6.8); `checkCoordinateInState`; state-silhouette tiles (07 §8); attribution caption + /about credit. | 8d |
| **P5** | **Temple page rebuild** | File 06 in full: 18 sections + `visibleSections`, quick-facts bar, hero/action row/back link, section index + back-to-top, computed sections 15–17, state-scale map (or caption-only interim if P4 hasn't landed), lucide transport icons, print stylesheet, metadata templates (12 §2). Begins `media[]` consumption. | 6d |
| **P6** | **Search system** | Header overlay + Cmd-K (10 §6); **alias upgrade to D10** (typed targets, per-token, CI target-resolution); typeahead path; `SearchDoc` projection if perf warrants. | 4d |
| **P7** | **Media migration completion** | All consumers on `lib/media.ts`; lightbox rebuild w/ attribution line + video handling (06 §6, 03 §6.7); delete `heroImage`/`gallery`/`videoUrl` from type + data; update validators/fixtures. | 3d |
| **P8** | **/suggest + /methodology** | Both UI-only pages (02 §1.1, 12 §6); footer/teaser links flip to `/methodology` (D7). | 2d |
| **P9** | **Consistency cleanup** | Migrate hand-rolled popovers (header dropdowns, state tiles) to Radix (D19's named phase); **delete legacy token aliases** + add CI grep (D1); deity-icon stroke-draw (08 §5#1); sweep for stale classes/emoji/z-values outside the scale. | 2d |
| **P10** | **Perf & a11y hardening** | Lighthouse ≥90/85 + axe-clean gates on all three page types; reduced-motion full audit (08 §7 matrix); 200% zoom + SR walkthroughs; image/JS budget verification (04 §9, 05 §9). | 3d |
| **P11** | **Deploy readiness** | README rewrite, Docker verify, smoke script, `PROJECT_CONTEXT` final status. | 1d |

**Production track (post-prototype, trigger-driven — not scheduled):** Stage B/C/D per file 11 §2; **Production-SEO flip** as one dedicated phase (12 §12) blocked on: attribution UI ✚ methodology ✚ JSON-LD ✚ sitemaps.

## 3. Dependency graph
```
P3 ─→ P3.5 ─→ (P4, P5, P6 in any order; P4 before P5 only for the map plot)
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
**Start P3.5.** Read file 09 (tag registry, popularity model, anti-slop rules) + 11 §8.3–7 (image attribution), then follow the file-14 session protocol. Do not begin P4 work inside the P3.5 branch.
