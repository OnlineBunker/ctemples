# 03 — World-Class Design System ("Modern Utsavam")

> **CTemples Master Specification, file 3 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: `DESIGN_SYSTEM_V2.md` (entirely), `DESIGN.md` (absorbed), CLAUDE.md "Color tokens (locked)". Conflicts resolved: A5 (D1), B15, C2/C3 (D17), B16 (D23). Canonical hexes live in `tailwind.config.ts`; this file is their normative documentation — if they ever disagree, fix the config to match this file.

---

## 1. Design intent

Festival energy, refined. A calm porcelain canvas carries saturated festival pigments the way a courtyard carries rangoli: concentrated, deliberate, never wall-to-wall. Bold grotesk display type does the emotional work; color confirms it. Kolam-derived line geometry is the only ornament. Everything else is photography, typography, and restraint.

## 2. Color

### 2.1 Token table (canonical)

| Token | Hex | Role |
|---|---|---|
| `porcelain` | `#FBF6F0` | Page canvas (body background) |
| `porcelain-deep` | `#F4EADF` | Warm wash: map-state rest fill, image placeholders, soft bands |
| `canvas` | `#FFFFFF` | Elevated surfaces: cards, popovers, menus, inputs |
| `ink` | `#241021` | Body text (plum-tinted charcoal) |
| `ink-muted` | `#6B5A67` | Secondary text, captions, micro-labels |
| `ink-subtle` | `#9A8C96` | **Decorative/disabled only** (see contrast table) |
| `line` | `#ECE0D6` | Hairlines, card borders |
| `line-strong` | `#D8C8BA` | Input borders, secondary-button borders |
| `plum` / `-deep` / `-soft` / `-muted` | `#3D0A40` / `#2A0730` / `#F3E6F0` / `#6E4A70` | Display headings, dark panels, depth |
| `magenta` / `-deep` / `-soft` | `#E5006D` / `#B80057` / `#FCE0EE` | Primary brand: CTA, links, selection, focus |
| `coral` / `-deep` / `-soft` | `#FF3D6E` / `#E02453` / `#FFE3EA` | Gradient mid-stop, secondary accent |
| `saffron` / `-deep` / `-soft` | `#FF7A00` / `#D96400` / `#FFE9D3` | Warm accent, "warm" button fill |
| `turmeric` / `-deep` / `-soft` | `#FFC300` / `#E0AB00` / `#FFF3CC` | Highlights, star fill, chips |
| `success` / `warning` / `info` / `danger` | `#2E7D32` / `#E6A23C` / `#3E6CC4` / `#D32F2F` | Functional (each with `-soft`) |

**Region pigments** (icon+label lead, color reinforces): North `#7A2C9E` · South `#E5006D` · East `#FF7A00` · West `#FF3D6E` · Northeast `#E0AB00` · Central `#3D0A40`.
**Deity accents** (inline hex via `lib/deities.ts`, never dynamic Tailwind classes): Shiva `#E5006D` · Vishnu `#FF7A00` · Devi `#FFC300` · Ganesha `#2E7D32` · Murugan `#3E6CC4` · Hanuman `#FF3D6E`. Used at 100% for icon strokes and `{hex}14` (8% alpha) for icon-chip backgrounds.

**Gradients (Amendment A, 2026-07-11 — promoted to first-class brand language):** `bg-utsavam` = `linear-gradient(135deg, #E5006D 0%, #FF3D6E 46%, #FF7A00 100%)` — the mockup's signature festival gradient. Sanctioned uses: decorative panels and kolam-geometry tiles, active/selected accents, image scrims, section flourishes. Contrast guardrail unchanged: **never behind light text** (saffron end is 2.6:1 with white); text-carrying gradient surfaces use the AA-safe span. Button gradient = `to right, magenta → coral-deep` (both ends ≥4.6:1 with white); a saffron-tinted outer glow on hover is permitted (shadow, not fill — text contrast unaffected). `bg-utsavam-soft` = `#FCE0EE → #FFE9D3` for soft feature panels. **Kolam geometry** is the paired graphic language: gradient kolam tiles, corner motifs, and section dividers may appear wherever a decorative panel is sanctioned (static; motion only per file 08).

**Legacy aliases** (`temple-red`→magenta, `sand-yellow`→turmeric, `warm-gold`→saffron) exist only so unmigrated pages keep compiling. New code must use the real names. After the last legacy page migrates (file 13, cleanup phase), the aliases are deleted and CI greps for them.

### 2.2 Contrast table (computed, WCAG 2.1)

