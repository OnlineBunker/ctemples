# 01 — Product North Star

> **CTemples Master Specification, file 1 of 14.** Status: **normative**. Adopted 2026-07-10.
> Precedence: `docs/01–14` > `CLAUDE.md` (operating doc) > all legacy docs (`UX_SPEC.md`, `DESIGN_SYSTEM_V2.md`, `REDESIGN_PLAN.md`, `IMPLEMENTATION_PHASES.md`, `DESIGN.md`, `PROJECT_CONTEXT.md` §1–15). When any document disagrees with this set, this set wins. When two files in this set disagree, the lower-numbered file wins, and the disagreement must be reported and fixed — see `14_CLAUDE_CODE_OPERATING_SYSTEM.md` §Amendments.
> Live build status is tracked in `PROJECT_CONTEXT.md` §Build status — that section is *status*, not *spec*, and remains authoritative for "what is actually implemented."

---

## 1. What CTemples is

**One sentence:** CTemples is a tourism-first encyclopedia of India's temples — the depth of a reference work delivered with the warmth and craft of a premium travel magazine, built to scale from 15 hand-written entries to 20,000+.

**The three-part identity, in priority order:**

1. **Tourism-first.** Every page answers "should I go, and how?" before it answers "what is this?" The primary CTA on any surface moves the visitor toward planning a visit (explore, directions, best time, cost). Encyclopedic depth is the *means*; a planned trip is the *end*.
2. **Premium travel editorial.** The site reads and looks like it was made by people who have stood in these places: hand-written `whyVisit` paragraphs, festival-bright color used with restraint on a porcelain canvas, photography-led layouts, one signature motion moment. Think the confidence of Incredible India campaigns crossed with the typography discipline of a serious travel journal.
3. **Encyclopedia depth.** Long-form history, legend, architecture, and significance sections reward the reader who stays. Facts are sourced; nothing is fabricated; missing data is omitted, never guessed.

**Explicitly not:** a booking platform, a blog, a listicle farm, a photo-dump gallery, or a generic "top 10 temples" SEO site.

## 2. Audiences and canonical journeys

Four audiences, in order of product priority:

| # | Audience | Defining need | Primary surface |
|---|---|---|---|
| A1 | **The planner** — knows the temple ("Tirupati next month") | facts, timings, directions, cost | Temple page via search |
| A2 | **The browser** — has a region/state/deity, not a temple | curated discovery | Explore (list + map), homepage tiles |
| A3 | **The in-India tourist** — "what's near me / near here?" | proximity | "Your state" pill, Within-100-km sections |
| A4 | **The reader** — cultural interest, may never travel | depth, trustworthy prose | Temple page long-form sections |

**The 3-click rule (locked):** every temple is reachable in ≤3 clicks from the homepage; ≤2 preferred. Canonical journeys and their click counts:

| Journey | Path | Clicks |
|---|---|---|
| "Tirupati next month" | header search → result → Get directions | 3 |
| "Shiva temple in the South" | deity tile → filtered list → temple | 3 |
| "Planning Rajasthan" | state tile → popover "See all" → temple | 3 |
| "What's Mahadev?" | search "mahadev" (alias fires) → top result | 2 |
| "I'm in Tamil Nadu" | Your-state pill → temple | 2 |
| "No idea what I want" | trip-idea card → temple | 2 |

Any IA change that pushes a journey past 3 clicks is rejected by default.

## 3. The anti-slop charter

CTemples must never read, look, or behave like generated filler. These are product rules, not aspirations — most are CI-enforceable (see `09_CONTENT_MODEL_20000_TEMPLES.md` §7 for the enforcement mechanics).

**Prose rules**
1. `whyVisit` is hand-written or human-verified, second person, 40–90 words, and names at least one concrete thing (a hall, a ritual, a view) that isn't in the temple's name.
2. Banned-phrase lexicon (versioned, extendable): "nestled", "rich tapestry", "hidden gem", "must-visit", "breathtaking" (as an opener), "steeped in history", "delve", "vibrant culture", "spiritual journey" (as a noun phrase), "stands as a testament".
3. No two records may share a 10-gram of prose (cross-record dedupe, ≤3 tolerated corpus-wide for unavoidable formula like address phrasing).
4. Opener diversity: no sentence-opener pattern may begin more than 2% of records' `overview` fields.
5. Numeric claims (dates, fees, heights, distances, visitor counts) require a source reference; unsourced precise claims are validation errors, and the honest alternative is omission.

