# 15 — Redesign v2: "The Threshold" (Doorway, disciplined)

> **Status: ADOPTED 2026-07-27, branch `redesign-v2`.** Direction chosen by the
> product owner from three explored options (Threshold / Living Atlas / Field Guide).
> This file records the *binding* decisions and the amendments to `docs/01–14` that this
> redesign requires. Per `docs/14 §3` and `CLAUDE.md` ("unwritten decisions don't exist"),
> these are written here **before** implementation. Where this file amends a canonical
> file, **this file wins for redesign-v2 work**; everything not mentioned is preserved
> exactly. This is a visual + interaction remake — **not** a data-layer, IA, or
> motion-law rewrite.

## 0. Soul

In temple architecture the arch is not ornament — it is the *dvara*, the doorway that
marks the passage from the ordinary world to the sacred one, and it is *load-bearing*.
The Threshold makes that one idea the product's **structural grammar**: the arch **frames**
(imagery you can enter), it **paces** (arched crests between section-bands), and it
**carries you across** (the card→temple View-Transition morph reads as *stepping through
the doorway*). The discipline is the point — the arch appears only where a genuine
threshold exists, never as decoration on chrome or controls. Cinematic the way a building
is cinematic: through framing, proportion and light, **beautiful standing perfectly still**.
"Modern Utsavam" is kept exactly.

## 1. LOCKED — unchanged by this redesign

Palette; logo; the four typefaces; the data seam (`lib/temples.ts`, `TempleSummary`,
`queryTemples`); the 18-section detail engine (`lib/detail-sections`, D13); the search
engine (server-only, `getSearchSuggestions`, D21 ⌘K); the India-map system (D17 fill/stroke
matrix, attribution); the native View-Transition morph; the hero six-point autoplay law;
the Reveal/Stagger placement restraint; the two-layer reduced-motion contract; every
URL round-trip / list-default-Explore law; and decision register D1–D27 **except** where
amended in §2. No new runtime deps beyond the already-sanctioned Radix (D19). No WebGL/3D (D3).

## 2. Amendments (binding — write into the token layer + spec before/with each surface)

- **A · Shape language — arch radius tiers.** Replace the single `card` radius with:
  `rounded-portal` `999px 999px 1.25rem 1.25rem` (portrait imagery you enter — hero
  photo-stage, state/deity portraits, trip feature cards, gallery items, search thumbnails,
  empty-state glyph); `rounded-arch` (lintel) `2.25rem 2.25rem 1rem 1rem` (landscape imagery
  that **morphs** — the unified card **and** the temple hero: identical token both ends keeps
  the morph valid); `rounded-arch-sm` `1.25rem 1.25rem 0.5rem 0.5rem` (small thumbnails).
  **Enforcement rule:** the arch is used *only* on imagery-you-enter and passages between
  sections — **never** on chrome, panels, controls, or text (those stay rectilinear / pill).
- **B · Section-band surfaces + threshold divider.** Five surfaces, all from **locked colors**:
  `surface-canvas` porcelain `#FBF6F0`, `surface-recess` porcelain-deep `#F4EADF`
  (**reconciles the prototype's stray `#EFE6DA` → the existing token, no new value**),
  `surface-sanctum` plum `#3D0A40`, `surface-deep` ink `#241021` (rarest — gallery band, 404),
  `surface-utsavam` the locked gradient (decorative panels only, never behind body text).
  `ThresholdDivider`: a static, same-color-as-next-band arched crest
  (`border-radius: 100% 100% 0 0`, `clamp(32px,5vh,72px)`) — pure CSS, zero motion.
- **C · Semantic type scale (fonts locked).** Keep the fluid display scale and **use
  `display-xl` on page-thesis H1s** (home + Explore currently under-render at `display-lg`).
  Add `title-lg`/`title-md` (Bricolage card titles, permitted by D23). Add a body scale
  `body-lg`/`body`/`body-sm`/`body-xs` and a `label`/`label-sm` label scale — **all small
  brand-colored text uses magenta-deep `#B80057`** (fixes the tracked sub-AA eyebrow).
  Formalize the **`NN —` numbered kicker** (data-driven) as the field-guide index voice.
  Telugu flourish upsized to a confident hero second line (`lang="te"`, hero only).
- **D · Rhythm.** Section-rhythm tokens (`section-y` = `py-16 md:py-24`; a tight variant);
  add the missing small `input`/`chip` radius. Keep the 4px base + `max-w-[1440px]` shell.
- **E · Warm functional colors.** Re-derive success/warning/info/danger as warm-toned so an
  error never reads as cool Material green/red inside the porcelain-plum world.
- **F · One unified Card.** Merge `ResultCard` / `TempleCard` / `ResultCardCompact` into a
  single component on a normalized view-model. A `rounded-arch` lintel image on a solid
  **plinth** (porcelain base) carrying region · rating · Bricolage name (→ magenta on hover)
  · Space-Mono location · tags. **Kills the floating white backdrop-blur pills** (the
  travel-booking tell). Whole card one link, no nested anchors, `TempleScene` fallback,
  `temple-{id}` morph, tamed 2–4% hover zoom + lift.
- **G · New routes (D26 surfaces).** `/states`, `/states/[slug]`, `/deities`, `/deities/[key]`.
  Thin-landing guard (below ≥1 tier-1 + ≥10 records → degrade to a "documented soon +
  suggest" funnel with state pre-filled). `noindex` until the P11 index flip.
- **H · Media schema (D14).** `MediaItem` gains `attribution` + `width`/`height`. Staged:
  add optional → backfill the 15 records → make required in `lib/validate.ts`. Surfaced in
  the gallery lightbox + hero. Non-blocking for the visual remake.
- **I · Favicon.** Reconcile `app/icon.svg` off-palette `#C62828`/`#B8860B` → the locked
  magenta gopuram mark used everywhere else.
- **J · Motion.** **No motion-law expansion.** The cinema comes from shape + light + the one
  morph. (Optional future: a one-shot draw on the portal gilt-inset stroke — a 4th
  micro-interaction under D22; not shipped by default.)

## 3. Anti-patterns explicitly rejected

The dark cinematic parallax portal and its whole kit (multi-layer rAF loop, ghost tower,
scaling orbit ring, conic god-rays, drifting birds, scroll cue, foreground mist,
split-and-skew headline); cursor-follow floating cards, tilt-on-hover, parallax depth,
particles, marquees, any infinite loop; the homepage all-records "Index" list and the
quick-view modal + random "next"; the "Four Directions" accordion (only 4 of 6 regions);
outlined mega-numerals anywhere except the single 404 + one About stat band; "DOORWAYS"/
any hardcoded count as a machine unit (metaphor lives in prose; counts are data-derived
"temples"); floating white pills on cards; the arch on everything.

## 4. Build order & gate

Foundation (tokens · globals · `ThresholdDivider` · unified `Card` · base primitives) →
chrome (header/nav · search overlay · footer) → **Home** → **Explore** (list + map) →
**Temple detail** → **State pages** → **Deity pages** → resilience (`error.tsx`,
`loading.tsx`) → adversarial review. **Green gate after each page:**
`typecheck && test && lint && build`, then browser-verify desktop + 375px + keyboard.
Additive tokens keep un-migrated surfaces compiling throughout the transition.