| Pair | Ratio | Verdict → rule |
|---|---|---|
| ink on porcelain | 16.6:1 | ✅ body text |
| ink-muted on porcelain | 5.9:1 | ✅ secondary text, min size unrestricted |
| ink-subtle on porcelain | 2.97:1 | ❌ **never informational text**; decorative marks & disabled states only |
| plum on porcelain | 14.8:1 | ✅ display headings |
| white on plum | 15.9:1 | ✅ dark panels, photo scrims |
| **magenta on porcelain** | **4.3:1** | ⚠️ **large text only** (≥24px, or ≥18.66px bold). Small magenta text on porcelain/canvas must use **magenta-deep (6.2:1)** — this includes eyebrows, mono micro-labels, and inline links at body size |
| magenta-deep on porcelain | 6.2:1 | ✅ small brand-colored text |
| white on magenta | 4.61:1 | ✅ but no margin — fine for ≥14px semibold button labels; labels on selected map states go on magenta-deep (6.6:1) instead |
| white on coral | 3.42:1 | ❌ never |
| white on coral-deep | 4.6:1 | ✅ gradient-button end stop |
| white on saffron | 2.6:1 | ❌ — saffron fills take **plum** text (6.1:1 ✅) |
| plum on turmeric | 9.9:1 | ✅ chips, highlights |

**Migration note:** the shipped `.eyebrow` class uses magenta at 11.2px — below AA per this table. When any phase next touches chrome, eyebrows and all sub-18px brand-colored text switch to `magenta-deep`. This is a known, tracked correction (file 13, Phase 3 checklist), not an open decision.

### 2.3 Color usage laws

1. One primary CTA per section (an H2-rooted block). *(Amendment A: was "per viewport-height of content" — the section is the natural unit and permits the richer gradient CTA language without a magenta wall.)*
2. Saffron/turmeric never sit behind body text; they fill chips, icons, accents, and decorative panels (plum-on-turmeric badges pass at ~10:1).
3. Plum is the only permitted dark surface (methodology panel, photo scrims, footer accents); never full-page.
4. Functional colors are reserved for their function (danger ≠ brand emphasis).
5. Region/deity hues appear only as dots, icon strokes, and 8%-alpha icon chips — never as text colors or large fills.

## 3. Typography

**Families** (all self-hosted via `next/font`, variables `--font-display/body/mono/telugu`):
- **Bricolage Grotesque** — display. H1–H3, card titles (D23), stat figures. Weights: variable; use 600 for headings, 700 sparingly.
- **Inter** — body/UI. 400 body, 500 labels, 600 emphasis/buttons.
- **Space Mono** — the data layer: eyebrows, coordinates, fees, counts, indices, pagination. 400/700.
- **Noto Sans Telugu** — the hero flourish only (`lang="te"` required). Never for chrome or content.

**Scale:**

| Token | Size | LH | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | clamp(2.75rem, 8vw, 7rem) | 0.96 | −0.02em | reserved (campaign moments) |
| `display-lg` | clamp(2.25rem, 5.5vw, 4.5rem) | 1.0 | −0.015em | page H1 (hero thesis) |
| `display-md` | clamp(1.85rem, 3.6vw, 3rem) | 1.05 | −0.01em | section H2 |
| `text-2xl/xl` | 24/20px | 1.3 | — | card/sub H3, editorial pull-text |
| `text-lg` | 18px | 1.7 | — | long-form prose (`prose-temple`), lede |
| `text-base` | 16px | 1.5 | — | body/UI default; mobile floor for body |
| `text-sm` | 14px | 1.5 | — | secondary UI, card meta |
| `text-xs` | 12px | 1.4 | — | smallest Inter size |
| mono label | 11.2px (0.7rem) | 1.2 | +0.22em upper | eyebrows, data labels — magenta-deep or ink-muted |
| mono micro | 9.6px (0.6rem) | 1.2 | +0.22em upper | counters/captions only; ≥4.5:1; never the sole carrier of information |

**Heading law:** one H1 per page; H2 per major section; H3 within sections and on card titles; never skip levels. `text-wrap: balance` on headings, `pretty` on paragraphs.

## 4. Layout, space, radius, shadow, z

- **Shell:** `max-w-[1440px]`, padding 20/32/48px (base/sm/lg); never full-bleed text. (Widened from the original 1280px — 2026-07-10, in-chat decision — 1280px left ~15%+ empty margin on common 1440–1512px laptop screens; 1440px was already the sanctioned hero-band ceiling, now applied to the shell uniformly instead of as a hero-only exception.)
- **Spacing:** 4px base scale. Section rhythm: `py-14 md:py-20`. Card padding 20px; popover padding 12px; gaps 16–24px.
- **Grid columns:** cards 1/2/3 (mobile/tablet/desktop); trip ideas: showcase carousel, not a grid (Amendment A — file 04 §4); state tiles 2/3/4/6 (…/lg/xl); deity tiles 2/2/3.
- **Radius:** `card` 20px (cards, popovers, panels, images); `xl` 12px (menus, inputs); `full` (buttons, chips, pills, dots).
- **Shadows (plum-tinted):** `sm` 0 1 2 / 6% · `md` 0 2 10 / 8% · `lg` 0 8 28 / 10% · `xl` 0 18 48 / 14%.
- **Breakpoints:** Tailwind defaults; semantics: `sm` 640 layout relaxes, `md` 768 two-column starts, `lg` 1024 desktop nav + Explore two-pane + section index, `xl` 1280 max density.

