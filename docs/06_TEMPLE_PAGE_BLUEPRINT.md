# 06 — Temple Page Blueprint

> **CTemples Master Specification, file 6 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: UX_SPEC §3, CLAUDE.md "Detail page" + routes note (B2). Rulings carried: D8, D12 (no fabricated visitor counts), D13, D18, D20, D22#3, D23. Tier requirements live in file 09 §3; this file owns rendering.

---

## 1. Page contract

`/temples/[id]`, no query params. A long-form dossier: **18 sections in fixed order, each rendering only when its data exists** (D13 — the page never branches on tier; `lib/detail-sections.ts::visibleSections(temple)` computes the visible set and their display indices). One H1 (temple name, hero). Statically generated (`generateStaticParams`; subsetting strategy at scale per file 11 §4).

**Canonical order:** 1 Hero → 2 Quick-facts bar → 3 Why visit → 4 Plan around → 5 Best time → 6 Overview → 7 How to reach → 8 History → 9 Legends & mythology → 10 Architecture → 11 Spiritual significance → 12 Cost to visit → 13 Gallery → 14 Map → 15 Within 100 km → 16 By the same deity → 17 Same architectural style → 18 Nearby attractions. (Footer follows; not a section.)

**Always-present floor** (any tier): 1, 2 (Location + Region cells render from required fields, so the bar always has ≥2 — see §5), 6, 14, plus whichever of 15/16 have matches — even a Tier-3 stub is a real page.

## 2. Section 1 — Hero
Full-width within shell, 16:9 (4:3 mobile, max 60vh), `rounded-card`. Image = `getHero(media)` (morph target: `view-transition-name: temple-{id}`); TempleScene fallback; the page's single `priority` image. Plum scrim bottom. Overlay (bottom-left): mono eyebrow "{State} · {Region} India"; **H1** name (display-lg, white); tagline (white/80, 18px); rating (turmeric star + value — **omitted entirely when `rating` absent**; never a visitor count, D12). Action row (bottom-right): Save (heart, UI-only, pressed state local), Share (clipboard + "Link copied" toast `role="status"`), primary "Get directions →" (external, file 07 §7 URL).

## 3. Above the hero
"← Back to {State} temples" → `/explore?state={slug}` (D8) — a normal link in the content flow (not over the photo).

