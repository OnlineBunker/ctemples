# 04 — Homepage Blueprint

> **CTemples Master Specification, file 4 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: UX_SPEC §1, CLAUDE.md routes note (B1). Rulings carried: D2, D27, B5, B7, B16. The homepage shipped in Phase 2 and this file canonizes it; deltas from shipped code are flagged **[DELTA]** and scheduled in file 13.

---

## 1. Page contract

Section order (fixed): **Language banner → Header → Hero → Editorial paragraph → Trip ideas → State strip → Popular searches → Deity tiles → Methodology teaser → Footer.** Single scroll, no tabs, no infinite anything, no back-to-top (B7). One H1 (hero thesis); H2 per section; H3 on card titles (B16 resolved: permitted). Everything derives from data — the page renders correctly with 15 records or 20,000.

## 2. Hero (D2, D27)

**Layout:** two-column grid ≥lg (`45% editorial | 55% photo stage`), stacked (photo first) below lg. Not full-bleed; lives in the shell. Kolam motif at ≤10% magenta opacity, top-right, decorative.

**Editorial column (persistent — never changes with slides):**
- Eyebrow (mono label): `{slide.state} · {slide.region} India` — the only slide-reactive text in the column, `aria-live="off"`.
- H1, display-lg, plum: **"Discover the sacred"**.
- Telugu flourish: `<p lang="te" class="telugu">పవిత్ర దేవాలయాలు</p>`, magenta, 24–30px.
- Lede (18px ink-muted, max 36ch): "From the Jyotirlingas of the Himalayas to the shore temples of the south, explore India's living heritage — its legends, festivals, architecture, and darshan."
- CTAs: primary lg "Plan your darshan →" → `/explore`; secondary lg "Explore by region" → `/explore?view=map` (one of the homepage's **two** sanctioned map deep-links — this CTA and §5's "See all states" tile; both are explicitly geographic intents per D4, and §10 audits exactly these two).
- Controls row: prev/next round buttons (disabled at ends — no wrap), dots (active = 24px magenta bar; `aria-hidden`, arrows are the accessible control), mono counter `{i} / {n}`, and the mono micro caption "Browse at your pace — no autoplay" (ink-muted).

**Photo stage:** aspect 4/3 (16/12 at lg), `rounded-card`; each slide = HeroSlide card (file 03 §6.2): photo (or TempleScene fallback), plum scrim, region badge chip, turmeric-star rating, **H2** temple name (white, Bricolage 24–30px), "{city}, {state}", white pill CTA "Tour this temple →" → `/temples/{id}`. Crossfade 300ms; keyboard ←/→/Home/End when the stage (a `role="group" aria-roledescription="slide"` region with `tabindex="0"`) has focus; swipe on touch. First slide's image is the page's single `priority` image. SR: polite live region announces "Slide {i} of {n}: {name}, {state}" **only after** first interaction.

**Slide selection (D27):** slides = `heroPinned` editorial list first (ordered), then fill to 5–6 from the `heroPool` (photo-quality-gated eligibility flags, file 09 §2), rotated deterministically by ISO week with max one slide per region. Prototype approximation until those fields exist: top featured by rating (shipped behavior) — flagged as the standing approximation, not a decision to revisit.

**Video-ready:** `HeroSlideData.kind = "image" | "video"` exists; video slides render poster + muted rules (file 08 §6) when production video arrives. Audio controls are planned, not built.

## 3. Editorial paragraph

Single centered column (max 640px), Bricolage 24–28px plum, `text-balance`: "India holds more than 20,000 temples — from living pilgrimage sites to millennia-old stone. CTemples is a curated encyclopedia: start with a trip idea, a state, or a deity." ("20,000+" is the product claim from the vision, not a dataset count — the one permitted forward-looking number.) Reveal-on-scroll.

## 4. Trip ideas (primary CTA surface)

