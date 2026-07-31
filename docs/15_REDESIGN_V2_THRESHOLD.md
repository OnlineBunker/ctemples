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

## 0d. PARTNER → WISHLIST (owner directive, 2026-07-30)

**`/contact` ("Partner with us") is retired and replaced by `/wishlist`.** Amends the docs/02
route map for redesign-v2: temples could be saved from any card, but there was nowhere to see
them — a dead end. A partnership enquiry form, by contrast, is a Stage-B/business surface with
no backend behind it in this prototype, so it was the right thing to trade away.

- **Deleted:** `app/contact/`, `components/contact/contact-form.tsx`, and the already-unmounted
  `components/home/language-banner.tsx` (dead since the chrome port, and the last `/contact`
  referrer). Footer *Contribute*, the mobile menu, and the `/about` secondary CTA now point at
  the wishlist / suggest instead. The header's PARTNER pill becomes `WishlistLink` — a heart
  with a live saved count, so the page is discoverable the moment anything is saved.
- **Data path:** saves live in `localStorage`, so the grid must be a client component — but it
  must not therefore ship the dataset down to filter locally (docs/11 §3). `getWishlistTemples`
  (a server action over the new `getTempleSummariesByIds` seam function) returns *only* the
  saved ids' card-weight summaries, in the given order, skipping ids whose record no longer
  exists and capped at 200 so a tampered-with storage value can't request an unbounded
  projection. Fetched records are cached client-side by id, so un-saving removes a card with no
  server round-trip.
