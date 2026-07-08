# CTemples — UX Specification

> A detailed UX specification for CTemples, derived from the approved architecture in `CLAUDE.md`. This document is the source of truth for layout, behavior, and edge-case handling across the prototype. No code is included; it is a written spec for designers, engineers, and reviewers.

---

## Table of contents

1. [Homepage](#1-homepage)
2. [Explore Page](#2-explore-page)
3. [Temple Detail Page](#3-temple-detail-page)
4. [Search System](#4-search-system)
5. [Navigation System](#5-navigation-system)
6. [Mobile UX](#6-mobile-ux)
7. [User Journeys](#7-user-journeys)
8. [Empty States](#8-empty-states)
9. [Loading States](#9-loading-states)
10. [Error States](#10-error-states)

---

## 1. Homepage

The homepage is the front door of CTemples. It must orient a first-time visitor, communicate the editorial thesis, and offer four clear paths deeper into the site: a trip idea, a state, a popular search, or a deity.

### 1.1 Global page rhythm

- **Vertical scroll:** the page is a single long scroll. No infinite scroll. No tabbed content on the homepage.
- **Section dividers:** thin 1-px warm-gold hairlines separate major sections. They are decorative, not interactive.
- **Max content width:** `1280px` for grid content, `1440px` for the hero, full-bleed for the hero image.
- **Type hierarchy:** exactly one H1 (in the hero overlay), one editorial H2 ("Where will you go?"), and section H2s after that. No H3s on the homepage.

### 1.2 Section A — Header

See [§5 Navigation System](#5-navigation-system) for full behavior. On the homepage, the header is sticky and reappears when the user scrolls up after scrolling down.

### 1.3 Section B — Hero carousel

- **Layout:** full-bleed, 16:9 on desktop, 4:3 on mobile, capped at 60 vh on mobile.
- **No autoplay.** The carousel is static until the user interacts.
- **Controls visible:** 5 dots, prev/next arrows, keyboard (left/right arrows), swipe on touch.
- **Each slide contains:**
  - Eyebrow: state name + dynasty or era (e.g. "Tamil Nadu · 11th century"). Space Mono, small caps.
  - H1: temple name. Fraunces, large.
  - One-line editorial thesis: "India's temples, mapped." (This is the page's H1 sentence; the per-slide H1 is the temple name only if you treat it as a featured-card, but spec is: **H1 is the page thesis**, not a temple name. Temple names appear in slide overlay as Fraunces H2.)
  - Primary button: "Explore this region →" → `/explore?region=South&state=tamil-nadu`.
  - Secondary text link: "Tour this temple" → `/temples/[id]`.
- **Slide transitions:** cross-fade, 300 ms. No Ken Burns. No parallax. Reduced motion: instant cross-fade.
- **Image source:** Wikimedia hero photos via `next/image`. If a photo fails, the procedural `TempleScene` SVG renders.

### 1.4 Section C — Editorial paragraph

- **Position:** directly below the hero, before the first gold divider.
- **Layout:** single column, max 640 px wide, centered.
- **Content:** two sentences framing the site. Example: "India has 20,000+ temples, from living pilgrimage sites to ancient stone architecture. CTemples is a curated encyclopedia — start with a trip idea, a state, or a deity."
- **Type:** Hanken Grotesk, 18–20 px, ink color.
- **No H2 above it.** It sits visually under the hero without competing for hierarchy.

### 1.5 Section D — Trip ideas (primary CTA surface)

- **Eyebrow:** "Trip ideas."
- **H2:** "Where will you go?"
- **Layout:** 4 cards in a horizontal row on desktop (≥1024 px), 2×2 grid on tablet, 1 column on mobile.
- **Card anatomy:**
  - Photo (16:9, fixed aspect ratio).
  - Title (Fraunces H3, 1 line, ellipsis on overflow).
  - One-line description (Hanken Grotesk, ink-muted).
  - Inline meta: "5 temples · 4 days · ~600 km" (Space Mono, small).
  - Whole card is a link.
- **Hover (desktop only):** photo zooms 1.03, card lifts 2 px with sand-yellow ring.
- **Click:** routes to `/explore?view=map&preset=…` with a curated filter (e.g. `&region=South&deity=shiva`).
- **Curated set (prototype):** "South India temple trail" · "Shiva temples of the Himalayas" · "UNESCO World Heritage temples" · "Living temples of Tamil Nadu."

### 1.6 Section E — State strip

- **Eyebrow:** "Browse by state."
- **H2:** "29 states · thousands of temples."
- **Layout:** horizontal scroll on mobile (with right-edge fade hint), 6-up grid on desktop, 4-up on tablet.
- **Tile anatomy:**
  - State silhouette SVG (1 color: temple-red at 60% opacity in resting state, 100% on hover).
  - State name (Hanken Grotesk, 16 px).
  - Temple count (Space Mono, 12 px, ink-muted).
  - Whole tile is a `<button>` that opens a popover.
- **Popover content:** top 4 temples of that state as a mini-list with photos, names, and a "See all →" link to `/explore?view=map&state=<slug>`.
- **Trailing affordance:** after the visible tiles, a small "See all states →" link opens a full state picker popover (search input + all 37 states/UTs).
- **Sort order:** descending by temple count.
- **No autoplay, no carousel arrows, no dots.** The horizontal scroll is a native mobile scroll, not a JS carousel.

### 1.7 Section F — Popular searches

- **Eyebrow:** "Popular searches."
- **No H2** — this is a thin row of chips, not a heading-bearing section.
- **Layout:** 6 chips in a horizontal row, wrapping to a second line on smaller screens.
- **Chips:** "Shiva temples" · "Tamil Nadu" · "UNESCO sites" · "Pilgrimage" · "Himalayan temples" · "Living temples."
- **Chip style:** pill, sand-yellow-soft background, ink text, temple-red border on hover/focus.
- **Click:** routes to a pre-canned Explore URL. Examples:
  - "Shiva temples" → `/explore?view=list&deity=shiva`
  - "Tamil Nadu" → `/explore?view=map&state=tamil-nadu`
  - "Pilgrimage" → `/explore?view=map&preset=pilgrimage`
  - "UNESCO sites" → `/explore?view=list&tag=unesco`

### 1.8 Section G — By deity

- **Eyebrow:** "By deity."
- **H2:** "Find your god."
- **Layout:** 6 tiles in a 3×2 grid on desktop, 2×3 on tablet, 2×3 on mobile (with a "See all deities →" trailing tile).
- **Tile anatomy:**
  - Deity icon (hand-built SVG: trishul for Shiva, sudarshana chakra for Vishnu, etc. — distinct from region color, conveys identity beyond color).
  - Deity name (Fraunces H3).
  - Temple count (Space Mono, small).
- **Click:** `/explore?view=list&deity=<slug>`.
- **Set (prototype):** Shiva · Vishnu · Devi · Ganesha · Murugan · Hanuman. (Curated to the deities present in the placeholder data.)

### 1.9 Section H — Footer

- **Layout:** 3 columns on desktop, single column on mobile.
- **Columns:**
  - About: logo, one-line description, "About" link, "Methodology" link.
  - Contribute: "Suggest a temple →" (`/suggest`), "Partner with us →" (`/contact`).
  - Connect: social placeholders (UI only, no real links in prototype), copyright, "Made in India" line.
- **Bottom bar:** copyright, "v0.1 prototype" tag.

### 1.10 Homepage behaviors

- **Scroll-reveal:** each section's content fades in 16 px from below, 350 ms, on entering the viewport. Children stagger by 60 ms. Disabled under `prefers-reduced-motion`.
- **First paint:** the hero is the largest contentful paint. Its image is `priority`. State strip and deity tiles are below the fold and lazy-load.
- **Back-to-top:** a circular button appears after the user scrolls past 1.5× the viewport height. Pressing returns to the top of the hero.

---

## 2. Explore Page

The Explore page is the only browsing surface. It has two modes — **Map** (default for first-time visitors) and **List**. The view is a server component reading URL params; the mode toggle is a pill switch that updates the URL.

### 2.1 URL contract

```
/explore                                  default → map mode, no state selected
/explore?view=map                         map mode
/explore?view=list                        list mode
/explore?view=map&state=tamil-nadu        map mode, Tamil Nadu selected
/explore?view=list&q=mahadev              list mode, search query
/explore?view=list&deity=shiva            list mode, deity filter
/explore?view=list&tag=pilgrimage,unesco  list mode, multi-tag filter
/explore?view=list&sort=alpha             list mode, sorted A–Z
/explore?view=map&preset=pilgrimage       map mode, preset applied
/explore?view=map&region=South            map mode, region filter
```

### 2.2 Common chrome (both modes)

- **Header:** standard sticky header (see [§5](#5-navigation-system)).
- **Page title:** "Explore" (H1) when no filters are active; "Explore · [filter summary]" (H1) when filters are active (e.g. "Explore · Tamil Nadu").
- **Mode toggle:** pill switch with two segments: "Map" / "List." Active segment has sand-yellow-soft background and temple-red text. Toggle updates the URL with shallow routing — the scroll position resets to the top of the results.
- **"Your state" pill** (sticky on mobile, fixed at top of right column on desktop):
  - If `localStorage` has a state: shows "Showing results in [State]. Change →"
  - If not: shows "Pick your state for local results →" with an inline dropdown.
  - This pill is the mobile entry point for the "I'm a tourist in India" use case.

### 2.3 Map mode

#### 2.3.1 Layout

- **Desktop (≥1024 px):** two-column layout.
  - Left column: map (60% width).
  - Right column: results (40% width), sticky on scroll.
- **Mobile:** stacked.
  - Map: 40 vh, full width, sticky at top.
  - Results: bottom sheet (snap points: peek, half, full) with a drag handle.

#### 2.3.2 Map

- **Type:** inline SVG of India with state polygons. Sourced from a public-domain GeoJSON, simplified.
- **State polygons:**
  - Rendered as `<g role="button" tabindex="0" aria-label="Tamil Nadu — 12 temples">`.
  - Default fill: `line` color (`#E5E0D6`).
  - Hover/focus fill: `sand-yellow-soft` (`#FBF1D9`).
  - Selected fill: `temple-red` (`#C62828`).
  - Focus ring: 2-px temple-red outline, 2-px offset.
- **Cluster layer:** a heatmap of temple counts per region, not per-temple dots. Each region has a circle whose radius is proportional to `log(count + 1)`. Fill is temple-red at 30% opacity. At 20,000 temples, this scales; at 15, it shows distinct small clusters.
- **Region pills above the map:** All · North · South · East · West · Northeast · Central. Clicking desaturates states outside the selected region to `canvas-soft` and dims them to 40% opacity. The selected region's states remain interactive.
- **A11y parallel:** an off-screen `<ul>` of state links mirrors the map. Each link is focusable and has the same `aria-label`. A screen reader user can navigate the state list without using the map.
- **Zoom/pan:** the prototype is a single-zoom map (no zoom controls). Out of scope for prototype.

#### 2.3.3 Right column (results)

- **Header:** state name (H2) + temple count (Space Mono).
- **Search input:** scoped to the selected state, with the alias-aware search ranking (see [§4](#4-search-system)). Placeholder: "Search temples in Tamil Nadu…"
- **Sort:** "Top rated" (default) · "Most visited" · "A–Z."
- **Card list:** horizontal cards, 1 column on mobile, 1 column on desktop (the column is narrow; horizontal cards stack vertically).
  - Card anatomy: photo (4:3, 96×72 px), name (Fraunces H3, 1 line), state (Hanken, small), star rating, "Why this temple" 1-line caption.
  - Hover (desktop only): card lifts 2 px, sand-yellow ring.
  - Click: routes to `/temples/[id]`.
- **Pagination:** ‹ 1 2 3 … 12 › with truncated middle. 12 cards per page.
- **Empty state:** see [§8](#8-empty-states).

### 2.4 List mode

#### 2.4.1 Layout

- **Single column.** Search bar at top, filters below, results below.
- **On mobile:** search bar is sticky at the top of the page (always visible). Filters are collapsed behind a "Filters" button. The active filter count appears as a chip: "Filters · 2."

#### 2.4.2 Search bar

- Full-width input with a search icon left, clear (×) right when the field is non-empty.
- **Placeholder:** "Search temples, deities, places…"
- **On submit (Enter or after 300 ms debounce):** updates `?q=…` in the URL.
- **Smart-match banner:** appears above the results when an alias fires. Example: "Showing Shiva temples for 'mahadev'." A × on the right dismisses it (and clears the alias boost for the current query).

#### 2.4.3 Filters

Four filters, no more:

1. **State** (single-select, type-ahead).
   - Dropdown with a search input at the top of the popover.
   - 37 entries: 29 states + 8 UTs.
   - Selected: shown as a pill in the filter row.
2. **Deity** (single-select).
   - Dropdown with 6–10 deity options.
   - Same pill behavior.
3. **Tag** (multi-select, max 3 visible + "more").
   - Dropdown with checkboxes.
   - Selecting a 4th tag is blocked with a small inline note: "Up to 3 tags at a time."
4. **Sort** (single-select).
   - "Top rated" (default) · "Most visited" · "A–Z."

- **Reset button:** clears all filters. Visible when any filter is non-default.
- **Active filters summary:** below the filter row, a row of removable chips: "Tamil Nadu × · Shiva × · sort: A–Z × · Reset all."

#### 2.4.4 Results

- **Result count line:** "12 temples in Tamil Nadu · showing 1–12." Updates with filters.
- **Card grid:** 3 columns on desktop, 2 on tablet, 1 on mobile.
- **Card anatomy:** same as the map-mode card, with a larger photo (16:9) and a short "Why this temple" caption.
- **Lazy loading:** first 12 cards render eagerly; subsequent cards use `loading="lazy"` on images. Pagination handles navigation between pages.
- **Pagination:** ‹ 1 2 3 … 12 › with truncated middle. `aria-label="Page N"` on each link. `aria-current="page"` on the active page.

### 2.5 Explore behaviors

- **URL is the source of truth.** Every interaction updates the URL via shallow routing. Refreshing the page restores the exact view.
- **State persistence:** the selected state in `localStorage` is used as the default on a cold visit (only for map mode).
- **Reduced motion:** cross-fades between slides and section reveals are instant. No bottom-sheet drag animation; the sheet snaps.

---

## 3. Temple Detail Page

The temple detail page is a long-form dossier that reads like a travel guide. One H1, sequential H2 sections, supporting H3s. The page is a server component that reads `[id]` from the route.

### 3.1 URL and routing

- **Path:** `/temples/[id]` where `id` is the temple's slug.
- **404:** if the temple doesn't exist, render the global `not-found.tsx` (see [§10](#10-error-states)).
- **Static generation:** `generateStaticParams` returns all current temple IDs. At 20,000+ scale, switch to dynamic rendering with `revalidate = 86400` (see CLAUDE.md "scale notes").

### 3.2 Section 1 — Hero

- **Photo:** full-bleed, 16:9 on desktop, 4:3 on mobile, max 60 vh on mobile.
- **Image source:** `media[0].src` (the first item in the media list). `next/image` `priority`.
- **Overlay (bottom-left):**
  - Eyebrow: state · dynasty (Space Mono, small caps, limewash text on the photo).
  - H1: temple name (Fraunces, large, limewash).
  - Star rating + visit count (e.g. "★ 4.8 · 12,431 visitors" — Space Mono, small).
- **Action row (bottom-right of hero):**
  - "Save" (heart icon, button) — UI-only in prototype, no persistence.
  - "Share" (button) — copies a link to clipboard with a "Link copied" toast.
  - "Get directions →" (button, primary) — opens Google Maps / Apple Maps with the temple's lat/lng.
- **Back link:** "← Back to [state] temples" at the top of the hero, in the header area, not over the photo. Routes to `/explore?view=map&state=<state-slug>`.

### 3.3 Section 2 — Quick-facts bar

- **Position:** directly below the hero, sticky within the page (not viewport-sticky).
- **Layout:** horizontal row, 6 facts:
  - Built (year)
  - Dynasty
  - Architectural style
  - Presiding deity
  - Open today (timings)
  - Entry fee
- **Type:** Space Mono, small, ink-muted.
- **Mobile:** scrolls horizontally with a right-edge fade hint.

### 3.4 Section 3 — Why visit (new)

- **H2:** "Why visit."
- **Content:** one short paragraph (3–4 sentences). What makes this temple special. Who it's for. The one thing not to miss.
- **Source:** `temple.whyVisit` (new field, see [§3.15](#315-schema-additions)).
- **Type:** Hanken Grotesk, 18–20 px, ink color. Generous line-height (1.7).
- **Reveal-on-scroll:** enters 16 px from below, 350 ms.

### 3.5 Section 4 — Plan around this temple (new)

- **H2:** "Plan around this temple."
- **Content:** a horizontal card carousel of 3 nearest temples (within 100 km, by Haversine distance) + a one-line summary: "Tamil Nadu temple trail: 5 temples · 4 days · ~600 km."
- **Card anatomy:** photo, name, distance ("38 km away"), state, rating.
- **Click:** routes to that temple's detail page.
- **Fallback:** if fewer than 2 temples are within 100 km, the section says "This temple is fairly remote — the nearest others are over 100 km away. Here are the closest in the region." and falls back to the region-based set.
- **No autoplay.**

### 3.6 Section 5 — Best time (callout, lifted)

- **H2:** "Best time to visit."
- **Content:**
  - Ideal months (e.g. "November to March").
  - Ideal time of day.
  - Festivals: 2–4 cards with name, timing, 1-line description.
- **Layout:** ideal months + time of day as a small info card; festivals as cards in a 2-column grid (desktop) / 1 column (mobile).

### 3.7 Section 6 — Overview

- **H2:** "Overview."
- **Content:** `temple.overview`, 1–2 paragraphs.
- **Type:** Hanken Grotesk, 18 px, ink, generous line-height.

### 3.8 Section 7 — How to reach

- **H2:** "How to reach."
- **Layout:** 3 cards in a row (desktop), 1 column (mobile).
  - By air (✈ icon)
  - By train (🚆 icon)
  - By road (🚗 icon)
- **Card anatomy:** icon, mode name (H3), nearest hub / station / highway, distance / time.

### 3.9 Section 8 — History (long-form)

- **H2:** "History."
- **Content:** `temple.history`, multi-paragraph.
- **Reveal-on-scroll.** Stagger children by 80 ms.

### 3.10 Section 9 — Legends & mythology

- **H2:** "Legends & mythology."
- **Content:** `temple.legendsAndMythology`.
- **Reveal-on-scroll.**

### 3.11 Section 10 — Architecture

- **H2:** "Architecture."
- **Content:** `temple.architecture`. Sub-headers (H3) for major architectural elements: vimana, mandapa, gopuram, etc., if present in the data.
- **Inline photos:** a small image strip (3 photos) embedded in this section if `media.length > 2`. Otherwise, the gallery at section 13 is the visual home.

### 3.12 Section 11 — Spiritual significance

- **H2:** "Spiritual significance."
- **Content:** `temple.spiritualSignificance`.

### 3.13 Section 12 — Cost to visit

- **H2:** "Cost to visit."
- **Layout:** table.
- **Columns:** from city · distance · travel time · budget · mid-range · luxury.
- **Rows:** 3–4 entries (`temple.costEstimates[]`).
- **Mobile:** horizontal scroll on the table with a right-edge fade hint.

### 3.14 Section 13 — Gallery (lightbox)

- **H2:** "Gallery."
- **Layout:** 3-column masonry-style grid on desktop, 2-column on tablet, 1-column on mobile.
- **Click:** opens a lightbox with the image at full size. Lightbox is keyboard-operable (arrows, Esc, Tab cycles controls).
- **Video items** (if any): inline video element, **muted by default**, with a visible unmute control. No autoplay unless the user clicks the play button explicitly.
- **Image lazy loading:** below-the-fold images are `loading="lazy"`. The first image is `priority` only on the hero; gallery images are not.

### 3.15 Section 14 — Map

- **H2:** "Find on the map."
- **Content:** OpenStreetMap iframe centered on the temple's lat/lng, no API key.
- **Below the map:** a "Get directions →" link that opens an external maps app with the lat/lng filled in.
- **A11y:** the iframe has a `title` attribute (e.g. "Map centered on Brihadeeswarar Temple, Thanjavur").

### 3.16 Section 15 — Within 100 km (new)

- **H2:** "Within 100 km."
- **Content:** up to 4 temples sorted by distance (Haversine).
- **Card anatomy:** photo, name, state, distance, rating.
- **Fallback:** if fewer than 2 temples are within 100 km, this section shows the section title but the cards fall back to "Same region" (region match, any distance). If no region match either, the section is hidden.

### 3.17 Section 16 — By the same deity (new)

- **H2:** "By the same deity."
- **Content:** up to 3 temples where `temple.deity === current.deity`, sorted by rating.
- **Hidden** if no other temple shares the deity.

### 3.18 Section 17 — Same architectural style (new)

- **H2:** "Same architectural style."
- **Content:** up to 3 temples where `quickFacts.architecturalStyle === current.quickFacts.architecturalStyle`, sorted by rating.
- **Hidden** if no other temple shares the style.

### 3.19 Section 18 — Nearby attractions

- **H2:** "Nearby attractions."
- **Content:** `temple.nearbyAttractions[]` as a list of name + distance + 1-line description.

### 3.20 Section 19 — Footer

Standard footer (see [§1.9](#19-section-h--footer)).

### 3.21 Schema additions

The following fields are added to the `Temple` type to support this UX. They are documented here so future content authors know what to fill in.

- `whyVisit: string` — 3–4 sentences for the "Why visit" section. Required.
- `tripDuration: { temples: number; days: number; km: number }` — optional, for the "Plan around" summary. If absent, the summary line is hidden.
- `architecturalStyleSlug: string` — derived slug from `quickFacts.architecturalStyle` (e.g. "dravidian"). Used for the "Same style" section. Required.

### 3.22 Detail page behaviors

- **One H1.** All other headings are H2 or H3. The page validates heading order — never skip a level.
- **Reveal-on-scroll:** every major section (3, 4, 5, 6, 7, 8, 9, 10, 11) reveals on entering the viewport. The hero and quick-facts bar are above the fold and render immediately.
- **Sticky quick-facts bar:** within the page (not viewport-sticky on long scroll), the bar stays visible until the user reaches Section 5.
- **Lightbox trap:** when the lightbox is open, focus is trapped inside. Esc closes. Clicking the backdrop closes.
- **Print stylesheet:** the detail page is print-friendly — hero photo omitted, sections flow as plain text, table renders fully.

---

## 4. Search System

Search is a first-class feature. The system is server-rendered (no client-side computation over the dataset), pure, and unit-tested.

### 4.1 Architecture

- **Pure function:** `lib/search.ts` exports `searchTemples(query, options)`.
- **Server-side only:** the function is called from a server component (Explore page, search overlay). Never shipped to the client.
- **Alias map:** a static record in `lib/search-aliases.ts`. Each entry maps a colloquial term to a canonical deity / place / temple-name token.
  - `mahadev → shiva`
  - `balaji → venkateswara`
  - `kanchipipuram → kanchipuram`
  - `kanchipuram → varadaraja`
  - `jagannath → puri`
  - `meenakchi → meenakshi`
  - `aiyappa → ayyappa`
  - `hanuman → hanuman`
  - `durga → devi`
  - (extendable)
- **At 20,000+ scale,** swap the in-memory scoring for an indexed search (Fuse.js server-side or Meilisearch) without changing the URL contract or the result shape.

### 4.2 Ranking formula

```
score =
  2.0 * (alias hit)              // once per alias term
+ 1.5 * (deity exact/prefix)
+ 1.2 * (name exact/prefix)
+ 0.8 * (city or state contains)
+ 0.5 * (tag contains)
+ 0.3 * (overview or history contains)
+ rating_bonus                    // (rating - 3.5) * 0.5, clamped 0..0.5
```

The function returns a sorted array of temples with their `score` and a `matchedAliases: string[]` field.

### 4.3 Result presentation

- **Single result list, ranked.** No "Smart matches / All matches" split.
- **Banner above results** when `matchedAliases.length > 0`:
  - Text: "Showing [canonical] temples for '[original query]'."
  - Dismiss (×) on the right.
  - When dismissed, the alias boost is removed for the current query.
  - Banner is in a sand-yellow-soft background, with temple-red text.
- **Empty input:** no banner, no results-filter call (just the unfiltered default list, sorted by rating).
- **No results:** see [§8](#8-empty-states).

### 4.4 Search input UX

- **Top-of-page input** in Explore list mode.
- **Header search** opens an overlay:
  - **Desktop:** dropdown anchored to the search button, 480 px wide.
  - **Mobile:** bottom sheet at "half" snap point, full width.
- **Overlay content:**
  - Input at the top.
  - Live results below (top 6) as the user types, with a 200 ms debounce.
  - "See all results for '[query]' →" link to `/explore?view=list&q=…`.
  - Each result: photo, name, state, "Why this temple" 1-line caption.
  - If an alias fires, a small chip next to the result: "matched: mahadev → shiva."
- **Keyboard:** ↑/↓ navigates results, Enter opens the highlighted result, Esc closes the overlay.
- **Empty input:** the overlay shows "Popular searches" chips (same as homepage §1.7).

### 4.5 Search a11y

- The input has a visible label (visually hidden, "Search temples, deities, places").
- The results list has `role="listbox"`, each result `role="option"` with `aria-selected`.
- The result count is announced via `aria-live="polite"`.
- The alias banner is announced via `aria-live="polite"`.

---

## 5. Navigation System

The navigation system is the global header, the language affordance, and the breadcrumb/back-link patterns. It is consistent across all routes.

### 5.1 Header (desktop, ≥1024 px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [LOGO]   Explore ▾   About        [🔍 search]   [🌐 EN ▾]          │
└─────────────────────────────────────────────────────────────────────┘
```

- **Logo:** top-left. Links to `/`.
- **Explore:** top-level link with a hover/click dropdown showing:
  - "Pilgrimage" → `/explore?view=map&preset=pilgrimage`
  - "Architecture" → `/explore?view=map&preset=architecture`
  - "Discover" → `/explore?view=map&preset=discover`
- **About:** top-level link to `/about`.
- **Search:** button (icon only on desktop). Click opens the search overlay (§4.4).
- **Language:** pill showing "EN" (current language) with a dropdown. Lists 8 languages. All except English show "Coming soon" and are non-selectable in the prototype. Clicking English does nothing (it's already active).
- **Sticky behavior:** the header sticks to the top of the viewport with a 1-px warm-gold hairline at the bottom. On scroll down, it stays visible.

### 5.2 Header (mobile, <1024 px)

- **Visible:** logo + hamburger button.
- **Hamburger opens a full-screen sheet:**
  - Close (×) top-right.
  - "Explore" with a chevron, expands to show the 3 presets.
  - "About."
  - "Search" (taps focus the header search overlay, sheet stays open behind).
  - "Language" (same 8-language list, same "Coming soon" behavior).
  - "Suggest a temple →" (link to `/suggest`).
- **Sheet behavior:** traps focus, Esc closes, slide-in from the right.

### 5.3 Language affordance

- **Header pill:** §5.1, §5.2.
- **Homepage language banner:** a full-width, dismissible strip above the header on the homepage only.
  - Text: "Available in 8 Indian languages — coming soon. Notify me →"
  - The "Notify me" link goes to `/suggest` (or a `/notify` stub — out of scope for prototype, link to `/contact`).
  - Dismiss (×) hides the strip and persists the dismiss in `localStorage` for 30 days.

### 5.4 Back-link pattern (detail page)

- **"← Back to [state] temples"** at the top of the hero, not over the photo.
- **Routes to:** `/explore?view=map&state=<state-slug>`.
- **No three-level breadcrumb.** The back link is sufficient.

### 5.5 Footer navigation

See [§1.9](#19-section-h--footer). The footer is consistent across all routes.

### 5.6 Navigation a11y

- All links and buttons have visible focus rings (2-px temple-red outline, 2-px offset).
- The mobile sheet traps focus when open.
- The Explore dropdown is dismissible by clicking outside or pressing Esc.
- The header has a skip-to-content link as its first focusable element.

---

## 6. Mobile UX

Mobile is the primary use case for CTemples. All surfaces must be touch-friendly, readable without zoom, and performant on mid-range Android over 4G.

### 6.1 Touch targets

- **Minimum target size:** 44×44 px (Apple HIG) / 48×48 dp (Material). All buttons, chips, and links respect this.
- **Tap feedback:** active state on every interactive element (slight scale or background change). Under `prefers-reduced-motion`, the active state is a color change only.

### 6.2 Type and spacing on mobile

- **Body:** 16 px minimum. No text smaller than 14 px except in monospace data labels.
- **Hero H1:** clamp 32–48 px depending on viewport.
- **Section H2:** 24 px.
- **Line-height:** 1.5+ on body, 1.2 on display.
- **Tap spacing:** 8 px minimum between adjacent targets.

### 6.3 Mobile layouts

- **Homepage:** single column. Hero 60 vh max. Trip ideas stack. State strip is a horizontal scroll with right-edge fade. Popular searches wrap. Deity tiles in 2×3.
- **Explore list mode:** search bar sticky at top. Filters collapsed behind a "Filters" button. Result count compact. Cards stack.
- **Explore map mode:** map 40 vh sticky at top. Results in a bottom sheet (peek / half / full snap points). Drag handle visible.
- **Detail page:** single column throughout. Quick-facts bar scrolls horizontally with right-edge fade. Cost table scrolls horizontally with right-edge fade. Lightbox full-screen.

### 6.4 Mobile-specific behaviors

- **Swipe:** the hero carousel responds to horizontal swipe. The bottom sheet responds to vertical drag.
- **Bottom safe area:** the bottom sheet and sticky filter button respect iOS safe-area-inset-bottom.
- **Viewport meta:** standard, no user-zoom restriction.
- **Address bar collapse:** the layout reflows gracefully when the URL bar collapses on scroll (no fixed heights that cause gaps).

### 6.5 Mobile performance

- **Image budget per page:**
  - Home: hero (priority, 1 image) + lazy tiles (≤6 below the fold).
  - Explore list: 12 above-the-fold (priority on first 4) + lazy pagination.
  - Detail: hero (priority) + 3 architecture-strip images (lazy) + 12 gallery images (lazy).
- **JS budget:** the homepage ships <150 KB of JS (excluding framework). The Explore page <200 KB. The detail page <100 KB (the bulk of content is server-rendered).
- **No client-side search computation** — the alias map and ranking live on the server.

### 6.6 Mobile a11y

- **Touch + keyboard:** external keyboards (Bluetooth) work fully. Focus order matches visual order.
- **Screen reader:** VoiceOver / TalkBack tested. The map's parallel `<ul>` is the primary path for screen reader users.
- **Reduced motion:** no autoplay, no bottom-sheet drag animation, no view-transition flash.

---

## 7. User Journeys

Five canonical journeys, each measured in clicks. The 3-click rule must hold for every journey.

### 7.1 Journey 1 — "I want to go to Tirupati next month"

- **Start:** Home.
- **Click 1:** Header search "tirupati" → search overlay opens, Tirupati card highlighted.
- **Click 2:** Press Enter or click the result → `/temples/tirupati`.
- **Click 3:** Click "Get directions" → external maps app.
- **Total:** 3 clicks.
- **Alternative path:** Home → "Tamil Nadu" chip in Popular searches → click Tirupati in the map's right column → temple detail. 3 clicks.

### 7.2 Journey 2 — "I want to find a Shiva temple in South India"

- **Start:** Home.
- **Click 1:** Header "Explore ▾" → click "Pilgrimage" preset → `/explore?view=map&preset=pilgrimage`.
- **Click 2:** Map mode loads, "South" region pill clicked (or default-selected by the preset) → right column shows South India pilgrimage temples.
- **Click 3:** Click a temple in the right column → temple detail.
- **Total:** 3 clicks.

### 7.3 Journey 3 — "I'm planning a Rajasthan trip"

- **Start:** Home.
- **Click 1:** State strip → click "Rajasthan" → popover opens with top temples + "See all →" link.
- **Click 2:** Click "See all →" → `/explore?view=map&state=rajasthan`.
- **Click 3:** Right column shows top Rajasthan temples. Click one → temple detail.
- **Total:** 3 clicks.

### 7.4 Journey 4 — "What's Mahadev?"

- **Start:** Home.
- **Click 1:** Header search "mahadev" → search overlay opens. Alias fires; the top result is a Shiva temple.
- **Click 2:** Click the top result → temple detail.
- **Total:** 2 clicks.

### 7.5 Journey 5 — "I'm in Tamil Nadu, what's near me?"

- **Start:** Home (or direct navigation to `/explore`).
- **Click 1:** "Your state" pill at top of Explore → pick "Tamil Nadu" (or it's remembered from a previous visit).
- **Click 2:** Right column auto-populates with top temples in Tamil Nadu. Click one.
- **Total:** 2 clicks.
- **Detail-page continuation:** from the detail page, the "Within 100 km" section shows nearby temples. Click one → another detail page. The 2-click pattern continues for browsing a region.

### 7.6 Journey stress test

- **"I have no idea what I want."** Home → click "Discover" preset in the Explore dropdown → see curated set → click a temple. 2 clicks.
- **"I want UNESCO sites only."** Home → "Popular searches" → "UNESCO sites" chip → list mode with `?tag=unesco` → click a temple. 2 clicks.
- **"I want to see a Vishnu temple."** Home → "By deity" → click Vishnu → list mode with `?deity=vishnu` → click a temple. 2 clicks.

All journeys land in 2–3 clicks. The architecture respects the constraint.

---

## 8. Empty States

Empty states are designed, not blank. Each empty state has a clear message, a reason, and a next step.

### 8.1 Explore list mode — no results

- **Message:** "No temples match your filters."
- **Reason:** "Try removing a filter or broadening your search."
- **Next step:** "Reset all filters" button (clears all active filters).
- **Visual:** sand-yellow-soft background, temple-red icon (search icon, 48 px), centered.

### 8.2 Explore map mode — no state selected (first visit, no localStorage)

- **Right column message:** "Pick a state on the map to see temples."
- **No "Reset" button.** The user must select a state.

### 8.3 Explore map mode — state selected, no results (rare)

- **Message:** "No temples in [state] match your search."
- **Next step:** "Clear search" button.

### 8.4 Search overlay — no results

- **Message:** "No temples match '[query]'."
- **Suggestion:** "Try a deity name (Shiva, Vishnu, Devi) or a state."
- **Visual:** same as 8.1.

### 8.5 Detail page — section with no data

- **"Why visit" missing:** hide the section. The Overview still serves as factual context.
- **"Plan around" with no nearby temples:** show a fallback paragraph ("This temple is fairly remote…") with no cards.
- **"By the same deity" / "Same architectural style" with no matches:** hide the section entirely.
- **"Within 100 km" with no matches within range:** show the section title + fall back to "Same region" cards. If those are empty too, hide the section.
- **Gallery with 0 images:** hide the section. (In the prototype, this should never happen, but the schema allows it.)

### 8.6 Trip ideas — no curated sets (only if preset data is missing)

- **Hidden entirely** if the curated set is empty. The homepage still has the state strip and deity tiles.

### 8.7 Suggest / Contact — empty form (UI-only)

- The forms render normally with placeholder text in the inputs. No "empty" state needed.

### 8.8 Empty state a11y

- All empty-state messages are inside a `<div role="status" aria-live="polite">` so screen readers announce them on render.
- All "next step" buttons are real focusable buttons, not just text links.

---

## 9. Loading States

The prototype is mostly static, but the search overlay and pagination have meaningful loading states.

### 9.1 Page transitions

- **Default:** the destination page's hero renders before the transition completes (server-rendered, no client-side data fetch). The page transition is essentially instant.
- **View Transitions API:** the shared-element morph from card to hero is the one "wow" moment. Under `prefers-reduced-motion`, the morph is disabled; navigation is instant.

### 9.2 Search overlay — typing

- **Debounce:** 200 ms after the last keystroke.
- **Loading state:** a small spinner (temple-red, 16 px) inside the input's right edge during the debounce + request. Spinner disappears when results render.
- **Result count update:** the result count updates with the new results.
- **No "skeleton" result cards.** The result set is small (top 6), so the spinner is enough.

### 9.3 Pagination

- **Click "next page":** the new page's cards replace the old ones in place. A small spinner (temple-red, 16 px) appears at the top of the result grid for the duration of the request. No full-page loading state.

### 9.4 Image loading

- **Hero (homepage and detail page):** `priority` on `next/image`. LCP image — preloaded.
- **Above-the-fold cards:** no `priority`, but rendered eagerly. Blur-up placeholder until the image loads.
- **Below-the-fold cards:** `loading="lazy"`. Blur-up placeholder.
- **Failed image:** `TempleScene` procedural SVG renders in the same fixed aspect-ratio box. Zero layout shift.

### 9.5 Map loading

- **SVG map:** the polygons render as part of the HTML. No async load. The cluster layer renders with the polygons.
- **Right column results:** the same loading pattern as list mode.

### 9.6 Detail page sections

- The page is server-rendered. The first paint is the hero + quick-facts bar + first paragraph. Below-the-fold sections render as the user scrolls (no lazy fetch, just reveal-on-scroll).

### 9.7 Skeleton vs. spinner

- **Use skeletons** for image-heavy lists (search overlay results, card grids) only if the data is async and the user might wait. In the prototype, data is server-rendered, so skeletons are not used.
- **Use spinners** for short, in-page actions (debounced search, pagination).

### 9.8 Loading state a11y

- Spinners have `role="status"` and `aria-label="Loading"`.
- Skeletons (if any) have `aria-hidden="true"` so screen readers don't read placeholder text.
- Image lazy loading: `loading="lazy"` images still have `alt` text. A screen reader user does not need to wait for them to understand the page.

---

## 10. Error States

Errors are handled with honesty — no fake success, no silent failures, no white screens.

### 10.1 404 — page not found

- **Trigger:** unknown route, or `/temples/[id]` where the id doesn't exist.
- **Page:** `/not-found.tsx`.
- **Content:**
  - H1: "We couldn't find that page."
  - 1-line explanation: "The temple or page you're looking for might have moved or never existed."
  - Primary CTA: "Back to home" → `/`.
  - Secondary CTA: "Explore the map" → `/explore?view=map`.
- **Visual:** centered, 480 px max width, sand-yellow-soft background, temple-red icon (map-pin, 48 px).

### 10.2 500 — server error

- **Trigger:** any unhandled exception in a server component.
- **Page:** global error boundary (Next.js default).
- **Content:**
  - H1: "Something went wrong on our end."
  - 1-line explanation: "We've been notified. Please try again in a moment."
  - Primary CTA: "Try again" (reloads the page).
  - Secondary CTA: "Back to home."
- **No stack trace shown to the user.** The error is logged server-side.

### 10.3 Image load failure

- **Behavior:** `TempleImage` falls back to `TempleScene` procedural SVG. The grid never shows a broken image icon.
- **No user-facing message.** The fallback is silent and instant.

### 10.4 Search failure

- **Trigger:** server error during search.
- **Behavior:** the search overlay stays open. The result list shows: "We couldn't complete your search. Please try again."
- **Retry button** in the empty state.
- **No partial results** — all-or-nothing for clarity.

### 10.5 Geolocation / "Your state" failure

- **Trigger:** the user denies geolocation (if we ever ask) or `localStorage` is unavailable.
- **Behavior:** the "Your state" pill shows "Pick your state for local results →" with the inline dropdown. No error message. The user picks manually.

### 10.6 Form submission — Contact / Suggest (UI-only)

- **Behavior:** on submit, the form shows an inline note: "This form is a prototype — submissions aren't sent. We'll wire it up in the next release." (No fake success toast.)
- **Field-level errors:** the prototype forms are UI-only and have no validation in this iteration. The note above is the only feedback.

### 10.7 Network offline

- **Detection:** the service worker (out of scope for prototype) would detect offline state.
- **Prototype behavior:** if the page fails to load entirely, the browser's default offline page is acceptable. No custom offline UI in the prototype.

### 10.8 Error state a11y

- All error messages are inside a `<div role="alert">` (for unexpected errors) or `<div role="status">` (for expected fallbacks).
- All error pages have one H1, one explanation, and one or two buttons. No nested headings.
- Focus is moved to the H1 of the error page on render, so screen reader users hear the error immediately.

---

## Appendix — Cross-cutting behaviors

These behaviors apply across the entire spec and are referenced from individual sections.

- **Color identity:** the three primary actions (CTA, sacred markers, premium accents) use temple red. State indicators (selected, hover, focus) use sand-yellow-soft. The hairlines and dividers use warm gold at low opacity. Never use a color outside the palette for chrome.
- **Motion language:** reveals (16 px from below, 350 ms), transitions (cross-fade 300 ms), and the one shared-element morph (the card → hero). No other motion. Ambient loops are off by default.
- **`prefers-reduced-motion`:** disables all reveals, cross-fades, bottom-sheet drag, hero autoplay (already off), and view-transition animations. The page still works in full; it's just instant.
- **`prefers-color-scheme`:** the prototype is light mode only. Dark mode is intentionally out of scope (per the brief).
- **Print:** the detail page has a print stylesheet. Other pages are not print-optimized.
- **Internationalization:** the prototype is English-only. Strings are inline (no i18n library). When i18n is added, the strings move to a translation file.

---

End of UX specification.