- SectionHeading: eyebrow "Trip ideas", H2 "Where will you go?", description "Curated routes to start planning — pick a thread and follow it into the map."
- Grid 1/2/4; four curated cards (TripIdeaCard, file 03 §6.2). Curation is editorial data (`PRESETS` in `trip-ideas.tsx` for now; a `data/trip-ideas.ts` file when >4 exist): title, description, mono meta ("6 temples · 7 days · ~800 km" — editorial), representative temple id (photo source, TempleScene fallback), href.
- Current four (canonical until edited as content): South India Temple Trail → `/explore?tag=dravidian` (region intent is inexpressible in the URL contract — file 02 §4 — so the card's own subject, Dravidian temple tradition, is the filter); Shiva Temples of the Himalayas → `/explore?deity=shiva`; UNESCO World Heritage Temples → `/explore?tag=unesco-world-heritage`; Living Temples of Tamil Nadu → `/explore?state=tamil-nadu`. **[DELTA]** hrefs still using retired `?preset=`/`?view=map` forms migrate to these list-mode URLs (D4, file 02 §3.6) in Phase 3.
- Section hides entirely if the curated set is empty.

## 5. State strip

- SectionHeading: eyebrow "Browse by state", H2 **"Every state, its temples"** (derived-safe copy; B5 resolved — no counts in the H2).
- Wrapping grid 2/3/4/6 (never a horizontal scroller — popovers must not clip; zoom-safe). Top **6** states by temple count (derived via `getStateCounts()`), then the dashed "See all states →" tile → `/explore?view=map` **[DELTA: per D4 this becomes `/explore` list unless the tile is explicitly geographic — ruling: the tile reads "See all states", geography is the intent, map link stays.]** Ruling recorded: **map link stays** for this tile.
- StateTile (file 03 §6.2): silhouette upgrade per file 07 §8 when available; derived count line ("3 temples" / "1 temple").
- Popover (one open at a time, alignment measured at open, focus-trapped, Esc-restores): "{STATE} · {n} TEMPLES" mono header; top ≤4 temples by rating (name + city, magenta-soft hover); "See all in {State} →" → `/explore?state={slug}` **[DELTA]** (currently `?view=map&state=` — migrates per D4).

## 6. Popular searches

Eyebrow "Popular searches", no H2 (thin chip row). Six chips (turmeric-soft, file 03 §6.3), each a pre-canned Explore URL: Shiva temples `/explore?deity=shiva` · Tamil Nadu `/explore?state=tamil-nadu` · UNESCO sites `/explore?tag=unesco-world-heritage` · Pilgrimage `/explore?tag=pilgrimage` **[DELTA** from `?preset=pilgrimage`**]** · Himalayan temples `/explore?q=himalayan` · Living temples `/explore?q=living`. Chip set is editorial data; keep 5–7.

## 7. Deity tiles

Eyebrow "By deity", H2 "Find your god". Grid 2/2/3 of six DeityTiles (locked set, D11) → `/explore?deity={key}`. Count line derives from `getDeityCounts()`; zero-count tiles show "Explore →" (never "0 temples"). Deity-icon stroke-draw micro-interaction (file 08 §5#1) attaches here when implemented.

## 8. Methodology teaser

Full-width plum panel (`rounded-card`, white text, kolam motif at white/10): eyebrow (turmeric) "How we choose", H2 white "A reference you can trust", paragraph (white/80) "Every entry is written to the same template — history, legend, architecture, festivals, timings, and what a visit actually costs — and sourced from freely-licensed material. No sponsored rankings, no pay-to-feature.", link "How we choose →" (turmeric, hover white) → **`/methodology`** **[DELTA** from `/about`, per D7**]**.

## 9. Responsive & performance matrix

| Breakpoint | Hero | Trip ideas | States | Deities |
|---|---|---|---|---|
| <640 | stacked, photo first, 4/3 | 1-col | 2-col grid | 2-col |
| 640–1023 | stacked | 2-col | 3-col | 2-col |
| ≥1024 | 45/55 split | 4-col | 4-col (6 at xl) | 3-col |

Single `priority` image (hero slide 1); every below-fold image lazy; hero is the LCP element; JS budget <150KB route-level (framework excluded); no reveal above the fold.

## 10. Acceptance criteria
- H-tree: exactly one H1; H2s = section titles; H3s only on cards. axe clean.
- Zero hardcoded counts (grep for regex `\b(15|29|36|37)\b` near "temple/state" copy returns nothing outside this spec).
- Carousel: no timer of any kind in the component; arrows disabled at ends; full keyboard + SR contract per §2.
- Every card/tile/chip href resolves per file 02 §3 (post-DELTA migration: no `?preset=`, no `?region=`, map links only on the two sanctioned geographic entries).
- With an empty dataset the page still renders: hero falls back to any temples then hides if none; sections hide when their data is empty; no crashes, no "0" copy.

## 11. Anti-patterns
- Adding sections (stats strips, testimonials, newsletter blocks, app badges). The section list in §1 is closed — amendments only.
- Reactive layout thrash: the editorial column must not resize as slides change (fixed min-height for the eyebrow line).
- Turning the state strip into a scroller or the trip row into a carousel.

## 12. What Sonnet does next
The homepage is live. Remaining work is the **[DELTA] list**, executed inside Phase 3 (URL migrations: trip-idea hrefs, popular-search pilgrimage chip, state-popover "See all", methodology link) plus later phase hooks (silhouettes P4, deity stroke-draw when touching tiles, D27 fields at content-scale time). No other homepage changes are authorized.