- **Design:** the page reads as another room in the same building — Explore's page padding, a
  Bricolage `Your doorways.` H1 with a Space Mono `NN SAVED` readout opposite, the same
  arch-card grid, newest save first. Empty state is the atlas pattern (gopuram glyph, "No
  doorways saved yet.", an ink `BROWSE THE ATLAS` pill). "Clear wishlist" is a two-step
  confirm so a whole shortlist can't be lost to one stray click.
- **Bug fixed en route:** the store skipped its post-mount notification when nothing was saved,
  but consumers derive `ready` from that same flag — so a first visit with an empty wishlist sat
  on "Opening your doorways…" forever instead of showing the empty state. `hydrate()` now
  always emits.

## 0e. TEMPLE-PAGE FIXES (owner report, 2026-07-30)

**One root cause explained five of the seven reports.** The section column was declared
`lg:grid-cols-[1fr_220px]`. A bare `1fr` is `minmax(auto,1fr)`, so the track's *minimum* is its
content's min-content width — the gallery rail and cost table forced the column to **2720px at a
1280px viewport**. Everything downstream followed: the locator map stretched to 1275px tall, the
`within-100km` (2569px) and `same-deity` cards were magnified past the viewport, `how-to-reach`
and `nearby` cards ran off-screen, and the gallery rail never scrolled because its clientWidth
(2720) already equalled its scrollWidth. The excess was unreachable because `html`/`body` clip
horizontal overflow (§0a's hero bleed fix), so it read as "horizontal scroll is locked".

Fixed with `lg:grid-cols-[minmax(0,1fr)_220px]`. Measured after: sections 2720 → **900px**, map
1275 → **475px** tall, within-100km → 1076px, same-deity → 538px, gallery rail genuinely
scrollable (scrollWidth 2720 > clientWidth 900). The locator map additionally takes a
`max-h-[380px]` cap so a wide column can never turn it into a full-screen graphic again, and its
inner grid uses `minmax(0,…)` tracks for the same reason.

Also in this pass:
- **Hero is a stack of three photographs** (`hero-photo-stack.tsx`). At rest the two supporting
  stills sit behind the main one, rotated and offset so ~half of each peeks out, veiled so the
  main plate stays dominant; on hover/focus-within they fan outward and the veil lifts. A
  scroll-linked drift (rAF, passive, transform-only) gives the group life. **The front plate is
  the morph target and is never transformed** — only the two behind move, and every transform is
  2D, so the card→hero View Transition stays valid (docs/03 §5). The fan is sized to stay inside
  the column (front plate 78% wide + 6% inline padding), verified no overflow at 1280/1024/375
  even while fanned. Back plates are `aria-hidden`; the front carries the alt.
- **Reading progress bar** (`reading-progress.tsx`) — a 3px magenta/coral rule at the top of the
  viewport. Deliberately *not* reduced-motion-gated (it is information, not decoration) and
  deliberately un-transitioned, so it tracks scroll exactly. Verified 0% → 44.7% → 100%.
- **Share now confirms itself.** It previously copied with only an `sr-only` message and a small
  toast nested in the action row, which was easy to miss. The confirmation is a portalled,
  viewport-fixed plum pill ("Link copied to clipboard") that no ancestor can clip.
- **The hero's Save heart is real.** It was local `useState` — it forgot the temple instantly and
  never reached `/wishlist`. Now on the shared wishlist store. The action row was also still
  styled for a dark photo overlay; restyled for the light split hero.
- **Quick-facts values no longer truncate.** `truncate` clipped the actual facts ("Completed
  around 1…" hid the century); they now wrap with `break-words`.

## 0h. CARD MOTION + MAP SCROLL (owner report, 2026-07-31)

**Owner directive:** *"make sure the temple card motion is minimal because right now its hard to save
a temple directly from the explore page, and also the map is buggy, when I scroll down and select a
state it takes me to the top of the page again, the same problem as before."*

**1. `CardRepel` amplitude cut, and it now holds still over controls.** `strength` 0.06 → **0.028**,
`max` 10px → **4px**. The bigger problem was not the amount but the direction: the card drifts *away*
from the pointer, and the wishlist heart is a child of the drifting wrapper, so aiming at the heart
pushed it away — a retreating target. Anything marked `data-repel-freeze` now parks the drift at rest
while the pointer is on it. Measured: card drift **4.1px** crossing the body, **0.0px** once the
pointer is on the heart. The heart's hit area was also genuinely too small for a primary action
(~13px icon plus a sliver of padding); a negative-margin bleed brings it to the WCAG 2.5.8 44px floor
with no visual change — now **64×44** desktop, **72×44** mobile. Verified end to end at both
viewports: `aria-pressed false → true`, `localStorage ctemples:saves = ["brihadeeswarar-temple"]`, and
the page does not navigate (the heart is a sibling of the card link, never nested).

**2. The map scroll reset was `app/explore/loading.tsx`, and `scroll: false` could not fix it.**
`/explore` is a dynamic route, so a searchParams change re-suspends the segment; rendering that
route-level Suspense fallback scrolls to top regardless of the router flag. Measured, clicking a
state from scrollY 700:

| configuration | resulting scrollY |
|---|---|
| `loading.tsx` present, `scroll: false` | **0** (bug) |
| `loading.tsx` present, `scroll: false` + `startTransition` | **0** (bug — the transition did NOT help) |
| `loading.tsx` removed, `scroll: false` | **700** (correct) |

The middle row matters: marking the navigation as a transition was the obvious fix and it measurably
did not work, so the comment in `explore-map-view.tsx` records the disproof rather than the guess.
**`app/explore/loading.tsx` is therefore deliberately absent — do not reintroduce a route-level
loading skeleton for `/explore` without re-testing state selection.** It trades a cold-entry nicety
for a scroll reset on every state click. The `startTransition` wrapper is kept (both the SVG map and
the "Jump to state" select) because it keeps the current results interactive while new ones stream,
not because it affects scroll.

**Regression history:** docs/15 §0c fixed this once; the §0f audit added `loading.tsx` (commit
`a9a79b6`) and silently reintroduced it, which is why the owner reported it as "the same problem as
before". Both reports were correct.

Gate: typecheck · 305 tests · lint · `lint:tokens` · build 71/71 · axe **0 violations** across 26
page runs · hero-drift + 6 birds + cue `running`, marquee `paused` off-screen → `running` when
scrolled to.

## 0g. IMAGE-OPTIMIZER REGRESSION — the audit broke the site (owner report, 2026-07-31)

**BINDING RULE: hotlinked Wikimedia sources are served `unoptimized`. Do not route them through
the Next image optimizer. This decision has now been made, reversed, and re-made once — treat any
future "let's optimize the Wikimedia images" proposal as already-answered unless the sources have
first been self-hosted or the URLs pre-sized.**

The §0f audit's `perf(images)` pass (358681f) stripped `unoptimized` from all five hotlinked call
sites (`photo-with-fallback.tsx`, `threshold-hero.tsx`, `index-list.tsx`, `in-focus.tsx`,
`four-directions.tsx`). Owner report: *"the site is loading in minutes instead of seconds, the maps
is not working, the scroll animations are buggy, the temple cards don't have that opposing effect
anymore."* **One root cause, four symptoms** — page JS waits on the main thread, so a starved
hydration presents as dead hover, a dead map, and janky scroll, not as "slow images".

**Why the audit's measurement was wrong.** It reported homepage images 4.33MB → 0.28MB and mobile
LCP 19.4s → 1.5s. Both numbers were real and both measured the wrong thing: they were taken against
a **warm** optimizer cache. Measured per image:

| request | status | time | bytes |
|---|---|---|---|
| cold (first) | 200 | **1.989 s** | 5,843 B |
| warm (second) | 200 | **0.0018 s** | 5,843 B |

A **1,100×** gap. Optimizing a *remote* image means Next fetches the full original from Wikimedia
and AVIF-encodes it, per width, on demand — CPU-seconds each. Against ~20 images and the
optimizer's limited transcode concurrency, first paint becomes minutes. The cost is **not** paid
once: the cache lives under `.next`, so every rebuild and deploy discards it.

**Two independent confirmations that the bypass is correct, gathered while fixing this:**

1. **Wikimedia rate-limits hard.** Probing thumbnail widths at 12-way parallelism from one IP
   returned **HTTP 429** after ~30 requests. A server-side optimizer is exactly that access
   pattern — one IP fetching every image — so it would 429 in production. This is the original
   "deliberate rate-limit-avoidance decision" in `PROJECT_CONTEXT.md`, empirically re-derived.
2. **Wikimedia serves only an allowlisted set of widths, and the set varies per file.** Verified:
   `/thumb/.../<N>px-` returns **400 "Use thumbnail sizes listed on https://w.wiki/GHai"** for
   arbitrary widths. One file allowed `120 / 250 / 330 / 500 / 1280`; another allowed only
   `120 / 500 / 1280`. So the audit's premise ("Wikimedia serves ONE fixed width") was directionally
   right but imprecise — there are a few, not one, and they are not uniform.

**Accepted tradeoff.** Unoptimized costs bandwidth: `/explore` ships ~3.3MB of images. That is worse
than 0.28MB and better than an unusable page, so it stands until the sources change.

**Follow-up (NOT done — do not mark complete without per-URL verification).** Pre-size the *source*
URLs to each file's own allowlist so the browser fetches a small file directly: no proxy, no
transcode, no rate-limit exposure. Indicative wins on the 52×66 index thumbs: 120px = 5KB vs the
current 1280px = 425KB (**85×**); explore cards at 500px = 72KB (**6×**). This was deliberately not
shipped in the fix commit because the allowlist is per-file, verifying all 103 dataset sources needs
slow serial probing to avoid 429, and any unverified miss silently degrades that photo to the
generated `TempleScene` fallback. Restoring a working site took priority over the bytes.

**Also audited: no live animation or effect was lost by §0f.** `animate-kenburns` and
`animate-dot-progress` belonged to the old split hero, which `app/page.tsx` had already stopped
importing *before* the audit (verified against `ada6e1c` — dead code, so deleting it removed nothing
that rendered). All seven surviving files that changed kept their `transition-colors`. Verified live
on the fixed build: card repel `none → translate(6.9px,-0.6px)`, map state-click routes to
`?state=…&view=map`, `animate-hero-drift`/`animate-bird`×6/`animate-cue` all `running`, and the
finale marquee correctly `paused` off-screen then `running` once scrolled to.

**Process notes worth keeping.** (a) A warm-cache measurement is not a performance result — state
the cache state or the number is meaningless. (b) Concurrent `next build` runs corrupt `.next` (it
lost `BUILD_ID` and `static/` mid-session, which produced chunk 400s and a *false* "the JS is
broken" reading); `npm run lint` also clears `BUILD_ID`, so rebuild before `next start`. Both were
harness artifacts, not app bugs, and were nearly reported as app bugs.

## 0f. PRODUCTION-READINESS AUDIT (2026-07-30)

A nine-lens audit (product, design, motion, UX, a11y, perf, security, architecture) run against
the real codebase. What was **fixed and verified** in this pass:

**Security (nothing existed before).** `next.config.mjs` now sets a CSP plus HSTS, `nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy`, and a `Permissions-Policy` that keeps geolocation
(the app uses it) and denies everything else; `poweredByHeader` is off. The CSP's
`script-src 'unsafe-inline'` is a documented, bounded trade (Next's inline RSC bootstrap; the app
has *no* HTML-injection surface — no `dangerouslySetInnerHTML`/`innerHTML`/`eval`, verified) with
the nonce-via-middleware upgrade path recorded. Verified 0 violations across 30 route/viewport
combinations. The image allowlist dropped two never-referenced hosts (each one is an origin the
optimizer can be induced to fetch). Geolocation is now **coarsened to 3dp (~110 m) at the source**
before it reaches storage, the URL, or the server, and `localStorage` is treated as untrusted
input on read.

**Resilience (nothing existed before).** `app/error.tsx` (keeps chrome, offers `reset()`, shows
`digest` not `error.message`), `app/global-error.tsx` (self-contained inline styling, since the
layout that failed is what normally supplies `<html>`/fonts/Tailwind), and `app/explore/loading.tsx`
for the one route rendered on demand — deliberately not a shimmer skeleton (docs/08).

**SEO.** `metadataBase` was the placeholder `ctemples.example`, making every canonical and OG URL
point at a domain nobody owns; it is now env-driven via `lib/site.ts`, alongside an `INDEXABLE`
flag that keeps the spec's prototype-wide `noindex` as the default and makes go-live one
environment variable. Added `sitemap.ts` (derived from the data, empty while noindex) and
`robots.ts`. **A canonical bug was introduced and caught during this pass:** a layout-level
`alternates.canonical` is inherited by every child route, so every page briefly declared itself a
duplicate of `/`. Canonicals are now per route, with all `/explore` facet permutations collapsing
to the bare route (faceted navigation otherwise mints unlimited duplicate URLs).

**Identity + payload.** The `lang="te"` Noto Sans Telugu accent — part of the locked identity —
existed **only in the retired split hero**, so replacing that composition silently dropped the
bilingual accent from the live site while the font still shipped on every route. Restored to the
Threshold hero under the kicker, and the face trimmed to the one weight and one subset that
render: **font payload 495 KB → 382 KB.**

**Dead code.** 17 files were unreachable from every Next entry point (computed as a transitive
closure, not guessed) — the retired homepage composition and the primitives only it fed. Removed.

**Accessibility.** The search combobox advertised `aria-expanded="true"` with an `aria-controls`
IDREF resolving to nothing during the pending window every search passes through (the guard and
the render condition disagreed — now one boolean). Active-filter chips announced as navigation
while actually *removing* a filter (WCAG 2.4.4) — now labelled and grouped. The cost table's
scroll region was keyboard-unreachable, hiding the Mid-range/Luxury bands (WCAG 2.1.1). The hero
photo stack's fan-out was pointer-only — nothing in it was focusable, so keyboard/touch users
could never reach photos 2–3 while the caption told them to "Hover"; it is now a real
`aria-expanded` toggle with mode-neutral copy. Temple pages shipped two `<h1>`s.

**Content integrity.** `/about` hardcoded "28 states" while `/states` derived 36 from the same
registry — two pages contradicting each other on a checkable fact, and exactly the hardcoded
dataset count CLAUDE.md prohibits; all counts are now derived. The methodology page claimed "we
read every submission" while the form sends nothing (D12).

**UX.** Temple entries were a lateral dead end (deity, state and rating were inert text) — the
deity and state are now links, feeding the D26 internal-link graph. Zero-result search hid its
only recovery path exactly when needed; it now offers the popular-search routes. A saved id whose
record disappears no longer inflates the wishlist count forever.

### Second pass — the "known remaining" list, closed

**Accessibility.** Touch targets: the bottom sheet's Collapse/Expand were ~16px-tall text with an
8px gap — and they are the *only* snap control a reduced-motion visitor has, since drag is disabled
for them; the wishlist confirm row and the "Turn off" distance control were ~14px text. All
`min-h-11` now. Search results had `role="option"` on an `<li>` *wrapping* a link, which put an
interactive descendant inside an option and added a tab stop per result — so Tab walked into the
list while `aria-activedescendant` assumed focus never left the input, leaving arrow-selection and
focus on different rows; the option **is** the anchor now (`tabIndex={-1}`), so click/middle-click
survive but the focus model is single. The wishlist clear-confirm replaced the focused button with
two new ones and moved no focus, dumping keyboard users to `<body>` (WCAG 3.2.2 / 4.1.3) — focus
now moves to "Yes, clear" and back on cancel, with the question as a status region. The hero H1's
legibility no longer depends on which photograph loads (a soft ink scrim sets a contrast floor).

**Performance.** `Reveal`/`RevealItem` no longer animate `filter: blur()` — `filter` is not
compositor-only, so it re-rasterised the entire wrapped subtree every frame, and these wrap whole
page sections (the index is 15 rows with images). The 3px blur was imperceptible across a 350ms
fade. `IndexList`'s cursor preview writes its `<img src>` imperatively (as its transform already
did) instead of through state, which had re-rendered all 15 rows on every row's `mouseenter`.

**Motion (the lens the spend limit killed — audited by hand).** Reduced-motion coverage was already
sound. The real finding: CSS animations don't stop when scrolled away, so **nine infinite
animations** (two birds × drift+flap, the hero photo drift, the scroll cue, the finale marquee) ran
for the whole session — the marquee animating below the fold from first paint. Added
`PauseOffscreen` + an IntersectionObserver on the hero: measured **0 of 9 running while off-screen
(was 6), resuming mid-cycle with no visual change**. This deliberately keeps the owner-directed
Amendment B motion rather than removing it — the cost was the problem, not the intent. `!important`
is required on the pause because the birds set the `animation` *shorthand* inline, which resets
`animation-play-state: running` and beats a stylesheet rule (only 3 of ~7 paused without it).
`.animate-cue` is now killed explicitly under reduced motion rather than relying on the blanket
`iteration-count: 1` override: reduced motion now neutralises **9/9** (was 8/9). The one easing
that departs from `cubic-bezier(0.22,1,0.36,1)` is the scroll cue's `(0.65,0,0.35,1)` — a justified
exception, since ease-out-expo would bunch a continuous sweep at its start.

**A second hydration bug, found while verifying.** The wishlist store gated its first read on a
module-level flag, flipped by whichever consumer mounts first — the header link, in the root
layout. On `/explore` (the one *streamed* dynamic route) that happened before the cards below
finished hydrating, so their first client render read `localStorage` and produced "Saved" against
server HTML saying "Save": React #418, reproducible **only** on `/explore` and **only** with
something already saved. The gate is now per-component, so every consumer's first render matches
the server regardless of mount order. Verified across 18 seeded/unseeded route combinations.

### Third pass — images, drift, duplication

**Images — the worst measured problem in the app.** The two "unverified" image findings were both
real, and together far outweighed everything else. On a 4×-CPU / 1.6 Mbps mobile profile the
homepage LCP was **19,412 ms** (Google's "good" bar is 2,500 ms) while shipping **4.33 MB of
images**. Root cause: Wikimedia images deliberately bypassed the Next optimizer on the reasoning
that Wikimedia "serves pre-sized thumbnails" — it does not. It serves exactly ONE width and
returns HTTP 400 for any other (verified at 400/640/828/1080px), so a responsive `srcset` is
impossible *and* every surface received the full 1280px JPEG: index rows were downloading
1280×1109 / ~438 KB files to render **52×66 px** thumbnails, fifteen of them.

Fixes: removed the `unoptimized` bypass and the two hardcoded `unoptimized` props that were making
their `sizes` inert; converted the hero slides from CSS `background-image` divs (invisible to the
preload scanner, unable to carry `fetchpriority`, impossible to preload) to `next/image` with
`priority` on the first slide; gave index thumbnails `sizes="52px"`. Also removed Konark's hero,
which was a **1,296 KB raw original duplicated by its own 1280px thumbnail** — the same defect
fixed earlier on Kashi Vishwanath. **Result: mobile LCP 19,412 → 1,492 ms (13×), desktop 1,248 →
992 ms, homepage images 4.33 MB → 0.28 MB (15×) all in AVIF, CLS 0.0007.**

**Design drift.** `rounded-portal` was framing the deity *icon* on `/deities/[key]`, against §2A's
own enforcement rule (the arch is for imagery-you-enter and passages, never chrome or a glyph) —
now a circular medallion. The temple entry rendered three panel radii (`rounded-card` plus one-off
26px and 22px) — unified on the token. Explore's toolbar was misaligned: the mode toggle measured
46px against 44px filter pills, with 36px segments; re-sized so the outer control is exactly 44px
and segments are 40px. Removed three dead tokens (`body-xs`, `rounded-input`, `rounded-chip`, zero
uses each) — they were added for a "missing small radius" the fidelity pass never needed, and dead
tokens invite drift because the next person must guess which of two answers is current.

**Duplication (the code-quality lens's DRY half, also done by hand).** The signature two-digit
numeral appeared in **ten places, five of them separate local definitions of the identical arrow
function**. Consolidated onto `padCount()` in `lib/format.ts` — where the project already keeps and
tests its formatters — with unit tests for padding, no-truncation above 99, and negative/fractional
input.

### Fourth pass — the remainder

**`/suggest?state=` now delivers on its promise.** The "help us document {state} →" link from an
empty state page led to a blank form, so the visitor retyped the state they had just come from. The
page resolves the slug back to its real display name (via the `STATE_REGION` registry, so a crafted
or unknown slug resolves to nothing and is never echoed into the page — verified with an injected
value), retitles to "Know a temple in {state}?", and prefills Location.

**The six off-palette hero hues are declared, not promoted.** They are now one documented `NIGHT`
constant in the hero file. Deliberately NOT added to the Tailwind palette: promoting them would
imply the identity gained six tokens, when they only ever describe one composition — a night sky
receding to a horizon, entirely within the locked plum/ink range. Naming them once makes the scene
inspectable and makes it obvious nothing escapes that range. Zero visual change (verified).

**The hero paint-cost concern was measured and refuted.** Scrolling through the hero at 4× CPU
throttle on a 390px viewport: **average frame 8.0 ms, p95 9.7 ms, worst 12.2 ms, and 0 of 69 frames
over the 16.7 ms budget.** The ten blend/filter layers are static and GPU-composited, so they cost
essentially nothing per frame; the earlier worry assumed per-frame filter work that does not happen.
Left exactly as authored — changing working code on a theory would have been the wrong call.

**Fixed a defect the screenshots surfaced.** The hero's vertical side caption wrapped into two
ragged parallel columns at ordinary laptop heights (measured 30px wide — two columns — at 760–860px
viewport height, one clean column only at ≥1000px), because `writing-mode: vertical-rl` wraps a
string longer than the available height. It is now `whitespace-nowrap` and gated on viewport
*height*, so it renders as one column when there is room and not at all when there isn't.

**CTAs consolidated onto the shared primitive.** `/about` and the suggest form hand-rolled
mono-uppercase pills while every other CTA in the redesign uses `ButtonLink`'s body-font pill —
two CTA languages in one product. Both now use `Button`/`ButtonLink`, which also carries the
AA-verified magenta→coral-deep gradient (the hand-rolled flat `bg-magenta` with white label text
sat right on the 4.5:1 line). Verified: `/about` and `/states/[slug]` CTAs now measure identically
(52px, Inter), the submit is 44px, and the form still reaches its honest thank-you state.

**Naming lens (finally run).** File naming is uniformly kebab-case with no exceptions. Four
comments were actively misleading and are fixed: two pointed at the deleted `state-strip` popover,
one sent readers to the retired `components/home/hero-slide.tsx` for the dormant video branch (it
lives in `temple/detail/gallery.tsx`), and two claimed the shared Button primitive "is rebuilt in
Phase 2" — Phase 2 shipped long ago and the primitive already existed, which is precisely why those
two call sites had drifted into hand-rolling their own.

**The hero's two layers now request their own resolutions.** The arch frame and the ghost tower render
the same source through one `FadeLayers`, which shared a single `sizes` of `"(max-width:760px) 70vw,
40vw"`. That resolved to a 512px-wide source for a 461×684 cover-cropped box — a 2.14× upscale, i.e.
the "sharpness" regression, not a decode problem. `sizes` is now a required per-layer prop: the ghost
tower asks for 320/480px (it is masked at 55% opacity, so its upscale is invisible and paying for
detail there is waste), the arch asks for 640/1280px, capped at 1280 because that is the widest
Wikimedia serves. Measured warm steady state: **desktop LCP 104 ms, CLS 0.0002, 370 KB images, arch
upscale 2.14 → 1.21**; **mobile at 4× CPU / 1.6 Mbps LCP 1,540 ms, CLS 0.0007, 50 KB.** An earlier
attempt at 900px on mobile pushed LCP to 2,760 ms — over the 2.5 s bar — which is why the mobile step
is 640px and not larger. This closes the item logged above as a double decode; the double decode is
real but costs nothing measurable, and the ghost tower genuinely needs its own masked copy.

### Fifth pass — the accessibility claim, verified with tooling instead of asserted

Every prior pass reasoned about contrast by eye. Running **axe-core (WCAG 2.0/2.1/2.2 A + AA) over 13
routes × 2 viewports = 26 page runs** replaced that with a measurement, and it found **213 violation
nodes, all one rule: `color-contrast`, impact "serious".** This also promoted an earlier finding
("alpha-tinted ink/porcelain text fails 1.4.3") out of the *unverified* bucket — its verify agent had
died on a spend limit, so it had been neither confirmed nor disproven. It was real.

**Root cause: alpha tints for the caption tier.** Every mono micro-label in this product is 9.5–11px,
so it sits under 1.4.3's 4.5:1 threshold with no headroom at all — and an alpha-tinted foreground
reads as pleasantly "quiet" in the editor while computing far below the bar. Measured: `text-ink/40`
= **2.54:1**, `/45` = **2.91**, `/50` = **3.37**, `/55` = **3.96**, and `text-porcelain/40` on a dark
band = **3.6**. All failures, none of them visible as failures in source.

**Fix is at the token layer, not the call site,** so the next label written cannot reinherit the bug.
`porcelain.muted` (`#BBB1B2`) joins the existing `ink.muted` (`#6B5A67`) as a sanctioned "quiet
foreground" pair, with the measured ratios written into `tailwind.config.ts` as a contract:
`ink.muted` = 5.95:1 on porcelain / 5.38 on porcelain-deep; `porcelain.muted` = 8.58 on ink / 7.63 on
plum. 33 call sites across 18 files moved onto them. Solid also beats alpha on correctness: an alpha
tint silently re-derives its contrast from whatever it lands on (a photo, a mid-tone band), so it
cannot be verified once and trusted. `ink.subtle` (2.98:1) is now marked DECORATIVE ONLY.

**Small brand-accent text is surface-dependent — the two surfaces needed opposite fixes.** `magenta`
at 11px measures **4.29:1** on porcelain (a near-miss failure), so light-surface labels moved to
`magenta-deep` (**6.15**), which is the rule the codebase already documented but had not applied. On
dark, measurement contradicted the obvious move: `magenta` on ink is **3.89** — already failing — and
`magenta-deep` would have made it **2.71**, i.e. the "fix" would have been a regression. The two dark
ordinal numerals (mobile drawer, search overlay) use `coral` (**5.25** on ink) instead, which keeps
magenta's hue family while leaving `turmeric` reserved for the active/hover state so that affordance
stays unambiguous. axe never flagged these two — they live inside a closed drawer and overlay, so no
automated pass can reach them. They were found by measuring the palette against both surfaces.

**Two remaining nodes, both instructive.** A 16px `/methodology` body link at 4.29 → `magenta-deep`,
plus `hover:underline` so the hover state still signals (it no longer changes colour). And the finale
marquee's outlined display type: the `-webkit-text-stroke` alpha *is* the foreground WCAG measures,
because the fill is transparent — at 0.32 it flattened to `#695a63` on ink = **2.77:1**, under even
the 3:1 large-text bar. Now 0.42 = **3.86**. The strip is `aria-hidden` decorative texture, but
`aria-hidden` removes text from the accessibility tree without removing it from the screen; a
low-vision sighted reader still has to look at it, so the bar still applies.

**Verified outcome: 213 → 0.** Re-running the same 26-page audit reports **zero violations**.
Screenshot pass confirms the visual hierarchy survived — labels read as quiet but legible, still
plainly subordinate to their values. Non-text `text-magenta` was deliberately left alone: icons and
glyphs answer to 1.4.11's 3:1 (4.29 passes), and logotypes are explicitly exempt from both.

**Still open (honest list, not a to-do that quietly became "done").** Hover-state contrast was NOT
swept: ~29 files carry `hover:text-magenta`, many mixing light and dark regions in one file, and axe
cannot test hover. Blanket-swapping them on a static heuristic is exactly the kind of unverified
sweep that caused self-inflicted regressions earlier in this branch, so it is deferred to a pass that
can measure each surface. Beyond a11y: no per-image `MediaAttribution` (a real CC-BY-SA licensing gap
under D14), zero component/integration/E2E tests (all 305 are `lib/**` units), no telemetry or error
reporting, forms submit nowhere, in-memory search will not scale past the prototype, and the dataset
is still 15 placeholder records against a 20,000 goal.

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
