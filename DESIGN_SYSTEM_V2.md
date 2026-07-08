# CTemples — Design System V2

> A consolidated design system for CTemples, derived from `CLAUDE.md` (project vision) and `UX_SPEC.md` (UX specification). This document defines the visual language, components, and behaviors that every surface on the site must follow. No code is included; it is a written spec for designers, engineers, and reviewers.

---

## Table of contents

1. [Color palette](#1-color-palette)
2. [Typography](#2-typography)
3. [Buttons](#3-buttons)
4. [Cards](#4-cards)
5. [Carousels](#5-carousels)
6. [Search UI](#6-search-ui)
7. [Maps UI](#7-maps-ui)
8. [Filters](#8-filters)
9. [Spacing system](#9-spacing-system)
10. [Shadows](#10-shadows)
11. [Motion system](#11-motion-system)
12. [Hover effects](#12-hover-effects)
13. [Responsive design](#13-responsive-design)
14. [Accessibility requirements](#14-accessibility-requirements)

---

## 1. Color palette

> **Superseded (2026-07-08):** the exact hexes in §1.1–1.5 below are stale. The
> implemented palette is "Modern Utsavam" — porcelain canvas, `magenta #E5006D` /
> `coral #FF3D6E` / `saffron #FF7A00` / `turmeric #FFC300` / `plum #3D0A40` — per
> `DESIGN.md` and `tailwind.config.ts`. The token names below (`temple-red`,
> `sand-yellow`, `warm-gold`) survive as aliases onto the new hexes; the roles and
> component-level rules in this document (§2–§14) still apply, just with the new
> colors. See `PROJECT_CONTEXT.md`'s Build status callout for the full context.

The palette is light-mode primary. White is the canvas. Temple red, sand yellow, and warm gold are the pigment box. The system is restrained, AA-compliant on white, and inspired by Indian temple architecture (gopuram polychromy, kumkum, marigold garlands, gilt accents).

### 1.1 Core tokens

| Token | Hex | Role | Usage |
|---|---|---|---|
| `canvas` | `#FFFFFF` | Page background | Default background of every page |
| `canvas-soft` | `#FAF7F0` | Subtle warm wash | Hero overlay base, section bands, empty states |
| `canvas-elevated` | `#FFFFFF` | Card surface | Cards sit on `canvas`; their own surface is the same white, with a hairline border |
| `ink` | `#1A1A1A` | Primary text | Body text, headings |
| `ink-muted` | `#5A5A5A` | Secondary text | Captions, helper text, metadata |
| `ink-subtle` | `#8A8A8A` | Tertiary text | Placeholders, disabled labels |
| `line` | `#E5E0D6` | Borders, dividers | 1-px borders, hairlines, table rules |
| `line-strong` | `#C9C2B0` | Stronger borders | Input borders, focused borders |

### 1.2 Brand pigments

| Token | Hex | Role | Usage |
|---|---|---|---|
| `temple-red` | `#C62828` | Primary CTA, sacred markers | Primary buttons, selected state, focus rings, brand emphasis |
| `temple-red-soft` | `#FBE9E7` | Selected wash, chip background | Selected filter chips, active state backgrounds, alert backgrounds |
| `temple-red-deep` | `#8E1F1F` | Hover/active on primary | Hover state for primary buttons, pressed state |
| `sand-yellow` | `#E6C068` | Highlights, badges, "featured" | "Featured" badges, "Why this temple" captions, sand-yellow rings on hover |
| `sand-yellow-soft` | `#FBF1D9` | Card highlights, banner backgrounds | Section banners, hover rings, smart-match banner background |
| `sand-yellow-deep` | `#B68A3C` | Hover/active on sand-yellow | Hover state for sand-yellow badges, deep accent |
| `warm-gold` | `#B8860B` | Hairlines, premium accents | 1-px gold divider lines, "Premium" labels, monogram strokes |
| `warm-gold-soft` | `#F5E9C8` | Premium wash | Premium-card backgrounds, gold-tinted callouts |

### 1.3 Functional colors

| Token | Hex | Role |
|---|---|---|
| `success` | `#2E7D32` | Form success, "Saved" toasts |
| `success-soft` | `#E8F5E9` | Success banner background |
| `warning` | `#E6A23C` | Form warnings, missing optional data |
| `warning-soft` | `#FFF4E0` | Warning banner background |
| `danger` | `#C62828` | Form errors, destructive actions (uses the same hue as temple red for consistency) |
| `danger-soft` | `#FBE9E7` | Error banner background |
| `info` | `#3E6CC4` | Informational banners, "Did you know" callouts |
| `info-soft` | `#E3EAF7` | Info banner background |

### 1.4 Region coding (6 regions, 6 hues)

The region identity is conveyed by **icon + label + position**, with color as a tertiary cue. The hues are desaturated to read on white without competing with the brand pigments.

| Region | Hex | Hue name |
|---|---|---|
| North | `#3E6CC4` | desaturated lapis |
| South | `#C62828` | temple red (shared with brand — by design) |
| East | `#3E9385` | desaturated verdigris |
| West | `#E6A23C` | desaturated marigold |
| Northeast | `#4FA06B` | desaturated jade |
| Central | `#B8860B` | warm gold (shared with brand — by design) |

South and Central share hues with brand pigments intentionally. The region identity is reinforced by silhouette icons (mountain, wave, sun, leaf, star, mandala) and label, not color alone.

### 1.5 Deity coding (6 deities, 6 icons)

Deity identity is conveyed **by icon only**, not color. The icon is the primary signal.

| Deity | Icon | Color accent |
|---|---|---|
| Shiva | trishul (trident) | `temple-red` |
| Vishnu | sudarshana chakra (discus) | `warm-gold` |
| Devi | lotus | `sand-yellow` |
| Ganesha | ankusha (goad) | `success` |
| Murugan | vel (spear) | `info` |
| Hanuman | gadaa (mace) | `warm-gold-deep` |

### 1.6 State colors (interactive)

| State | Color | Notes |
|---|---|---|
| Default | `ink` on `canvas` | Body text, default surfaces |
| Hover | varies by component | See component sections |
| Focus | `temple-red` 2-px outline, 2-px offset | Required on every interactive element |
| Active/pressed | `temple-red-deep` for primary, `sand-yellow-deep` for secondary | Slight scale-down (0.98) under motion |
| Disabled | `ink-subtle` text on `canvas-soft` | No shadow, no hover, cursor not-allowed |
| Selected | `temple-red-soft` background, `temple-red` text | Filter chips, list selections, map state |

### 1.7 Contrast (WCAG 2.1 AA)

| Pair | Ratio | Status |
|---|---|---|
| `ink` on `canvas` | 16.4:1 | Pass (AAA) |
| `ink` on `canvas-soft` | 15.8:1 | Pass (AAA) |
| `ink-muted` on `canvas` | 7.2:1 | Pass (AAA large) / Pass (AA normal) |
| `temple-red` on `canvas` | 6.0:1 | Pass (AA normal) |
| `warm-gold` on `canvas` | 4.7:1 | Pass (AA large) — use only for ≥18 px text or non-text elements |
| `limewash`-equivalent on dark photo overlay | 13.1:1 | Pass (AAA) — used for hero overlay text |
| `success` on `canvas` | 5.4:1 | Pass (AA normal) |
| `warning` on `canvas` | 3.0:1 | Large text only — never for body |

The full audit is part of Phase 10 (Lighthouse + axe). All pigments were selected to clear AA against `canvas` for their primary use case.

### 1.8 Color rules

- **Never use black `#000000`.** Always `ink` (`#1A1A1A`).
- **Never use pure red, blue, or green for chrome.** Always the soft/desaturated variants above.
- **Brand pigments on dark backgrounds:** `temple-red` is the only pigment that can sit on `canvas-soft` or dark photo overlays at small sizes. `sand-yellow` requires ≥18 px or a `warm-gold-deep` outline for legibility.
- **Region identity is icon-led.** Color is reinforcement, never the only signal.

---

## 2. Typography

Three roles, paired for memorability and readability. No Inter-everywhere. Display is carved-stone, body is humanist, utility is monospace.

### 2.1 Type roles

| Role | Family | Use | Loaded via |
|---|---|---|---|
| Display | **Fraunces** (variable, with optical-size + softness/wonk axes) | H1, H2, large numbers, hero overlay | `next/font/google` |
| Body | **Hanken Grotesk** | Body text, H3+, UI, navigation | `next/font/google` |
| Utility | **Space Mono** | Eyebrows, coordinates, distances, fees, section indices, data tables | `next/font/google` |

### 2.2 Type scale

| Token | Size / line-height | Family | Weight | Use |
|---|---|---|---|---|
| `text-display-xl` | 64 / 72 px | Fraunces | 500 | Hero H1 (desktop) |
| `text-display-lg` | 48 / 56 px | Fraunces | 500 | Hero H1 (mobile), page H1 |
| `text-display-md` | 36 / 44 px | Fraunces | 500 | Section H2 (large) |
| `text-display-sm` | 28 / 36 px | Fraunces | 600 | Section H2 (default) |
| `text-heading-lg` | 22 / 30 px | Hanken | 600 | Card title, H3 |
| `text-heading-md` | 18 / 26 px | Hanken | 600 | Sub-heading, H4 |
| `text-body-lg` | 18 / 28 px | Hanken | 400 | Long-form body (detail page) |
| `text-body` | 16 / 24 px | Hanken | 400 | Default body, UI |
| `text-body-sm` | 14 / 20 px | Hanken | 400 | Captions, helper text |
| `text-utility` | 13 / 18 px | Space Mono | 400 | Eyebrows, metadata |
| `text-utility-sm` | 11 / 14 px | Space Mono | 400 | Small monospace labels (uppercased, tracked) |
| `text-data` | 14 / 20 px | Space Mono | 400 | Tables, coordinates, fees |

### 2.3 Eyebrow style

- Family: Space Mono.
- Size: 11 px (utility-sm) or 13 px (utility).
- Transform: uppercase.
- Letter-spacing: 0.08 em.
- Color: `temple-red` (default) or `warm-gold` (for premium sections).
- Use: section labels above H2s.

### 2.4 Line length

- **Body:** max 68 characters per line (~640 px at 18 px).
- **Long-form (detail page "History" etc.):** max 72 characters per line.
- **UI text:** no max (it's short).

### 2.5 Hierarchy rules

- **One H1 per page.** The H1 is the page's name or thesis.
- **H2 per major section.** Skip H3 if there's no sub-content.
- **No skipping levels.** H1 → H2 → H3 → H4. Never H1 → H3.
- **No H1 inside cards.** Cards use a `text-heading-lg` instead.

### 2.6 Font features

- **Fraunces** uses the `SOFT` and `WONK` axes at low values (0–30) for the display sizes. At 64 px, a small amount of wonk adds character; at 28 px, none.
- **Hanken Grotesk** uses default features; no alternate glyphs.
- **Space Mono** uses tabular numerals for data tables.

### 2.7 Font loading

- `next/font` self-hosts all three families.
- **Preload:** Fraunces (display) on every page; Space Mono on the detail page only.
- **Subset:** Latin + Latin Extended. (Devanagari etc. is not in the prototype.)
- **FOUT/FOIT:** a 200 ms fallback (`font-display: swap`) is acceptable for prototype. Production should use a stricter strategy.

---

## 3. Buttons

Buttons are the primary interactive element. Five variants, three sizes, fully accessible.

### 3.1 Variants

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| **Primary** | `temple-red` | `canvas` | none | One per section, max. CTAs. |
| **Secondary** | `canvas` | `ink` | 1-px `line-strong` | Cancel, secondary actions. |
| **Tertiary** (ghost) | transparent | `temple-red` | none | Inline links, "Get directions →", "See all →". |
| **Warm** | `warm-gold` | `canvas` | none | "Save" / "Notify me" — secondary brand emphasis. |
| **Destructive** | `danger` (`#C62828`) | `canvas` | none | "Remove from trip" — only when actually destructive. |

### 3.2 Sizes

| Size | Height | Padding (x) | Font | Use |
|---|---|---|---|---|
| `sm` | 32 px | 12 px | 14 px / Hanken 500 | Inline actions in cards, lightbox controls |
| `md` (default) | 44 px | 20 px | 16 px / Hanken 500 | Most buttons, form submit |
| `lg` | 52 px | 28 px | 18 px / Hanken 600 | Hero CTA, primary page CTA |

### 3.3 States

| State | Primary | Secondary | Tertiary |
|---|---|---|---|
| Default | `temple-red` bg, `canvas` text | `canvas` bg, `ink` text, 1-px `line-strong` | transparent, `temple-red` text |
| Hover | `temple-red-deep` bg, `canvas` text | `canvas-soft` bg, `ink` text | `temple-red-soft` bg, `temple-red` text |
| Focus | 2-px `temple-red` outline, 2-px offset (above all other styles) | 2-px `temple-red` outline, 2-px offset | 2-px `temple-red` outline, 2-px offset |
| Active/pressed | `temple-red-deep` bg, scale 0.98 | `canvas-soft` bg, scale 0.98 | `temple-red-soft` bg, scale 0.98 |
| Disabled | `canvas-soft` bg, `ink-subtle` text, no shadow | `canvas-soft` bg, `ink-subtle` text | `ink-subtle` text, no underline |
| Loading | text replaced by spinner, button stays the same size | same | same |

### 3.4 Iconic variants

- **Icon-only:** square, 44×44 px (md size). Icon size 20 px. Used in card actions (Save, Share) and lightbox controls.
- **Icon-leading:** icon (16 px) + 8-px gap + text.
- **Icon-trailing:** text + 8-px gap + icon (16 px). Used for "Explore this region →."

### 3.5 Button group rules

- **One primary button per section.** Two primary buttons on the same surface is a sign of confused hierarchy.
- **Order:** primary on the right (in horizontal groups), secondary on the left. This matches the "primary action proceeds, secondary cancels" convention.

### 3.6 A11y

- All buttons are real `<button>` or `<a>` elements (never a `<div>` with onClick).
- Icon-only buttons have `aria-label`.
- Disabled buttons have `aria-disabled="true"` and remain focusable (for screen reader announcement).
- Loading buttons have `aria-busy="true"` and announce the loading state.
- Focus order matches visual order.

---

## 4. Cards

Cards are the workhorse component — temple cards on Explore, trip-idea cards on Home, deity tiles, state tiles. Three sizes, multiple compositions, consistent anatomy.

### 4.1 Card compositions

#### 4.1.1 Photo card (default, temple cards on Explore list)

- **Container:** white surface, 1-px `line` border, 12-px corner radius, no shadow at rest.
- **Photo:** top, 16:9 aspect ratio, fixed (no layout shift). Object-fit cover.
- **Content:** 16-px padding, 4–8-px gap between elements.
  - Eyebrow (state, Space Mono 11 px, `temple-red`).
  - Title (Fraunces 22 px / Hanken 600 18 px, `ink`).
  - Caption (Hanken 14 px, `ink-muted`, 2 lines max with ellipsis).
  - Meta row (rating, distance, "Why this temple" 1 line, Space Mono 13 px, `ink-muted`).
- **Hover:** photo scales 1.03, card lifts 2 px (`translateY(-2px)`), sand-yellow ring (`sand-yellow-soft` 2-px border replacing `line`).
- **Reduced motion:** photo does not scale; card lift is instant (no transition).

#### 4.1.2 Compact card (Explore map mode, search overlay)

- **Container:** white surface, 1-px `line` border, 8-px corner radius.
- **Layout:** horizontal — photo (96×72 px, 4:3) on the left, content on the right.
- **Content:** 12-px padding.
  - Title (Hanken 600 16 px, `ink`).
  - Meta row (rating, state, Space Mono 12 px, `ink-muted`).
- **Hover:** sand-yellow ring (1-px `sand-yellow-soft` border replacing `line`).
- **No lift on compact cards** (they're too small to read a lift on).

#### 4.1.3 Trip-idea card (Homepage "Where will you go?")

- **Container:** white surface, 1-px `line` border, 16-px corner radius.
- **Photo:** 16:9.
- **Content:** 20-px padding.
  - Title (Fraunces 22 px, `ink`).
  - Description (Hanken 16 px, `ink`, 2 lines max).
  - Meta row (Space Mono 13 px, `temple-red`): "5 temples · 4 days · ~600 km."
  - Inline CTA (Tertiary button, "Explore →", `temple-red`).
- **Hover:** photo scales 1.03, card lifts 2 px, sand-yellow ring.

#### 4.1.4 State tile (Homepage "Browse by state")

- **Container:** white surface, 1-px `line` border, 12-px corner radius, 120-px minimum height.
- **Layout:** centered.
  - State silhouette SVG (40×40 px, `temple-red` at 60% opacity, 100% on hover).
  - State name (Hanken 600 16 px).
  - Temple count (Space Mono 12 px, `ink-muted`).
- **Hover:** silhouette fills `temple-red` 100%, sand-yellow ring.
- **Click:** opens a popover, not a navigation (per UX spec §1.6).

#### 4.1.5 Deity tile (Homepage "By deity")

- **Container:** white surface, 1-px `line` border, 12-px corner radius, 140-px minimum height.
- **Layout:** vertical.
  - Deity icon (48×48 px, hand-built SVG, `temple-red`).
  - Deity name (Fraunces 22 px).
  - Temple count (Space Mono 12 px, `ink-muted`).
- **Hover:** icon scales 1.05, sand-yellow ring.
- **Click:** routes to `/explore?view=list&deity=<slug>`.

#### 4.1.6 Trip-idea card, premium variant (future, not in prototype)

- Same as 4.1.3 with `warm-gold-soft` background and `warm-gold` 1-px border. Used for sponsored trip ideas. Not in the prototype.

### 4.2 Card grid

| Surface | Desktop | Tablet | Mobile |
|---|---|---|---|
| Explore list | 3 columns, 24-px gap | 2 columns, 16-px gap | 1 column, 16-px gap |
| Explore map right column | 1 column, 16-px gap | 1 column, 16-px gap | 1 column, 16-px gap |
| Trip ideas | 4 columns, 24-px gap | 2 columns, 16-px gap | 1 column, 16-px gap |
| Deity tiles | 3 columns, 24-px gap | 2 columns, 16-px gap | 2 columns, 16-px gap |
| State tiles | 6 columns, 16-px gap | 4 columns, 16-px gap | horizontal scroll, no grid |

### 4.3 Card a11y

- **Whole-card link:** the card is wrapped in a single `<a>` (no nested links inside). The visible button on the trip-idea card is a `<span>` styled as a button; the real navigation is the card's `<a>`.
- **No "click here" text.** The card's link text is the title (screen reader announces "Tirupati Temple — Tamil Nadu").
- **Focus:** the card's focus ring is the standard 2-px `temple-red` outline, 2-px offset.
- **Alternative text on photos:** mandatory. If the image is decorative, `alt=""`.

---

## 5. Carousels

Carousels are user-driven only. No autoplay. Three surfaces in the prototype: hero, trip ideas (technically a card grid, not a carousel), and the various in-page card carousels (related temples, festivals, etc.).

### 5.1 Hero carousel

- **Type:** full-bleed, 16:9 desktop / 4:3 mobile, max 60 vh on mobile.
- **No autoplay.** Static until interacted with.
- **Controls:**
  - **Dots:** 5 dots, 8-px diameter, 8-px gap. Active dot: `canvas` 16-px diameter with 2-px `temple-red` ring. Inactive dot: `canvas` at 50% opacity.
  - **Arrows:** prev/next, 44×44 px circular buttons, 24-px chevron icons, positioned 24 px from the slide edge. Background `canvas` with 80% opacity, `ink` icon. Hover: 100% opacity, 2-px `temple-red` outline.
  - **Keyboard:** left/right arrows, when carousel is focused.
  - **Touch:** horizontal swipe, 50-px threshold.
- **Transition:** 300 ms cross-fade. No Ken Burns. No parallax.
- **Slide anatomy:** see UX spec §1.3.
- **A11y:** `role="region"` with `aria-roledescription="carousel"`, `aria-label="Featured temples"`. Each slide `role="group"` with `aria-roledescription="slide"` and `aria-label="Slide N of 5"`.
- **Live region:** the slide change is announced via `aria-live="polite"` (off by default to avoid spam; on after the user has interacted once).

### 5.2 In-page card carousels (related temples, festivals)

- **Type:** horizontal scroll, 1 row, 4 cards visible on desktop, 2 on tablet, 1.2 on mobile (the "1.2" hints at scrollability).
- **No autoplay.** User scrolls with arrows, swipe, or horizontal scroll.
- **Controls:**
  - **Arrows:** left/right, 44×44 px, positioned 16 px from the carousel edge, vertically centered.
  - **Dots:** not used for card carousels (length is short).
  - **Scroll-snap:** cards snap to the start of each card on scroll.
- **Scroll indicators:** the rightmost visible card has a 24-px right-edge fade (`canvas` linear-gradient) hinting at more content. Disappears when the user has reached the end.
- **A11y:** `role="region"` with `aria-roledescription="carousel"`. Arrows have `aria-label="Previous temple"` and `aria-label="Next temple"`. Cards are real `<a>` elements.

### 5.3 State-strip horizontal scroll (mobile)

- **Type:** native horizontal scroll. No JavaScript carousel.
- **Scroll indicator:** 24-px right-edge fade.
- **A11y:** the strip is a `<div role="list">`, each state tile a `<button role="listitem">`. Keyboard users tab through them.

### 5.4 Carousel rules

- **One carousel with controls per page** (the hero). Other carousels are scroll-only.
- **No infinite scroll.** When the user reaches the end, the right arrow disables.
- **No "magic" auto-advance.** Once.
- **No mixed direction.** All carousels scroll horizontally, never vertically.

---

## 6. Search UI

Two search surfaces: the **top-of-page search** (Explore list mode) and the **header search overlay** (global, opens from the header). Both use the same alias-aware ranking.

### 6.1 Search input (top-of-page, Explore list)

- **Container:** 56-px height, 1-px `line-strong` border, 12-px corner radius, white background.
- **Leading icon:** search icon (lucide `Search`, 20 px, `ink-muted`).
- **Placeholder:** "Search temples, deities, places…", `ink-subtle`, 16 px.
- **Trailing clear button:** when the input is non-empty, an `×` icon (16 px) appears on the right. Click clears the input and the URL `?q=`.
- **Focus:** 2-px `temple-red` outline, 2-px offset, border becomes `temple-red`.
- **Padding:** 16 px horizontal, 12 px vertical.

### 6.2 Header search overlay

- **Trigger:** header search button (desktop and mobile).
- **Desktop:** dropdown anchored to the search button, 480 px wide, max-height 480 px, white surface, 16-px corner radius, 1-px `line` border, 8-px shadow (see §10).
- **Mobile:** bottom sheet at the "half" snap point, full width, 16-px top corner radius, drag handle visible.
- **Content:**
  - Search input at the top (same style as 6.1).
  - Live results (top 6) below, 200 ms debounce.
  - Each result: compact card (see UX spec §4.1.2).
  - "See all results for '[query]' →" link at the bottom (tertiary button style).
- **Empty input:** the overlay shows "Popular searches" chips (same as homepage).
- **A11y:** input is labelled; results are a `<ul role="listbox">` with each item `role="option"` and `aria-selected="true"` when highlighted. ↑/↓ navigates, Enter opens, Esc closes.
- **Animation:** the desktop overlay opens with a 200 ms scale-from-top (`scale: 0.98 → 1`) + opacity fade. The mobile sheet slides up. Under `prefers-reduced-motion`, both are instant.

### 6.3 Smart-match banner

- **Position:** above the result list, only on Explore.
- **Style:** `sand-yellow-soft` background, 1-px `sand-yellow` border, 12-px corner radius, 12-px padding.
- **Content:** "Showing [canonical] temples for '[original query]'" (Hanken 14 px, `ink`).
- **Dismiss:** `×` button (16 px) on the right, `ink-muted`. Click removes the alias boost for the current query and persists in session storage.
- **A11y:** `role="status"`, `aria-live="polite"`.

### 6.4 Search results — alias chip

- **Position:** inline next to the result name, only when an alias fired for that result.
- **Style:** `temple-red-soft` background, `temple-red` text, 4-px corner radius, 11 px Space Mono, uppercase, 0.04 em letter-spacing.
- **Content:** "matched: [original] → [canonical]."

### 6.5 Search loading

- **Spinner:** 16-px circular spinner, `temple-red`, in the input's right edge (replacing the clear button during loading).
- **Position:** in the result list, a 1-px-tall progress bar at the top of the list, `temple-red` filling left-to-right, 200 ms max.

### 6.6 Search a11y

- The input has a visually hidden `<label>` ("Search temples, deities, places").
- The result count is announced via `aria-live="polite"`.
- The alias banner is announced via `aria-live="polite"`.
- The overlay traps focus while open. Esc closes and returns focus to the trigger.

---

## 7. Maps UI

The map is a single inline SVG of India with state polygons, used in Explore map mode. No third-party map provider.

### 7.1 Map container

- **Aspect ratio:** 4:3 on desktop (the SVG is wider than tall to fit India), 1:1 on mobile.
- **Background:** `canvas-soft`.
- **Border:** 1-px `line`, 12-px corner radius.
- **Padding inside the container:** 24 px (so the polygons don't touch the edge).

### 7.2 State polygons

- **Default fill:** `line` (`#E5E0D6`).
- **Stroke:** `canvas`, 1 px (to separate adjacent states).
- **Cursor:** pointer (when interactive).
- **Hover/focus:**
  - Fill: `sand-yellow-soft` (`#FBF1D9`).
  - Stroke: 1-px `temple-red`.
  - Focus ring: 2-px `temple-red` outline, 2-px offset (offset from the polygon, not the SVG).
- **Selected:**
  - Fill: `temple-red` (`#C62828`).
  - Stroke: 1-px `temple-red-deep`.
  - Cursor: default (already selected).
- **Disabled** (filtered out by region pill):
  - Fill: `canvas`.
  - Opacity: 0.4.
  - Cursor: not-allowed.

### 7.3 Cluster layer

- **Type:** circles placed at the centroid of each region, sized by `log(count + 1)`.
- **Fill:** `temple-red` at 30% opacity.
- **Stroke:** `temple-red` at 60% opacity, 1 px.
- **Label inside the circle:** the count (Space Mono 13 px, `canvas`). Hides when the circle is too small to contain it.
- **No interaction** in the prototype — clusters are informational. (Future: click to filter the right column to that region.)

### 7.4 Region pills (above the map)

- **Style:** see [§8 Filters](#8-filters). 7 pills: All, North, South, East, West, Northeast, Central.
- **Selected:** `temple-red-soft` background, `temple-red` text, 1-px `temple-red` border.
- **Hover (not selected):** `sand-yellow-soft` background, `ink` text.
- **Layout:** horizontal row, 8-px gap, wrap on small screens.

### 7.5 Right column — selected state header

- **State name (H2):** Fraunces 28 px, `ink`.
- **Temple count (Space Mono 13 px, `ink-muted`):** "(12 temples)."
- **Search input** scoped to the state (same style as §6.1, smaller).
- **Sort dropdown** (see §8.6).

### 7.6 Map a11y

- The SVG has `role="img"` and a `<title>` element: "Map of India. Use the list below to navigate by state."
- Each state is `<g role="button" tabindex="0" aria-label="[State name] — [N] temples">`.
- A visually hidden `<ul>` of state links mirrors the map. Screen reader users navigate the list, not the SVG.
- Focus order: state polygons in geographic order (north to south, west to east), then the parallel `<ul>`.

### 7.7 Map — mobile bottom sheet

- **Snap points:** peek (60 px above the bottom, showing 1 card), half (40 vh), full (90 vh).
- **Drag handle:** 36×4-px pill, `line-strong`, 8 px from the top of the sheet.
- **Sheet surface:** `canvas`, top corners 16-px radius, 8-px shadow upward.
- **State of the map:** the map is 40 vh on top, sticky. The sheet is below.
- **A11y:** the sheet is focus-trapping at half and full snap points. Esc closes the sheet to peek. The drag handle is keyboard-operable (Enter to expand, arrow keys to switch snaps).

---

## 8. Filters

Four filters in the prototype: State, Deity, Tag, Sort. Each is a distinct UI, but they share a language of pills, popovers, and active-state chips.

### 8.1 Filter trigger (button-style)

- **Style:** 36-px height, `canvas` background, 1-px `line-strong` border, 8-px corner radius, 12-px horizontal padding.
- **Label:** Hanken 14 px, `ink`. Includes the filter name and (if selected) the value: "State: Tamil Nadu ▾".
- **Icon:** chevron-down (lucide `ChevronDown`, 16 px, `ink-muted`) trailing.
- **Active state:** 1-px `temple-red` border, `temple-red` text.
- **Hover (not active):** `canvas-soft` background.

### 8.2 Filter popover

- **Position:** anchored to the trigger, 8-px gap, 12-px corner radius, 1-px `line` border, 8-px shadow, `canvas` surface.
- **Width:** matches the trigger or 280 px (whichever is wider), max 360 px.
- **Max height:** 360 px, scrollable if the content is longer.
- **A11y:** `role="dialog"` with `aria-labelledby` pointing to the popover title. Focus is trapped while open. Esc closes.

### 8.3 State filter

- **Popover content:**
  - Search input at the top (compact, 36-px height).
  - List of 37 states/UTs below, sorted alphabetically. Each is a row with state name (Hanken 14 px) and temple count (Space Mono 12 px, `ink-muted`).
  - Single-select: clicking a row selects and closes the popover.
  - Hover (row): `sand-yellow-soft` background.

### 8.4 Deity filter

- **Popover content:**
  - List of 6 deities. Each row has the deity icon (24 px), name (Hanken 14 px), and temple count.
  - Single-select.

### 8.5 Tag filter

- **Popover content:**
  - List of all tags, each a row with a checkbox (left) and label (right).
  - Multi-select.
  - Footer: "Show more" link if there are more than 12 tags. (The prototype has 5–8 tags total.)
  - Validation: trying to select a 4th tag shows an inline message ("Up to 3 tags at a time.") and the click is ignored.

### 8.6 Sort filter

- **Popover content:**
  - Radio-style list: Top rated (default), Most visited, A–Z.
  - Single-select.
  - No search input (the list is short).

### 8.7 Active filters row (below the filter row)

- **Style:** removable chips, 8-px gap.
- **Chip:** 32-px height, `temple-red-soft` background, 1-px `temple-red` border, `temple-red` text, 8-px corner radius.
- **Chip content:** "[Filter name]: [value] ×" (the × is part of the chip, 12 px).
- **Reset all chip:** trailing in the row, `canvas` background, 1-px `line-strong` border, `ink` text. Hidden if no filters are active.

### 8.8 Filter a11y

- Each popover trigger is a real `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- The popover is `role="dialog"`, focus-trapped.
- Active filter chips have `aria-label="Remove filter: [name] [value]"`.
- The "Reset all" chip is `aria-label="Reset all filters"`.

---

## 9. Spacing system

An 8-px base, with a 4-px half-step. Component-internal spacing is 8 or 16; section spacing is 24, 32, 48, 64, 96.

### 9.1 Spacing scale

| Token | Value | Use |
|---|---|---|
| `space-0` | 0 | Reset |
| `space-1` | 4 px | Tight icon-text gap, badge padding |
| `space-2` | 8 px | Inline element gap (icon + text, chip + chip) |
| `space-3` | 12 px | Card padding (compact), popover padding, button padding (sm) |
| `space-4` | 16 px | Card padding (default), form field gap, input padding |
| `space-5` | 20 px | Section padding (compact), button padding (md) |
| `space-6` | 24 px | Card gap in grid, section padding (default), popover gap |
| `space-8` | 32 px | Section gap (within a page), large card padding |
| `space-10` | 40 px | Section padding (large) |
| `space-12` | 48 px | Section gap (between major sections) |
| `space-16` | 64 px | Section padding (hero-adjacent) |
| `space-20` | 80 px | Section padding (extra-large) |
| `space-24` | 96 px | Section gap (page-level), bottom of page |
| `space-32` | 128 px | Hero section padding (desktop) |

### 9.2 Vertical rhythm

- **Within a card:** `space-2` (8 px) between elements of the same group; `space-4` (16 px) between groups.
- **Within a section:** `space-6` (24 px) between major elements.
- **Between sections on the same page:** `space-12` (48 px) on desktop, `space-10` (40 px) on mobile.
- **Hero section padding:** `space-16` (64 px) top and bottom on desktop, `space-10` (40 px) on mobile.

### 9.3 Grid gaps

| Surface | Desktop | Tablet | Mobile |
|---|---|---|---|
| Card grid (3 columns) | 24 px | 16 px | 16 px |
| Card grid (2 columns) | 24 px | 16 px | 16 px |
| Filter row | 12 px | 8 px | 8 px |
| Active filters row | 8 px | 8 px | 8 px |
| Footer columns | 48 px | 32 px | 24 px |

### 9.4 Container widths

| Token | Value | Use |
|---|---|---|
| `container-tight` | 640 px | Editorial paragraph, body text on detail page |
| `container-default` | 960 px | Form pages, search overlay |
| `container-wide` | 1280 px | Homepage content, Explore content |
| `container-max` | 1440 px | Hero background bleed |

### 9.5 Mobile spacing

- On viewports < 768 px, all section-level spacing is reduced by 25%. The 8-px base is unchanged.
- Tap-target spacing (between buttons) is at least `space-2` (8 px).

---

## 10. Shadows

Shadows are used sparingly. Cards, popovers, the lightbox, and the bottom sheet use them. Buttons, inputs, and chrome elements use borders instead.

### 10.1 Shadow tokens

| Token | Definition | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(26, 26, 26, 0.06)` | Card lift on hover (subtle) |
| `shadow-md` | `0 2px 8px rgba(26, 26, 26, 0.08)` | Card lift on hover (default), popover |
| `shadow-lg` | `0 4px 16px rgba(26, 26, 26, 0.10)` | Lightbox, search overlay, bottom sheet (full snap) |
| `shadow-xl` | `0 8px 32px rgba(26, 26, 26, 0.12)` | Lightbox (full-screen), modal dialogs |
| `shadow-focus` | `0 0 0 2px temple-red` | Focus ring (used alongside outline; see 10.3) |

### 10.2 Shadow rules

- **Cards at rest: no shadow.** Cards rely on a 1-px `line` border for definition.
- **Cards on hover: `shadow-md`.** Combined with the 2-px `translateY(-2px)` lift.
- **Popovers: `shadow-md`.** A popover is the softest "elevated" surface.
- **Lightbox: `shadow-xl`.** The most elevated surface on the page.
- **Buttons: no shadow.** A primary button's filled background is its elevation cue. Shadow on a button looks like a Material design relic.

### 10.3 Focus ring

- The standard focus ring is a 2-px `temple-red` outline with a 2-px offset. This is the primary a11y focus indicator, not a shadow.
- `shadow-focus` (a 2-px `temple-red` ring shadow) is an alternative for components where the outline would clash with the visual (e.g. inside a card with a `line` border). The outline + offset is the default; the shadow ring is the exception.

### 10.4 Inset shadows

- **Search input focus:** a 1-px inset `temple-red` ring (subtle, ~10% opacity) accompanies the 2-px outer outline. This signals "active input" without replacing the outline.
- **Selected card (e.g. on a map):** a 1-px inset `temple-red` ring at 20% opacity. Combined with the 1-px `temple-red` border.

---

## 11. Motion system

Motion is restrained. Three motion types: reveals, transitions, and the one shared-element morph. No ambient loops. No autoplay. `prefers-reduced-motion` is a floor.

### 11.1 Motion types

#### 11.1.1 Reveal-on-scroll

- **Trigger:** element enters the viewport (intersection observer, 10% threshold).
- **Effect:** `opacity: 0 → 1`, `translateY(16px) → 0`, `filter: blur(3px) → blur(0)`.
- **Duration:** 350 ms.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart).
- **Stagger:** children stagger by 60 ms.
- **Where:** section content (homepage), major sections (detail page), card grids.
- **Reduced motion:** instant opacity; no translate, no blur.

#### 11.1.2 Transitions (state changes, cross-fades)

- **Trigger:** state change (e.g. carousel slide, popover open, mode toggle).
- **Effect:** cross-fade (opacity), sometimes with a 4-px translate.
- **Duration:** 200 ms (small UI), 300 ms (carousel), 350 ms (section transition).
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease-in-out) for UI; the reveal easing for section-level changes.
- **Reduced motion:** instant (0 ms).

#### 11.1.3 Shared-element morph (the one "wow" moment)

- **Trigger:** navigation from a card to a temple detail page.
- **Mechanism:** React View Transitions API (`experimental.viewTransition: true`).
- **Effect:** the card's image element shares a `view-transition-name` with the detail page's hero image, producing a continuous morph between them.
- **Duration:** 400 ms.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Direction:** the page slide direction (forward/back) is set via `addTransitionType` on `TransitionLink`.
- **Where:** card → detail page only. No other surfaces use shared-element transitions.
- **Reduced motion:** disabled. The page navigates instantly.

### 11.2 Motion tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-instant` | 0 ms | — | All transitions under `prefers-reduced-motion` |
| `motion-fast` | 150 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover state changes, button press |
| `motion-default` | 200 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Popover open, dropdown, chip selection |
| `motion-medium` | 300 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Carousel slide, mode toggle |
| `motion-reveal` | 350 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Section reveals, content entrance |
| `motion-morph` | 400 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Shared-element morph |
| `motion-sheet` | 250 ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom-sheet snap (mobile) |

### 11.3 Motion rules

- **One morph per navigation.** The shared-element morph is reserved for card → detail page. Other navigations cross-fade or are instant.
- **No motion in chrome.** The header doesn't slide in. Buttons don't bounce. Chips don't wiggle.
- **No motion on focus.** Focus rings appear instantly.
- **No motion longer than 400 ms** in the prototype. (The detail page's reveal is the only thing close.)

### 11.4 Reduced motion

- All reveal-on-scroll, cross-fades, sheet snaps, and the shared-element morph are disabled.
- Hover effects (color, ring) remain. Cards don't lift; they show the sand-yellow ring only.
- Carousel slides change instantly.
- The bottom sheet snaps instantly on click.
- This is a **floor**, not a feature — the prototype works fully without motion.

---

## 12. Hover effects

Hover effects are desktop-only (no hover on touch). They are the visual reward for the user's attention, but they don't carry information. Keyboard focus states mirror hover (focus ring + ring) so the experience is consistent.

### 12.1 Hover principles

- **Subtle, never theatrical.** A 2-px lift, a 1.03 photo scale, a sand-yellow ring. No bounce, no flip, no glow.
- **Information-preserving.** The card is the same card after hover; the user has not changed state.
- **Reversible.** Returning the cursor restores the original state instantly.
- **One hover effect per component.** A card has a single hover treatment, not a multi-part animation.

### 12.2 Hover by component

| Component | Hover effect | Reduced motion equivalent |
|---|---|---|
| Primary button | `temple-red` → `temple-red-deep` background, 150 ms | Color change only |
| Secondary button | `canvas` → `canvas-soft` background, 150 ms | Color change only |
| Tertiary button (link) | `temple-red-soft` background, 150 ms | Color change only |
| Card (photo) | 2-px `translateY(-2px)` lift + photo `scale(1.03)` + sand-yellow ring replacing `line` border, 200 ms | Sand-yellow ring only |
| Compact card | Sand-yellow ring (1 px), 150 ms | Color change only |
| Trip-idea card | 2-px `translateY(-2px)` lift + photo `scale(1.03)` + sand-yellow ring, 200 ms | Sand-yellow ring only |
| State tile | Silhouette fills `temple-red` 100%, sand-yellow ring, 150 ms | Color change only |
| Deity tile | Icon `scale(1.05)`, sand-yellow ring, 200 ms | Color change only |
| Filter trigger | `canvas` → `canvas-soft` background, 150 ms | Color change only |
| Active filter chip | Background `temple-red-soft` → `temple-red-deep`-tinted, 150 ms | Color change only |
| State polygon (map) | Fill `line` → `sand-yellow-soft`, 1-px `temple-red` stroke, 150 ms | Color change only |
| Trip idea link (CTA) | Underline draws in (left to right, 200 ms) | Underline always visible on hover |
| Header link | `ink` → `temple-red` text color, 150 ms | Color change only |
| Search overlay trigger | `canvas-soft` background, 150 ms | Color change only |

### 12.3 Focus mirroring

Every hover effect has a focus equivalent that does the same visual change. This way, a keyboard user gets the same visual feedback as a mouse user.

| Component | Focus effect |
|---|---|
| Card | Sand-yellow ring (same as hover) + 2-px `temple-red` outline (offset) |
| Button | 2-px `temple-red` outline (offset) + background darkens slightly |
| Filter trigger | 2-px `temple-red` outline (offset) + active state's border |
| State polygon (map) | Sand-yellow fill + 2-px `temple-red` outline (offset) |
| Link | 2-px `temple-red` outline (offset) + underline always visible |

The focus state is **always** more visible than the hover state. A keyboard user must never be at a disadvantage.

### 12.4 Touch (no hover)

- Touch devices don't fire `:hover` reliably. All interactive states (selection, active) are conveyed through the press state (`:active`) and the post-press state.
- The "sand-yellow ring" on a card after tap serves as the post-press state for ~1.5 s, then returns to default.

---

## 13. Responsive design

Mobile is the primary use case. The prototype is designed mobile-first, with breakpoints that add complexity as the viewport grows.

### 13.1 Breakpoints

| Name | Min width | Max width | Devices |
|---|---|---|---|
| `xs` | 0 | 479 px | Small phones (legacy) |
| `sm` | 480 px | 767 px | Standard phones |
| `md` | 768 px | 1023 px | Large phones, small tablets |
| `lg` | 1024 px | 1439 px | Tablets, small laptops |
| `xl` | 1440 px | — | Laptops, desktops |

### 13.2 Layout shifts across breakpoints

#### 13.2.1 Header

- `< sm`: logo + hamburger. Sheet on open.
- `sm`–`md`: logo + hamburger + (optional) search icon. Sheet on open.
- `≥ md`: full nav, with search and language pill visible.
- `≥ lg`: full nav with all dropdowns.

#### 13.2.2 Homepage hero

- `< sm`: 4:3, 60 vh max, slide overlay text at 32 px.
- `sm`–`md`: 4:3, 60 vh max, slide overlay text at 36 px.
- `≥ md`: 16:9, slide overlay text at 48 px.
- `≥ lg`: 16:9, max-height 720 px, slide overlay text at 56 px.

#### 13.2.3 Trip ideas grid

- `< sm`: 1 column, full width.
- `sm`–`md`: 2 columns.
- `≥ md`: 2 columns.
- `≥ lg`: 4 columns.

#### 13.2.4 State strip

- `< md`: horizontal scroll, 1 row.
- `≥ md`: 6-column grid (or 4-up on `md`).

#### 13.2.5 Deity tiles

- `< sm`: 2 columns.
- `sm`–`md`: 3 columns.
- `≥ md`: 3 columns.
- `≥ lg`: 3 columns (always 3; deity count is 6).

#### 13.2.6 Explore list mode

- `< md`: 1 column. Sticky search bar at top. Filters collapsed behind a button.
- `md`–`lg`: 2 columns.
- `≥ lg`: 3 columns. Filters in a row.

#### 13.2.7 Explore map mode

- `< md`: stacked. Map 40 vh sticky. Right column in a bottom sheet.
- `md`–`lg`: side-by-side, map 55% / right column 45%.
- `≥ lg`: side-by-side, map 60% / right column 40%.

#### 13.2.8 Temple detail

- Single column throughout.
- `< md`: cost table scrolls horizontally, quick-facts bar scrolls horizontally.
- `≥ md`: cost table fits in viewport, quick-facts bar in a row.

#### 13.2.9 Footer

- `< md`: single column.
- `md`–`lg`: 2 columns.
- `≥ lg`: 3 columns.

### 13.3 Image sizes (next/image `sizes`)

| Surface | `sizes` attribute |
|---|---|
| Hero (homepage and detail) | `100vw` |
| Trip-idea card (4-up grid) | `(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw` |
| Temple card (3-up grid) | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` |
| Temple card (compact) | `96px` |
| State tile (6-up grid) | `(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw` |
| Gallery image (3-up grid) | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` |
| Lightbox image | `100vw` |

### 13.4 Container queries (where applicable)

- **Trip-idea card:** the meta-row repositions based on card width. If the card is < 280 px, the meta-row moves below the description. If ≥ 280 px, it stays inline.
- **Temple card:** no container queries needed at the prototype's card sizes.
- **State polygon (map):** if the SVG width is < 400 px, the cluster labels hide (they're too small to read).

### 13.5 Tap targets

- **Minimum:** 44×44 px (Apple HIG) / 48×48 dp (Material). All buttons, chips, and links respect this.
- **Spacing:** 8 px minimum between adjacent targets.
- **Card as link:** the entire card is a tappable surface. On a 3-column grid, each card is ~33% of the viewport, comfortably tappable.

### 13.6 Print

- The detail page has a print stylesheet. Other pages are not print-optimized.
- See UX spec §3.22.

---

## 14. Accessibility requirements

Accessibility is a floor, not a feature. Every surface in the prototype must meet WCAG 2.1 AA. This section consolidates the a11y requirements from all components and surfaces.

### 14.1 Perceptual

- **Contrast:** all text on `canvas` meets AA (4.5:1 for body, 3:1 for large). The full audit is in §1.7.
- **Color independence:** no information is conveyed by color alone. Region identity uses icon + label; filter selection uses chip + check; error states use icon + text.
- **Focus indicators:** every interactive element has a 2-px `temple-red` outline with a 2-px offset. The outline is visible on all backgrounds, including photo overlays (where the outline is a 2-px `temple-red` ring with a 1-px `canvas` outer offset for contrast).
- **Text size:** body text is 16 px minimum. Nothing is smaller than 11 px (Space Mono utility labels, uppercased and tracked).

### 14.2 Operable

- **Keyboard:** every interactive element is reachable and operable by keyboard. Tab order matches visual order. Skip-to-content link is the first focusable element.
- **Touch targets:** 44×44 px minimum, 48×48 dp on mobile.
- **No motion required:** the prototype works fully without motion. The shared-element morph, reveals, and bottom-sheet drag are all disabled under `prefers-reduced-motion`.
- **No time limits:** no countdown timers, no autoplay.
- **Pointer:** clicks, taps, and keyboard input all work. No gesture-only interactions.

### 14.3 Understandable

- **Language:** the page has a `lang="en"` attribute. (Devanagari etc. is not in the prototype.)
- **Labels:** every input has a visible label or `aria-label`. Form fields have associated `<label>` elements.
- **Consistent navigation:** the header, footer, and back-link patterns are identical across all routes.
- **Error messages:** form errors are specific ("Please enter a temple name"), not generic ("Invalid input"). Errors are announced via `aria-live="assertive"`.
- **Page titles:** every route has a unique `<title>` ("CTemples — Explore", "CTemples — Tirupati Temple", etc.).

### 14.4 Robust

- **Semantic HTML:** every component uses the right element. Headings for headings, buttons for buttons, lists for lists, navigation for navigation.
- **ARIA only when needed:** the prototype prefers native HTML semantics. ARIA roles are added only when no native element fits (e.g. `role="button"` on an SVG state polygon, `role="dialog"` on a popover).
- **Live regions:** the search result count, the alias banner, and the empty-state messages are all `aria-live="polite"`. Errors are `aria-live="assertive"`.
- **Testing:** the prototype is tested with axe (no critical violations), keyboard-only walkthrough, and 200% browser zoom. Screen reader testing (VoiceOver on macOS, NVDA on Windows) is part of Phase 10.

### 14.5 Specific a11y requirements

#### 14.5.1 Header

- Skip-to-content link as the first focusable element.
- Mobile sheet traps focus while open.
- The Explore dropdown is dismissible by clicking outside or pressing Esc.

#### 14.5.2 Hero carousel

- `role="region"`, `aria-roledescription="carousel"`, `aria-label="Featured temples"`.
- Each slide is `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide N of 5"`.
- Slide change is announced via `aria-live="polite"` after the user has interacted.
- The carousel is operable by arrow keys when focused.
- No autoplay (which would be a 2.2.2 violation even with a pause control).

#### 14.5.3 Cards

- Whole card is a single `<a>` (no nested links).
- Card title is the link text (screen readers announce "Tirupati Temple — Tamil Nadu").
- Photos have meaningful `alt` text or `alt=""` if decorative.
- The card's focus ring is the standard 2-px `temple-red` outline with offset.

#### 14.5.4 Search

- Input has a visually hidden `<label>`.
- Result list is `role="listbox"`, items are `role="option"` with `aria-selected`.
- The alias banner is `role="status"`, `aria-live="polite"`.
- The overlay traps focus while open. Esc closes and returns focus to the trigger.

#### 14.5.5 Map

- The SVG has `role="img"` and a `<title>`.
- Each state is a `<g role="button" tabindex="0" aria-label="[State] — [N] temples">`.
- A visually hidden `<ul>` of state links mirrors the map. Screen reader users navigate the list, not the SVG.
- Focus order is geographic (north to south, west to east).

#### 14.5.6 Filters

- Each popover trigger is a real `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- The popover is `role="dialog"`, focus-trapped.
- Active filter chips have `aria-label="Remove filter: [name] [value]"`.

#### 14.5.7 Detail page

- One H1. Section headings are H2. Sub-headings are H3.
- The lightbox traps focus when open. Esc closes. Clicking the backdrop closes.
- The "Get directions" link is a real `<a>` with `target="_blank"` and `rel="noopener"`.
- The map iframe has a `title` attribute.

#### 14.5.8 Forms (Contact, Suggest)

- Each input has a `<label>`.
- Required fields are marked with `aria-required="true"` and visible `*`.
- Error messages are associated via `aria-describedby`.
- Submit button has `aria-busy` while submitting (though the prototype is UI-only, the markup is in place).

### 14.6 Testing checklist (Phase 10)

- [ ] Lighthouse accessibility score ≥ 95 on home, explore, and detail.
- [ ] axe-core: zero critical or serious violations.
- [ ] Keyboard walkthrough: every interaction reachable, every flow completable without a mouse.
- [ ] 200% browser zoom: layout doesn't break, no horizontal scroll, no clipped text.
- [ ] VoiceOver (macOS) and NVDA (Windows) walkthrough: page structure is announced correctly, form fields are labeled, dynamic content is announced.
- [ ] Color contrast audit: every text/background pair meets AA.
- [ ] Reduced motion: all reveals, transitions, and the morph are disabled. The page is fully usable.
- [ ] Touch: 44×44 px minimum target, 8-px spacing.
- [ ] No keyboard traps (except intentional ones in popovers, dialogs, and the lightbox, which all have Esc-to-close).

---

## Appendix — Cross-cutting rules

These rules apply to every component in the system and are referenced from individual sections.

- **Brand pigments on dark backgrounds:** only `temple-red` is allowed on dark photo overlays at small sizes. `sand-yellow` requires ≥ 18 px text or a `warm-gold-deep` outline.
- **One H1 per page.** Always.
- **No skipping heading levels.** H1 → H2 → H3 → H4.
- **Real elements, not divs-as-buttons.** Every button is a `<button>` or `<a>`. Every form field is an `<input>` with a `<label>`.
- **Focus is more visible than hover.** A keyboard user must never be at a disadvantage.
- **Reduced motion is a floor, not a feature.** The prototype works fully without motion.
- **Color is reinforcement, never the only signal.** Icon + label + position first; color second.
- **No autoplay.** Once.
- **No client-side search computation.** The alias map and ranking live on the server.

---

End of Design System V2.