## 4. Section index (D20)
- **Desktop lg+:** right-rail sticky (top: header+16px, z-20) `<nav aria-label="On this page">` listing visible sections; scroll-spy (IntersectionObserver) sets `aria-current="location"`; magenta caret slides 200ms (D22#3); items mono 12px ink-muted, active magenta-deep.
- **Mobile:** collapsed `<details>` "On this page" disclosure between quick-facts and section 3; plus a back-to-top button (round, canvas, shadow-lg, z-30, 44px) appearing after 2 viewport-heights, smooth-scroll (instant under reduced motion).

## 5. Sections 2–12 (owned content)

| # | Section | Renders when | Spec |
|---|---|---|---|
| 2 | Quick-facts bar | always (≥2 cells guaranteed) | `<dl>` grid (2/4 cols), canvas cells on line-gap background. Cell order: **Location ("{City}, {State}") · Region ("{Region} India") — both always available from required fields —** then, when present: Built · Dynasty · Style · Presiding deity · Open today ("{opening}–{closing}") · Entry ("{indian}"). Timings/fees live HERE — never a separate section (B2). Sticky within page until section 5 scrolls past (z-20). Mobile: horizontal scroll + right-fade. |
| 3 | Why visit | `whyVisit` | H2 "Why visit". The hand-written paragraph, 18–20px, lh-1.7, max prose width. |
| 4 | Plan around | `tripDuration` | H2 "Plan around this temple". Summary line "{temples} temples · {days} days · ~{km} km" (mono) + up to 3 nearest temples (from §15's computation) as a **scroll row/grid — not a carousel** (D23). |
| 5 | Best time | `bestTimeToVisit` | H2 "Best time to visit". Months + time-of-day info card; festivals as 2-col cards (name, mono timing in magenta-deep, description). |
| 6 | Overview | always | H2 "Overview". `prose-temple`. |
| 7 | How to reach | ≥1 mode | H2 "How to reach". Up to 3 cards (Plane/TrainFront/Car lucide icons — replaces emoji), H3 mode, text. Cards render individually. |
| 8–11 | History / Legends & mythology / Architecture / Spiritual significance | each own field | H2 each; `prose-temple`, paragraphs split on `\n\n`; reveal-on-scroll per file 08 §4. Architecture may embed a 3-image strip when `media.length > 3` (lazy). |
| 12 | Cost to visit | `costEstimates` | H2 "Cost to visit". Table: From city · Distance · Travel time · Budget · Mid-range · Luxury; mobile: stacked cards (shipped pattern) or h-scroll table with fade. Caption: "Indicative ranges per person; verify locally." |

## 6. Section 13 — Gallery
Renders when ≥2 images beyond availability of a hero. Grid 1/2/3, `getGallery(media)`, lazy, fixed 4:3 boxes. Lightbox (file 03 §6.7): arrows/Esc/Tab-cycle, focus-trapped, backdrop-click closes, counter, **attribution line** (author · license, linked — required once attribution fields exist, D14; until then the section carries a single "Images: Wikimedia Commons" credit). Video items: poster + tap-to-play, muted default (file 08 §6). Future `panorama` kind slots here (file 08 §8).

## 7. Sections 15–18 (computed discovery — the internal-linking engine, D26)

| # | Section | Source | Renders when |
|---|---|---|---|
| 15 | Within 100 km | `pickWithinRadius(…, 100, 4)`, nearest-first, distance via `formatRelativeDistance` ("38 km away") | ≥1 match; if 0: fall back to same-region top-rated with copy "This temple is fairly remote — the nearest are further afield."; hide only if that's also empty |
| 16 | By the same deity | `pickByDeity(…, 3)` rating-desc | ≥1 match |
| 17 | Same architectural style | `pickByArchitecturalStyle(…, 3)` | `architecturalStyleSlug` present and ≥1 match |
| 18 | Nearby attractions | `nearbyAttractions[]` | non-empty; list rows: mono "{n} km" + name + one-liner |

15–17 use TempleCard (grid 1/2/3, ≤4/3/3 items). Dedupe across 4/15/16/17: a temple appears once, first section wins.

## 8. Section 14 — Map
File 07 §7 verbatim (state-scale plot + attraction dots + directions). H2 "Find on the map".

## 9. Print stylesheet
`@media print`: hide chrome, hero photo, gallery, action row, section index; sections flow as text; cost table prints fully; URL printed after external links. One page-break rule: avoid breaking inside cards/tables.

## 10. Metadata (prototype)
Title `"{Name}, {City} — CTemples"`; description = tagline (or first 155ch of overview); OG image = hero URL. JSON-LD and index flips are production (file 12) — prototype stays noindex.

## 11. Acceptance criteria
- Renders correctly for: a full Tier-1 record; a record with only the §1 floor fields; a record with zero media (TempleScene everywhere). No empty H2s, no "undefined", no zero-item sections.
- Section indices display as the *visible* sequence (01, 02, …) — removing a section renumbers the rest.
- H-tree: one H1; H2 per visible section; H3 only within (modes, sub-heads, card titles). axe clean; lightbox and index fully keyboard-operable.
- No visitor counts, no fabricated stats; rating hidden when absent.
- The morph works into this hero from any card surface; LCP = hero image; single priority.

## 12. Anti-patterns
- Branching layout on `editorial.tier` (render on data, D13); separate "Timings & entry" section (B2); breadcrumbs; related-section carousels; iframe maps; "N visitors" anywhere (D12); guessing timings/fees for stubs (omission is the design).

## 13. What Sonnet does next
**Phase 5** (file 13): rebuild `app/temples/[id]/page.tsx` + `components/temple/detail/*` to this file — the 18-section order with `visibleSections`, quick-facts bar (absorbing timings/fees), hero + action row + back link, section index + back-to-top, computed sections 15–17 (helpers already exist in `lib/temple-queries.ts`), state-scale map (needs file 07 geometry — if Phase 5 runs before Phase 4, ship section 14 with the coordinates caption + directions link only and add the plot when geometry lands), lucide transport icons, print stylesheet. Consume `media[]` via `lib/media.ts` (this begins the Phase-7 migration; `heroImage`/`gallery` reads are removed page-by-page).