**Z-index scale (canonical — nothing outside this list):**

| z | Layer |
|---|---|
| 0 | page |
| 10 | in-card overlays (badges, scrims) |
| 20 | sticky in-page elements (quick-facts bar, section index) |
| 30 | back-to-top |
| 40 | anchored popovers (state tiles, filters) |
| 50 | sticky header + its dropdowns |
| 60 | mobile nav sheet / bottom sheet |
| 70 | search overlay |
| 80 | lightbox |
| 90 | toasts |
| 100 | skip-link (focused) |

## 5. Elevation & hover doctrine (D17, HTML half)

Elevation = shadow + lift, and it belongs to **HTML surfaces only** (SVG map states change fill/stroke, never shadow/transform — file 07).

| Surface | Rest | Hover (pointer devices) | Notes |
|---|---|---|---|
| Media cards (temple, trip idea) | `border-line` + `shadow-sm` | `shadow-md`, translateY(−6px), border→`magenta/40`, image scale 1.03–1.04 | 300–500ms `threshold` ease |
| Tiles (state, deity, "see all") | `border-line` + `shadow-sm` | `shadow-md`, translateY(−4px), border→`magenta/40` | popover-bearing tiles keep −4px |
| Popovers/menus | `shadow-lg`, `border-line` | — (static) | |
| Buttons | per §6 | brightness/color shift only — **no lift** | |
| Chips/pills | flat | background/border shift only | |

Hover states are enhancements: every hover affordance has a focus-visible equivalent (global 2px magenta outline, 2px offset) and a non-hover path. Touch devices get active-state color feedback only (no lift).

## 6. Components

### 6.1 Buttons
Pill (`rounded-full`), Inter 600, `active:scale-[0.98]`, disabled 50% + no pointer. Sizes: sm h-36px/px-16/text-14 · md h-44px/px-24/text-15 · lg h-52px/px-32/text-16 (all ≥44px targets at md+).

| Variant | Fill | Text | Hover |
|---|---|---|---|
| primary | gradient magenta→coral-deep | white | brightness-95 + shadow-lg (darken, never lighten) |
| secondary | canvas + border line-strong | plum | border+text→magenta |
| tertiary/ghost | none | magenta-deep | bg magenta-soft |
| warm | saffron | plum | saffron-deep + white |
| destructive | danger | white | brightness-95 |

### 6.2 Cards (five types; shared laws: whole card is one link/button, no nested anchors, fixed aspect boxes → zero CLS, `TempleScene` fallback)
- **TempleCard:** 16:9 image (morph source, `view-transition-name: temple-{id}`), region badge + rating pill on white/85 blur chips (top corners), H3 title (Bricolage 20px plum), magenta map-pin meta, 2-line tagline clamp, ≤2 tags + "from ₹X" mono.
- **TripIdeaCard:** 16:9 image, H3, description, mono magenta-deep meta line ("6 temples · 7 days · ~800 km" — editorial, not derived), "Explore →".
- **StateTile:** region-tinted gopuram chip (40px, `{pigment}14` bg), state name (Bricolage 16px), derived count mono; opens popover (§6.4).
- **DeityTile:** deity-accent icon chip (48px), name (Bricolage 20px), derived count or "Explore →" when zero.
- **HeroSlide:** photo stage card; plum scrim `from-plum/85 via-plum/35 to-transparent` bottom ⅔; white H2 + location; white/95 pill CTA; rating with turmeric star; region badge chip.

### 6.3 Chips & pills
- **Tag:** magenta-soft bg, magenta-deep text, 12px medium, `rounded-full px-3 py-1`.
- **Popular-search chip:** turmeric-soft bg, plum text, 14px; hover → magenta-soft + magenta border.
- **Active-filter chip:** canvas bg, line-strong border, ink text + "×" button (its own focusable control, ≥44px hit).
- **Region badge:** 8px pigment dot + mono label (ink-muted; white/90 on photos).
- **Rating:** turmeric-filled star + mono value; `aria-label="Rated X out of 5"`. No rating renders when the field is absent (Tier 3).

