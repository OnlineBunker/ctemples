# 15 — Redesign v2: "The Threshold" (Doorway, disciplined)

> **Status: ADOPTED 2026-07-27, branch `redesign-v2`.** Direction chosen by the
> product owner from three explored options (Threshold / Living Atlas / Field Guide).
> This file records the *binding* decisions and the amendments to `docs/01–14` that this
> redesign requires. Per `docs/14 §3` and `CLAUDE.md` ("unwritten decisions don't exist"),
> these are written here **before** implementation. Where this file amends a canonical
> file, **this file wins for redesign-v2 work**; everything not mentioned is preserved
> exactly. This is a visual + interaction remake — **not** a data-layer, IA, or
> motion-law rewrite.

## 0b. CINEMATIC-MOTION AMENDMENT (owner directive, 2026-07-28 — supersedes §0a's "Motion still bounded" bullet, §2J, and the motion lines of §3)

The product owner reviewed the shipped Threshold homepage and directed that the prototype's
**cinematic motion be restored on the homepage** — reversing this file's earlier decision to
build it "to read identically at rest." This is written into `docs/08` as **Amendment B**
(§5#6–10) and is binding. Restored, **homepage only**, each with its reduced-motion off-switch:

- **Hero scroll-parallax** — the rAF rig: arch portal zooms + drops, orbit ring scales + fades,
  sky/mountain/silhouette/mist layers translate at differing rates, the headline splits apart
  and fades as the hero scrolls out (docs/08 §5#6).
- **Drifting birds** — two faint SVG gulls crossing the sky (docs/08 §5#7).
- **Per-slide sky shift** — the hero's warm glow/tint crossfades a subtle new hue on each slide
  change (docs/08 §5#8) — an enhancement beyond the prototype, which the owner asked for
  ("the background changing a bit when the temple is changing").
- **Index cursor-follow preview card** — a floating arch thumbnail of the hovered temple trails
  the pointer over "Choose a doorway" (docs/08 §5#9).
- **Finale marquee** — the outlined name frieze scrolls as a seamless loop (docs/08 §5#10).
- **Living-hero drift** — the arch photo breathes a slow ken-burns zoom at rest (docs/08 §5#11).

**Unchanged:** the two-layer reduced-motion contract is absolute — every effect above is OFF
under `prefers-reduced-motion` (and Save-Data / coarse pointer where noted), so the calm static
Threshold is preserved for those users. The cinematic motion is confined to `components/home/*`;
chrome and every other route stay as specified. The In Focus feature is no longer Meenakshi
(its hero image, an overcast aerial cityscape, is replaced by the iconic gopuram shot already in
its media set; the featured temple becomes Konark Sun Temple).

## 0a. FIDELITY AMENDMENT (owner directive, 2026-07-27 — supersedes conflicting lines below)

The product owner reviewed the first Threshold build and directed: **match the handoff
prototype's visual design closely** (`prototypes/design_handoff_ctemples_redesign/`), not a
tamed evolution of it. Binding consequences:

- **Homepage = the prototype's composition**: dark cinematic Threshold hero (plum sky
  gradient, light rays, mountain + gopuram silhouettes, mist, arch portal with ghost-tower
  break-out and gold orbit ring, "Where the gods / still live." headline, cream dome exit)
  → 01 THE INDEX (oversized type list) → 02 FOUR DIRECTIONS (expanding arch columns) →
  03 IN FOCUS (beige editorial split) → Finale (outlined names strip + "Every temple is a
  door."). The previous light split-hero + trip-ideas/state-strip/deity-tiles homepage is
  replaced (those components remain in the tree for other surfaces).
- **Chrome = the prototype's**: mono uppercase nav EXPLORE/ABOUT/METHODOLOGY/SUGGEST +
  SEARCH pill + PARTNER pill (→ /contact); home header fixed transparent → plum blur on
  scroll; mobile menu = full-screen plum takeover with numbered links; search overlay =
  full-screen plum takeover ("SEARCH THE ATLAS", giant Bricolage input, POPULAR chips,
  numbered thumb rows). Footer = prototype site-footer (+ States/Deities links, + DataMeet
  attribution kept). The language dropdown/banner is unmounted (prototype has none).
- **Explore = "The atlas."** with `NN / NN DOORWAYS` count, underline search, chip-styled
  filters, 4:5 arch-top cards (centered region pill), gopuram "No doorways match." empty
  state. The URL/filter/search contracts (docs/05, docs/10) are unchanged underneath.
- **Temple = prototype layout**: ← THE ATLAS breadcrumb + crumb line, split hero (tags /
  H1 / tagline / deity·★ left, 3:4 arch portrait + gold ring right = the morph target),
  beige quick-facts panel, dark "Through the doorway" gallery band, beige "More doorways"
  related band, ink prev/next bar. Section engine (D13) unchanged underneath.
- **Motion** *(superseded by §0b, 2026-07-28 — the "NOT ported" clause below is reversed)*:
  the prototype's rAF scroll-parallax, cursor-follow float, drifting birds, and animated
  marquee ~~are NOT ported (docs/08); the composition is built to read identically at rest~~
  **are now ported on the homepage per docs/08 Amendment B (§0b), each disabled under reduced
  motion so the resting composition is preserved for those users**. Hero slideshow = sanctioned
  crossfade autoplay (7s dwell, pause control, reduced-motion/Save-Data safe). The 1px scroll-cue
  line animation is admitted as a standard affordance (killed under reduced motion). Machine
  counts may use the prototype's "DOORWAYS" unit, but always data-derived — never hardcoded.

## 0b. EXPLORE BEHAVIOUR AMENDMENT (owner directive, 2026-07-30)

Five behavioural corrections to Explore. All are **binding**; each keeps the existing
server-side query contract (docs/05, docs/10) — no client-side filtering or sorting was added.

1. **List and map never share filters.** `?state=` is both the map's selection and the list's
   state facet, so carrying params across modes meant picking a state on the map silently
   pre-filtered the list. `buildViewHref()` (`lib/explore-url.ts`) now starts a fresh browse on
   every mode switch: `q`/`exact`/`state`/`deity`/`tag`/`sort`/`page` are all dropped. Only the
   visitor's coordinates survive — see (2), a personalisation rather than a filter.
2. **Real "nearest me" ordering.** New `?near=<lat>,<lng>` param (`LatLng`, written at 3dp
   ≈110 m so a shared URL can't pinpoint a home) plus a `nearest` `SortKey`. `runExploreQuery`
   orders by true Haversine distance (distances precomputed into a map, not recomputed inside
   the comparator); `TempleSummary.distanceKm` carries the value so each card states "N km
   away". `nearest` without coordinates is unsatisfiable and coerces back to `rating` on both
   the parse and build side. A search query still wins over sort (existing relevance law).
3. **The manual state picker is gone.** `YourStatePill` ("Pick your state for local results")
   duplicated the State facet and only ever approximated proximity. Replaced by
   `NearbyLocator`, which uses the Geolocation API: a cached fix (7 days) or an
   already-granted permission applies automatically via `router.replace` (Back still leaves
   Explore); otherwise one labelled control requests it. Auto-apply is skipped over any
   deliberate query/filter/page. If the visitor declines or the device can't report a
   position, **nothing renders** — no dead control, and never a guessed location.
4. **Wishlist.** `lib/wishlist.ts` — a `localStorage`-backed store (`ctemples:saves`, the key
   docs/09 already reserved) shared by every mounted heart via `useSyncExternalStore`, synced
   across tabs by the `storage` event. Saves are client-only, so the store stays un-hydrated
   until the first post-mount effect: reading storage during the first client render would
   contradict the server HTML (React #418). `WishlistButton` renders **beneath** the card as a
   sibling of its link — a `<button>` inside an `<a>` is invalid and breaks both controls.
5. **Cursor-repel card hover.** `CardRepel` drifts a card a few px *away* from the pointer
   (rAF lerp, capped at 10 px, listeners dropped once settled). **2D `translate` only** — a 3D
   transform on an ancestor of a `view-transition-name` element corrupts the morph snapshot
   (docs/03 §5). Fine pointers only; fully inert under `prefers-reduced-motion`.

## 0c. EXPLORE FOLLOW-UP FIXES (owner report, 2026-07-30)

1. **"Turn off" for nearest-me now sticks.** Two bugs: the auto-apply effect read the cached
   fix *before* the opt-out flag (so turning it off was instantly reversed), and any
   filter-free URL counted as a "clean browse" (so hand-picking *Top rated* was overridden on
   the next render). Fixed by ordering the guards — `current.near` present means the visitor has
   already been located and has since chosen an ordering, so auto-apply bails — and by splitting
   the single flag into `ctemples:geo-denied` (device can't report a position → render nothing)
   and `ctemples:geo-off` (visitor switched it off → stay quiet but keep offering it, so it can
   be re-enabled). Turning it on always clears the opt-out.
2. **Map selection preserves scroll.** The App Router scrolls to the top of the document on
   every navigation, so picking a state threw you back to the page header. Selecting a state
   changes the results beside the map — not the page — so both `handleSelectState`
   (`explore-map-view.tsx`) and the "Jump to state" select now pass `{ scroll: false }`.
3. **Small states are reliably clickable.** `CALLOUT_STATE_SLUGS` is generated with an
   `area < 122` threshold derived from "44px²", but WCAG 2.5.8's target is 44×44 px
   (≈5400 viewBox-unit²) — so only four near-invisible UTs qualified and **Delhi (158), Goa
   (356), Sikkim (768) and Tripura (1089) got nothing**. Both thresholds are now applied in
   `india-map.tsx` from the exported `area` field (the generated artifact is not hand-edited):
   `MARKER_AREA` (220) also draws a **visible disc**, and `EASY_TARGET_AREA` (1200) adds an
   enlarged invisible hit circle rendered in a layer **above every polygon**, so a tiny state
   always wins a click where it overlaps a large neighbour. Delhi's effective target went from
   a ~35 px sliver to a 26-unit circle (verified: 6/6 sample points ±14 px hit Delhi).
   Additionally, hovering or focusing a small state opens a **magnifier lens** — a clipped
   circle drawing its own 4.5× copy of the geometry, so you can see what you're aiming at.
   The lens is decorative (`pointer-events: none`) and **no polygon is ever transformed**, so
   D17 and the "no zoom/pan GIS map" rule both hold.

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
- **J · Motion.** ~~**No motion-law expansion.**~~ *(Superseded by §0b / docs/08 Amendment B,
  2026-07-28.)* The homepage now carries the prototype's cinematic motion — hero scroll-parallax,
  drifting birds, per-slide sky shift, the Index cursor-follow preview card, and the Finale
  marquee — each confined to `components/home/*` and each disabled under reduced motion. Off the
  homepage the cinema still comes from shape + light + the one morph; the expansion does not
  travel. (Optional future: a one-shot draw on the portal gilt-inset stroke — a 4th
  micro-interaction under D22; not shipped by default.)

## 3. Anti-patterns explicitly rejected

*(2026-07-28, §0b: the homepage-motion items below are no longer rejected — the rAF parallax
kit, ghost tower, scaling orbit ring, conic god-rays, drifting birds, scroll cue, foreground
mist, split-and-skew headline, the cursor-follow floating card, and the Finale marquee are now
sanctioned on the homepage per docs/08 Amendment B, each off under reduced motion. Everything
else in this list stands.)*

Off the homepage: the dark cinematic parallax kit, cursor-follow floating cards, marquees, and
any infinite loop. Everywhere, still rejected: tilt-on-hover, parallax **depth stacks** and
scroll-jacked camera moves (the sanctioned hero parallax is flat 2D transform/opacity, not a
depth rig), particles; the quick-view modal + random "next"; the "Four Directions" accordion
reduced to only 4 of 6 regions; outlined mega-numerals anywhere except the single 404 + one
About stat band; "DOORWAYS"/any hardcoded count as a machine unit (metaphor lives in prose;
counts are data-derived "temples"); floating white pills on cards; the arch on everything.

## 4. Build order & gate

Foundation (tokens · globals · `ThresholdDivider` · unified `Card` · base primitives) →
chrome (header/nav · search overlay · footer) → **Home** → **Explore** (list + map) →
**Temple detail** → **State pages** → **Deity pages** → resilience (`error.tsx`,
`loading.tsx`) → adversarial review. **Green gate after each page:**
`typecheck && test && lint && build`, then browser-verify desktop + 375px + keyboard.
Additive tokens keep un-migrated surfaces compiling throughout the transition.