**Design rules** *(6–8 amended 2026-07-11 — **Amendment A**, user-directed: lean into the approved Utsavam mockup's festival energy — its gradients, autoplay hero, and showcase carousels — instead of the flattened first reading. The §5 accessibility/performance floors are deliberately untouched.)*
6. No stock-template layouts: no full-width centered-hero-with-search clichés, no three-icon "features" rows, no testimonial carousels, no app-store badge tiles. Off-palette "mesh/aurora" gradient washes stay banned — but the **Utsavam gradient** (magenta→coral→saffron, the mockup's own signature) is a first-class brand element: sanctioned for primary CTAs (AA-safe span, file 03 §2.4), decorative/kolam panels, and image scrims.
7. Color discipline: one primary CTA per section (an H2-rooted block); saffron/turmeric never sit behind body text (decorative fills and plum-on-turmeric badges are fine); plum carries display type and depth.
8. Motion discipline: one signature *transition* (the card→hero morph) plus the sanctioned motion set of file 08 — **hero autoplay with a visible pause control (file 08 §6 autoplay law)**, Ken Burns slide drift, showcase carousels for curated rows, and the three micro-interactions. Flames, glow pulses, spins, marquee, particles, and parallax stay banned; `prefers-reduced-motion` always yields the calm, static site.
9. Every image degrades to the procedural `TempleScene` SVG — the site never shows a broken frame or a gray box.
10. Counts and copy derive from data; no hardcoded "15 temples", "29 states", or fabricated "12,431 visitors" anywhere, ever.

## 4. Brand voice

**Register:** knowledgeable friend who has been there — warm, specific, unhurried. Never salesy, never academic-dry, never mystical-vague.

| Don't write | Write instead |
|---|---|
| "This breathtaking temple is a hidden gem nestled in the hills." | "The temple sits at 3,500 metres; the last 16 km are on foot or by pony." |
| "Immerse yourself in the vibrant culture and rich tapestry of history." | "Arrive before the 5 a.m. abhishekam and you'll share the corridor with pilgrims, not tour groups." |
| "A must-visit destination for every spiritual seeker." | "Worth a full morning; pair it with Dhanushkodi, forty minutes down the road." |

**Bilingual accent:** the Telugu flourish (పవిత్ర దేవాలయాలు, `lang="te"`) is a brand signature in the hero only. Content remains English in the prototype; the schema is translation-ready (see file 09 §9). The 8-language chrome affordance stays "coming soon."

## 5. North-star quality bars (locked, from the original brief — unchanged)

- Lighthouse: Performance ≥ 90 on `/`, `/explore`, `/temples/<id>` (map mode ≥ 85); Accessibility ≥ 95; Best Practices ≥ 95.
- LCP < 2.5 s on simulated 4G Moto G4; zero CLS; single `priority` image per page.
- WCAG 2.1 AA everywhere; keyboard-operable everything; visible 2px magenta focus ring (2px offset); `prefers-reduced-motion` fully honored; touch targets ≥ 44×44 px; 200% zoom without horizontal scroll; screen-reader walkthrough passes per page.
- Every layout, query, and count works identically at 15 records and 20,000+.

## 6. The Decision Register (D1–D27) — canonical

These rulings resolve every known conflict in the legacy docs. Implementation must not re-litigate them; a change requires the amendment process in file 14. Each ruling's full detail lives in the file cited.

**Identity & direction**
- **D1. Palette & type = Modern Utsavam.** Porcelain `#FBF6F0` canvas; magenta `#E5006D` / coral `#FF3D6E` / saffron `#FF7A00` / turmeric `#FFC300` / plum `#3D0A40`; Bricolage Grotesque (display) / Inter (body) / Space Mono (data) / Noto Sans Telugu (accent). Supersedes every temple-red/sand-yellow/warm-gold hex and the Fraunces/Hanken pairing in legacy docs. Legacy token names live on only as Tailwind aliases until the last legacy-styled page migrates, then are deleted (CI grep enforces). → file 03.
- **D2. Homepage hero = split editorial layout** (persistent editorial column: H1 thesis "Discover the sacred" + Telugu accent + two CTAs; photo stage: per-slide H2 temple card, crossfade, prev/next/dots/counter). **Amended 2026-07-11 (Amendment A):** the hero **autoplays** under file 08 §6's autoplay law — 7s dwell, visible pause/play control, pauses on hover/focus, stops permanently on manual navigation, fully disabled under `prefers-reduced-motion`/Save-Data (originally "no autoplay"). Supersedes UX_SPEC §1.3's full-bleed hero. Slide eyebrow = "State · Region India"; dynasty/era dropped (unreliable at 20k). → file 04.
- **D3. 3D policy: real-time WebGL is banned in all core UI** — hero, map, cards, backgrounds, cursors, dividers. The one memorable moment is the 2D card→hero shared-element morph. Sanctioned future 3D (production only, never prototype): (a) 360° "virtual darshan" panoramas inside the gallery lightbox, (b) photogrammetry viewers for monuments with real scans (e.g. ASI partnerships). Both require: real captured assets (no fabricated models), explicit user gesture to load, `next/dynamic` import, and gyro/drag treated as motion under `prefers-reduced-motion`. Decorative 3D (globes, particles, shaders, card flips, parallax depth) is permanently banned. → file 08 §8.

**IA & URL contracts**
- **D4. Explore defaults to list**; map is `?view=map`, lazily loaded. State/preset/deity/tag links land on **list** with filters applied; map deep links are reserved for explicitly geographic intents ("Explore by region"). Map URLs canonicalize to their list equivalents. Supersedes UX_SPEC §2's map-default. → file 02 §3, file 05.
- **D5. Multi-tag = repeated params** `?tag=a&tag=b`, max 3, alphabetized when the site builds the link; multi-tag result pages are noindex, single-tag pages index (production). Supersedes UX_SPEC's comma form. → file 02 §3.
- **D6. Sort = `?sort=rating|popularity|name`, default `rating`.** Legacy values `featured`, `cost`, `alpha` are coerced (→ rating, rating, name) and canonicalized. → file 02 §3, file 05 §4.
- **D7. `/methodology` ships as a thin route in the prototype** (same content the About page embeds) — a permanent, citable URL. Resolves the open question; no more link churn. → file 02 §2, file 12 §6.
- **D8. Temple-page back link** = "← Back to [state] temples" → `/explore?state=<slug>` (list, per D4). → file 06 §3.
- **D9. Geography = 28 states + 8 UTs (36 entries).** All lists and counts are data-derived; the map's **geometry** always renders all 36 (a zero-temple state renders empty-but-present — cartographic and legal requirement for the India market). Supersedes every "29 states"/"37" reference. → file 07.

**Search & data**
- **D10. Alias model = composable typed targets.** `SearchAlias { alias, targets: AliasTarget[], note }`; `AliasTarget` = deity | temple(slug) | place(city/state) | tag. Aliases are data-not-code; CI resolves every target against the dataset; matching is per-token, not whole-query. Ayyappa-class cases are aliases to places/temples — never a seventh deity tile. → file 10 §4.
- **D11. Deity set locked at six** (Shiva, Vishnu, Devi, Ganesha, Murugan, Hanuman); all legacy Buddha references are void. `religion` becomes a closed union (`hindu | jain | buddhist | sikh`) — a reserved v2 Explore facet (`?religion=`), not a prototype filter. Production adds curated `deities: DeityKey[]` (machine-seeded, human-confirmed). → file 09 §2.
- **D12. Popularity is an internal 0–100 ordinal, never rendered as a number.** Prototype: deterministic script over a committed Wikipedia-pageviews snapshot + prominence multipliers + rating, output committed to `data/popularity.json`. Production: blended percentile over a rolling window. The only visitor figure that may ever render is `visitorStat` with a mandatory citation. UX_SPEC's "★ 4.8 · 12,431 visitors" is void. → file 09 §4.
- **D13. Content tiers:** T1 Dossier (~500) / T2 Standard (~3,500) / T3 Stub (~16,000) with exact per-field requirements. **Pages never branch on tier** — the 18 sections render in fixed order on data presence. T3 pages below the prose floor are noindex. → file 09 §3, file 06 §5.
- **D14. Production schema evolution:** immutable `uid` (ULID) beside the slug; slugs minted once via progressive disambiguation (name → +city → +state → +geohash5), frozen forever, renames tracked in `slugHistory` with 301s; `Verification`, `Editorial`, `Popularity`, `VisitorStat` types; **`MediaAttribution` required on every media item** (fixes the live CC-BY-SA attribution violation); dossier prose becomes optional (tier-validated); `TempleTranslation` sibling type reserved for i18n. → file 09 §2.
- **D15. Anti-slop enforcement is CI, not vibes:** the charter in §3 above compiles to lint rules — banned-phrase lexicon, opener-frequency cap, 10-gram dedupe, per-field voice contracts, length-variance checks, unsourced-claim rejection, 2% sampled human gate per ingestion batch. → file 09 §7.

**Map & components**
- **D16. India GeoJSON source = datameet/maps** (CC BY 4.0 per the repo's own README — corrected from this file's original "CC-BY 2.5 IN" assumption at Phase 4 build time; Survey-of-India-aligned boundaries — the legally required depiction for an India-market product; Natural Earth rejected for its de-facto boundary lines). Build pipeline: mapshaper simplify (visvalingam, keep-shapes, 0.2% retention — 4-5% proved too large for the 80KB budget) → project once → quantize to a 1000×1100 viewBox → generated `lib/india-geo.ts` (65KB). Visible attribution required. → file 07 §2.
- **D17. Map-state interaction & elevation doctrine.** SVG polygons: rest = porcelain-deep fill + 1px white stroke; hover/focus = magenta-soft fill + 1.5px magenta stroke (150 ms); focus adds the global 2px magenta outline; selected = magenta fill + magenta-deep stroke with the label placed outside the fill or on magenta-deep; dimmed = 40% opacity. **No shadows or transforms on SVG polygons.** Shadow-based elevation belongs to HTML cards only: rest = `line` border + `shadow-sm`; hover = `shadow-md` + upward lift (exact magnitudes per surface in file 03 §5). Touch: small UTs/islands get fixed-radius callout markers + enlarged invisible hit paths; the map is always paired with an equivalent list. → file 07 §4–5, file 03 §5.
- **D18. Temple-page map = state-scale SVG plot** (reuses D16 geometry): the temple's dot, nearby-attraction dots, "Get directions" external link (`google.com/maps/dir/?api=1`, `geo:` URI on mobile), JSON-LD geo. Supersedes both the OSM-iframe idea and an India-wide dot. → file 06 §8.
- **D19. Radix Popover + Dialog is the single sanctioned new dependency** (Explore filter popovers, Phase 3). Existing hand-rolled popovers (header, state tiles) migrate in a named cleanup phase, not "opportunistically." The mobile bottom sheet stays on Framer Motion. → file 03 §6.4, file 13.
- **D20. Temple-page navigation:** desktop (lg+) sticky "On this page" section index with scroll-spy; mobile gets a collapsed in-flow "On this page" disclosure at top + a back-to-top button after two viewport-heights of scroll. Homepage gets neither. → file 06 §4.
- **D21. Cmd/Ctrl-K opens the search overlay** (no-op when focus is in an editable element; the shortcut is hinted on the trigger). → file 10 §6.
- **D22. Three signature micro-interactions** (≤400 ms, gesture-triggered, instant under reduced motion): deity-icon stroke-draw on hover/focus (280 ms), selected-state boundary trace on the map (350 ms), section-index caret slide (200 ms). → file 08 §5.
- **D23. Bricolage is permitted in card titles** (no H1 in cards). **Amended 2026-07-11 (Amendment A):** the hero is the only *autoplaying* carousel; **curated editorial rows** (trip ideas and future hand-curated sets) **may** use user-driven showcase carousels (center-emphasis, peeking neighbors, drag/arrows/snap — file 08 §6); **computed/data-driven lists stay grids or scroll rows** — Explore results and the temple page's computed "Plan around this temple" sections are not curated, so file 06 §12's related-section-carousel ban stands (originally "hero = the only carousel"). → file 03 §6.2, file 06 §5, file 08 §6.

**Backend & scale**
- **D24. Staged backend evolution** A→B→C→D with explicit triggers: A = static TS array (now, ≤200 records); B = JSON-per-temple + Zod + image ingestion to R2/CDN (≤2k); C = Payload CMS on Postgres + ISR (prerender ~2–3k pages, `dynamicParams`, tag-based revalidation) + Meilisearch (≤10k); D = 20k tuning (sharded sitemaps, facet snapshots, popularity cron). → file 11.
- **D25. The data seam:** all `lib/temples.ts` functions become async now; `queryTemples(TempleQuery): Promise<PagedTemples>` becomes the single Explore data call at every stage (with `TempleSummary` card projection, `FacetCounts`, `matchedAliases`); `getAllTemples` is banned from page code at scale. Engine swap is gated by a golden-query test suite (~15 canonical searches asserting top-3 results). → file 11 §3, file 10 §8.
- **D26. SEO:** prototype stays `noindex`; production flips with JSON-LD (`PlaceOfWorship`/`HinduTemple` + geo + `BreadcrumbList`), sharded per-state sitemaps, the canonical/noindex matrix from D4–D6, metadata templates, an internal-linking floor (every temple page ≥10 internal links via its computed sections), and `/states/[slug]` + `/deities/[slug]` landing pages as production surfaces (still deferred in prototype). → file 12.
- **D27. Hero slide selection at scale:** `heroPinned` (editorial order) → `heroPool` (photo-checklist-gated) → deterministic ISO-week rotation with max one slide per region. Per-visit randomization rejected (SSG/cache/QA determinism). → file 04 §2.

## 7. Contradiction-resolution log

Every known conflict in the legacy docs, with its ruling. Verified against exact quotes on 2026-07-10; quote citations live in the audit that produced this spec.

| # | Conflict | Ruling |
|---|---|---|
| A1 | Explore default: list (CLAUDE.md) vs map (UX_SPEC §2) | List — D4 |
| A2 | Tags: repeated params vs comma-separated | Repeated — D5 |
| A3 | Detail map: coordinate plot vs OSM iframe (UX_SPEC self-contradicts §3.15 vs §7.10) | State-scale SVG plot — D18 |
| A4 | Hero: full-bleed 16:9 (UX_SPEC §1.3) vs implemented split layout | Split layout — D2 |
| A5 | Palette/type: temple-red/Fraunces vs Modern Utsavam/Bricolage | Utsavam — D1 |
| A6 | Aliases: place/temple targets (UX_SPEC) vs deity-only (code) | Composable typed targets — D10 |
| A7 | "Most visited" sort with no data model | Popularity ordinal — D12 |
| A8 | "Plan around": carousel (§3.5) vs not-a-carousel (locked) | Scroll row — D23 |
| A9 | /methodology: linked vs omitted vs open question | Thin route ships — D7 |
| A10 | Hero H1/eyebrow structure (UX_SPEC self-contradicts) | Thesis H1 + H2 slides, State·Region eyebrow — D2 |
| B1 | CLAUDE.md routes section describes the removed old homepage | Void; file 04 is canonical |
| B2 | Detail sections: old 11 vs locked 18 | 18, fixed order, conditional presence — D13; file 06 |
| B3 | Sort contract: rating/popularity/name vs implemented featured/cost | D6; legacy values coerced |
| B4 | Deity set: Hanuman vs Buddha (UX_SPEC self-contradicts) | Six deities incl. Hanuman; Buddha void — D11 |
| B5 | State strip: horizontal scroll + "29 states" H2 vs implemented grid + derived copy | Grid + derived copy; file 04 §5 |
| B6 | UX_SPEC copy hardcodes dataset sizes (12/29/47) | All copy templated on derived counts — charter §3.10 |
| B7 | Back-to-top specced but unimplemented | Homepage: none. Temple page: mobile only — D20 |
| B8 | CLAUDE.md stack line still lists r3f accent | Void; 3D banned — D3 |
| B9 | Scale target: 20,000+ vs 2,000+ | 20,000+ is the product target; 2k is a stage milestone — D24 |
| B10 | 29 vs 28 states | 28 + 8 UTs = 36 — D9 |
| B11 | Fabricated "12,431 visitors" in hero spec | Void; only cited `visitorStat` may render — D12 |
| B12 | `media[0].src` vs schema's `url` | Field is `url`; `getHero()` is the accessor |
| B13 | Language banner above vs below header | Above header (implemented) |
| B14 | Alias count "12" vs 13 in code | Counts are never hardcoded in docs; registry is source of truth |
| B15 | Map fills cited in superseded hexes | Full Utsavam interaction matrix — D17 |
| B16 | "No H3s on homepage" vs specced/implemented H3 card titles | H3 card titles permitted; H2 per section; one H1 — file 04 §1/§10 |
| C1–C10 | Undefined: popularity model, map interaction, hover/elevation, /methodology, 3D detail, GeoJSON source, state count, scale number, Cmd-K, back link | All now defined: D12, D17, D17, D7, D3, D16, D9, B9, D21, D8 |

## 8. Acceptance criteria for this file

- Every D-ruling is referenced by at least one downstream file (02–14) that carries its full specification.
- No legacy hex, font name, or hardcoded count appears in files 01–14 except as quoted superseded history.
- A reader who has seen only this file can state the product's identity, priority order, quality bars, and where any decision lives.

## 9. Anti-patterns

- Re-opening a D-ruling inside an implementation PR ("wouldn't map-default be nicer?") — amendments go through file 14's process.
- Citing UX_SPEC/DESIGN_SYSTEM_V2 as authority for anything this set covers.
- Adding motion, carousels, gradients, fabricated stats, or hardcoded counts *beyond the sanctioned sets in files 03/08* because a single surface seems to want them — extensions go through the amendment process, not improvisation.

## 10. What Sonnet does next

1. Read files 01 → 02 → 03 → 08 before any implementation session; read the page blueprint (04/05/06/07) for the surface being built; read 13 for the current phase's scope and gates; follow 14's session protocol.
2. Never make a product decision. If a needed decision is missing from this set, stop and escalate per file 14 §Escalation — do not improvise.
3. Treat `PROJECT_CONTEXT.md` §Build status as the only source for "what exists today."