### 6.4 Popovers & menus (D19)
Explore filter popovers use **Radix Popover** (typeahead state filter uses Radix Popover + listbox pattern; confirm-dismiss sheets use Radix Dialog). Panel: canvas, `rounded-card`, `shadow-lg`, `border-line`, p-12px, max-w 288px, collision-aware (`collisionPadding: 16`). Behavior contract (applies to hand-rolled ones until they migrate): focus moves in on open; Tab trapped; Esc closes and restores trigger focus; outside pointer closes; `aria-haspopup`/`aria-expanded`/`aria-controls` wired. Menu items: 14px, `rounded-lg`, hover/focus bg magenta-soft.

### 6.5 Forms (UI-only in prototype)
Inputs: canvas bg, `border-line-strong`, `rounded-xl`, h-44px, px-14px, 16px text (prevents iOS zoom), placeholder ink-muted (never ink-subtle), focus ring global. Labels: Inter 500 14px, always visible (no placeholder-as-label). The prototype notice ("This form is a prototype — submissions aren't sent.") renders inline on submit in `info-soft` with `role="status"` — never a success toast.

### 6.6 Search bar & overlay — tokens here, behavior in file 10 §6. Bar: `rounded-full`, search icon left, clear × right when non-empty. Overlay: z-70; desktop 480px anchored panel; mobile full-width sheet at half snap.

### 6.7 Lightbox (file 06 §9 for behavior)
z-80, backdrop `plum/92` + blur-sm, image in `rounded-card` box, white controls (44px round buttons, `border-white/25`), mono counter, caption + **attribution line** (D14: author · license link — required once attribution data exists).

### 6.8 Bottom sheet (map mode, file 05 §6)
Framer Motion drag; snap points peek (56px handle+title) / half (50vh) / full (calc(100vh−header)); grabber 32×4px `line-strong`; focus trapped at half/full; Esc closes; `aria-modal` dialog; reduced-motion → no drag, fade between states, buttons to switch snap.

### 6.9 Pagination
`‹ 1 2 3 … N ›` real links (crawlable), mono 14px; current page magenta fill + white text + `aria-current="page"`; 44px targets; truncation keeps first/last/current±1. **Page size: 24** (constant across breakpoints — URL determinism).

### 6.10 Empty states
Centered, max-w 480px, 48px icon in magenta on `magenta-soft` circle, Bricolage 24px title, 16px ink-muted reason, one CTA (real button). Copy templates in file 05 §7. Always `role="status"`.

### 6.11 Imagery & ornament
- Photography: `next/image`, fixed aspect boxes, blur-up shimmer (porcelain tones), single `priority` per page (hero), Wikimedia served unoptimized until the CDN pipeline (file 11 §5).
- `TempleScene` (procedural daytime SVG, region-tinted, seeded/deterministic) is the universal fallback — kept in sync with this palette.
- `KolamMotif` line geometry: decorative only, ≤10% opacity strokes, max one per viewport; `GopuramMark` is the logomark; `deity-icons` are the six hand-built strokes.
- Photo scrims: plum gradients only (never black).

## 7. Iconography
Lucide at 16/20/24px, stroke 2, `aria-hidden` + text label (or `aria-label` on icon-only buttons ≥44px). Brand SVGs (gopuram, kolam, deity set, region icon paths in `lib/regions.ts`) use `currentColor`. No emoji in UI chrome; ✈/🚆/🚗 in how-to-reach cards are replaced with lucide equivalents (Plane/TrainFront/Car) at Phase 5.

## 8. Accessibility floor (restated as component defaults)
Global focus-visible ring (2px magenta, 2px offset) on every focusable; skip-link first-focusable; landmarks (`header/nav/main/footer`, labeled `nav`s); form controls labeled; live regions for async results (`aria-live="polite"`) and errors (`role="alert"`); 44×44 targets; 200% zoom no horizontal scroll; every animation has its reduced-motion behavior defined in file 08.

## 9. Acceptance criteria
- Every color/text pairing shipped appears in §2.2 or is derivable from its rules; nothing below 4.5:1 for informational text (3:1 large text) anywhere.
- No component renders `temple-red`/`sand-yellow`/`warm-gold` class names in new code; post-cutover CI grep returns zero.
- Every z-index in the codebase is a value from §4's table.
- axe-core: zero violations on `/`, `/explore`, one temple page.

## 10. Anti-patterns
- White text on magenta below 14px semibold; white on coral/saffron ever; ink-subtle for information.
- Dynamic Tailwind class construction for deity/region colors (purge hazard — use inline hex).
- Lifting buttons/chips on hover; shadows or transforms on SVG map polygons; new shadows/z-values outside the scales.
- Introducing a second display or body font, or using Telugu for anything but the hero flourish.

## 11. What Sonnet does next
Phase 3 (file 13): build the Explore filter components against §6.1/6.3/6.4/6.9/6.10 exactly; adopt Radix per D19; apply the §2.2 eyebrow/small-text correction (magenta-deep) across chrome touched in the phase; add the z-index scale as named constants if any new layered element is introduced.
