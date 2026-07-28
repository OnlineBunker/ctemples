# 08 — Animation & Motion System

> **CTemples Master Specification, file 8 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: DESIGN_SYSTEM_V2 §11, UX_SPEC motion clauses, CLAUDE.md "Carousels and autoplay" (absorbed). Rulings carried: D2 (autoplay per §6, as amended), D3 (3D policy), D22 (micro-interactions), D23 (carousel law, as amended).
> **Amended 2026-07-11 (Amendment A, user-directed):** hero autoplay sanctioned (§6 autoplay law), Ken Burns slide drift sanctioned (§5), showcase carousels for curated rows sanctioned (§6), two-tier duration ceiling (§2). Reduced-motion behavior is unchanged: it always yields the calm, static site.
> **Amended 2026-07-28 (Amendment B, owner-directed — "Cinematic homepage"):** the product owner reviewed the shipped Threshold homepage against the handoff prototype and directed that the prototype's **cinematic motion be restored** on the homepage — the very kit that `docs/15 §0a/§2J/§3` had earlier declined to port. Newly sanctioned, **homepage only** (`app/page.tsx` and its `components/home/*`), never chrome or other routes: (1) **hero scroll-parallax** — a decoupled rAF rig where the arch portal zooms + drops and background/foreground layers translate at differing rates as the hero scrolls out, with the headline splitting apart (see §5#6); (2) **drifting hero birds** — two faint SVG gulls crossing the sky on an infinite drift (§5#7); (3) **per-slide sky shift** — the hero's warm glow/tint crossfades with each slide change (§5#8); (4) **the Index cursor-follow preview card** — a floating arch thumbnail that trails the pointer over the "Choose a doorway" list (§5#9); (5) **the Finale marquee** — the outlined temple-name frieze scrolls as a seamless infinite loop (§5#10); and (6) **a slow living-hero drift** — the arch photo breathes a gentle ken-burns zoom at rest (§5#11). **The reduced-motion contract is unchanged and remains absolute:** under `prefers-reduced-motion: reduce` (and, where noted, Save-Data / coarse pointer) every one of these is OFF — the parallax rig never starts, birds and marquee do not animate, the cursor card is never attached, and the page reads exactly as the calm static Threshold did. This amendment narrows, but does not repeal, §5's "still banned" list and §9/§10's no-infinite-loop rule: the loops sanctioned here are an explicit, enumerated, homepage-scoped exception, disabled under reduced motion — the answer to "one more loop *elsewhere*" is still no.

---

## 1. Philosophy

Motion is the festival's rhythm, not noise. The site has **one signature transition** (the card→hero morph), a living hero (autoplay + Ken Burns under a visible pause control), a quiet scroll-reveal grammar, showcase carousels for curated editorial rows, and three sanctioned micro-interactions — and nothing else. If a proposed animation isn't in this file, it doesn't ship.

## 2. Motion tokens

| Token | Value | Use |
|---|---|---|
| `ease-threshold` | `cubic-bezier(0.22, 1, 0.36, 1)` | the house easing — everything uses it unless listed otherwise |
| `--duration-exit` | 150ms | page-leave fades |
| `--duration-enter` | 220ms | page-arrive fades |
| `--duration-move` | 400ms | the morph + directional slides |
| reveal | 350ms | scroll reveals |
| stagger | 60ms | children within a revealed group |
| micro | 150–400ms | hovers, fills, micro-interactions |
| crossfade | 300ms | hero slide changes |
| `--hero-dwell` | 7000ms | autoplay dwell per hero slide; also the Ken Burns and dot-progress duration |

Two-tier ceiling *(Amendment A — was a single 400ms ceiling)*: **interaction motion** (hover, popovers, filters, navigation) stays ≤400ms; **dwell-scoped motion** (Ken Burns drift, the autoplay progress dot) runs the length of `--hero-dwell` — it is progress indication and cinematic drift, not UI response. Nothing loops infinitely (each dwell animation is a finite run, restarted per slide). Motion starts only from a user gesture, a scroll-into-view trigger, or the hero's autoplay clock — which always ships with its visible pause control (§6).

## 3. The signature moment — card→hero shared-element morph

- Mechanism: React native View Transitions (`experimental.viewTransition`), wrapped in `components/motion/view-transition.tsx`; the TempleCard image and temple-page hero share `view-transition-name: temple-{id}`.
- Group animation: `--duration-move` (400ms), `ease-threshold`, with the `vt-via-blur` recipe (30% keyframe blur 3px) on the image pair; temple-name text uses the `text-morph` recipe (no raster scaling of text).
- Directional page slides: `nav-forward` / `nav-back` transition types set via `TransitionLink` (`addTransitionType`), 48px slide offsets layered on the fade.
- Default navigation (no shared element): gentle crossfade using exit/enter durations.
- The sticky header is exempted from transitions (`view-transition-name: site-header`, animation none) so it never flashes.
- Constraints protecting the morph: no 3D-transformed or `overflow: hidden`-clipping ancestor changes on the card image wrapper; hover zoom on the image is a plain 2D scale.
- Degradation: browsers without the API navigate instantly — no polyfill, no fallback animation.

## 4. Scroll-reveal grammar

- `Reveal`: opacity 0→1, translateY 16px→0, blur 3px→0, 350ms, triggered once at −12% viewport margin.
- `Stagger` + `RevealItem`: same recipe per child, 60ms apart.
- Applied to: section content on `/` and long-form sections on `/temples/[id]`. **Never applied to**: the hero (renders immediately), chrome, the quick-facts bar, anything above the fold, Explore results (filter changes swap content instantly — waiting 350ms per filter tap reads as lag, not craft).

## 5. Sanctioned micro-interactions (D22) — the complete list

| # | Interaction | Trigger | Spec | Reduced motion |
|---|---|---|---|---|
| 1 | Deity-icon stroke-draw | hover/focus on deity tile | SVG `stroke-dashoffset` draw, 280ms, `ease-threshold` | icon at full stroke, color feedback only |
| 2 | State boundary trace | selecting a map state | one-shot `stroke-dasharray` trace of the selected polygon's outline, 350ms | instant selected fill, no trace |
| 3 | Section-index caret | scroll-spy target change | caret translateY to active item, 200ms | instant jump |

Plus the standard set: card lift/zoom on hover (file 03 §5), button `active:scale-[0.98]`, link-draw underline (200ms background-size), popover fade/scale-in ≤150ms, hero crossfade 300ms, map-state fill transitions 150ms, bottom-sheet spring (Framer default, damped — no bounce past target).

**Sanctioned dwell-scoped motion (Amendment A):**
| # | Motion | Spec | Reduced motion |
|---|---|---|---|
| 4 | Hero Ken Burns drift | visible slide's image scales 1.0→1.05, linear, over `--hero-dwell`; restarts on slide change; plain 2D scale (morph-safe) | none — static image |
| 5 | Autoplay progress dot | active hero dot fills 0→100% width over `--hero-dwell` while autoplay runs; static bar when paused/stopped | static bar |

**Sanctioned homepage cinematic motion (Amendment B, 2026-07-28) — homepage `/` only, never chrome or other routes:**
| # | Motion | Spec | Reduced motion |
|---|---|---|---|
| 6 | Hero scroll-parallax | decoupled scroll-listener writes a target `p = clamp(scrollY / innerHeight, 0, 1.15)`; a rAF loop lerps a smoothed value toward it (`p += (target−p)·0.14`) and drives: arch portal `translateY(p·300px) scale(1 + p·0.16)`, orbit ring `scale(1 + p·0.55)` + fade, per-layer `translateY` (mountains≈46 / silhouettes≈92 / mist≈130 / foreground-mist≈180 px) with mist/rays/labels fading, headline lines splitting apart (`±p·vw·0.22–0.30` X, up, `skewX(±p·4deg)`) + fading. Values are the prototype's; all are pure 2D transform/opacity (morph-safe, GPU-friendly). rAF is torn down on unmount. | **rig never starts** — every element sits at its `p=0` rest transform; the hero is the static Threshold composition |
| 7 | Hero drifting birds | a faint flock of three `position:absolute` SVG gull strokes behind the arch/headline; each wrapper drifts L→R on an undulating path (`bird-drift`, ~44–57s `linear infinite`, staggered delays) and fades in/out at the screen edges so the loop never pops, around an inner gull that flaps its wings (`bird-flap`, ~0.55–0.75s), low opacity | not rendered / no animation — static gulls |
| 8 | Hero per-slide sky shift | the hero's warm radial glow + a faint tint layer crossfade to a new subtle hue on each slide change, over the crossfade duration; hue set is fixed and derived from slide index | static — first slide's glow only (autoplay never runs, so slides never change) |
| 9 | Index cursor-follow preview | on the "Choose a doorway" list, a fixed 288×368 arch thumbnail of the hovered temple trails the pointer (lerp 0.13, offset +30/−250px, tilt ±6° by follow-lag, opacity fade 350ms). Gated on `(hover:hover) and (pointer:fine)` — desktop/mouse only; mobile keeps the inline row thumbnail | never attached — rows show color/pad feedback only |
| 10 | Finale marquee | the outlined temple-name frieze is duplicated and translated `0 → −50%`, `linear infinite`, so it scrolls seamlessly | **no animation** — static outlined frieze (identical at rest) |
| 11 | Living-hero drift | the arch photo breathes a slow ken-burns zoom `scale 1.0↔1.06`, `24s ease-in-out infinite alternate` — runs at rest to keep the standing hero alive (distinct from §5#4's dwell-scoped, per-slide Ken Burns) | **no animation** — static image |

Still banned, unchanged everywhere *except* the enumerated homepage set in the two tables above: flames, glow pulses, slow spins, marquee text on non-homepage surfaces, particle systems, parallax outside the homepage hero, tilt-on-hover on cards, and any infinite loop not listed above. The sanctioned set is exhaustive; the answer to "one more tasteful loop" is still no.

## 6. Carousel & autoplay law *(rewritten 2026-07-11, Amendment A — was "no autoplay in any form")*

**The hero autoplay law** — the homepage hero is the only autoplaying surface, and its autoplay must satisfy ALL of:
1. **Dwell 7s** (`--hero-dwell`), wrap-around advance, crossfade 300ms.
2. **Visible pause/play toggle** (≥44px, correct `aria-label` both states) — the WCAG 2.2.2 pause mechanism; it must work for touch and keyboard users, not just hover.
3. **Pauses** while the pointer is over the carousel region or focus is inside it; **resumes** when both leave.
4. **Stops for the visit** on any manual navigation (arrow, dot, keyboard, swipe); only the toggle restarts it.
5. **Never starts** under `prefers-reduced-motion` or Save-Data; never steals focus; never triggers SR announcements (the polite live region speaks only after user interaction).
6. Ships with the progress-dot affordance (§5#5) so auto-advance is visible, not surprising.

**Showcase carousels (curated rows only):** trip ideas and future hand-curated editorial sets may be center-emphasis, **user-driven** carousels — native horizontal scroll + `scroll-snap` (center-aligned), peeking neighbors at reduced scale/opacity, prev/next buttons (≥44px), drag/swipe. No autoplay, no timers. Computed/data-driven lists stay grids or plain scroll rows — Explore results and the temple page's computed "Plan around" sections are not curated (file 06 §12's ban stands); a filter tap must never animate a carousel.

- Any other multi-item surface remains a grid or plain native horizontal scroll (momentum, right-edge fade hint, no arrows/dots).
- Video (when it exists): `muted` + `playsInline`, poster shown, plays only on explicit tap; visible "Tap to unmute" is the only path to sound. `prefers-reduced-data`: no video preload.

## 7. Reduced-motion matrix (every animation × its reduced behavior)

Global CSS forces `animation-duration/transition-duration → 0.001ms` under `prefers-reduced-motion: reduce`; the entries below define the *intended* reduced experience, which components must honor explicitly (via `useReducedMotion`) rather than relying on the global kill-switch alone:

| Animation | Reduced behavior |
|---|---|
| View-transition morph + slides | disabled; instant navigation |
| Scroll reveals / stagger | content visible immediately (no transform, no blur; opacity-only 200ms fade permitted) |
| Hero autoplay | never starts (manual navigation only) |
| Hero Ken Burns | none — static image |
| Trip showcase carousel | scroll-linked scale/opacity emphasis off (uniform cards); snap + arrows still work |
| Hero crossfade | instant slide swap |
| Card hover lift/zoom | color/border feedback only |
| Micro-interactions 1–3 | per table §5 |
| Bottom-sheet drag | drag disabled; snap changes via buttons, fade 150ms |
| Popover/menu entrance | instant |
| Smooth scroll (anchors, back-to-top) | instant jump |
| Spinner (`role="status"`) | permitted (progress indication is exempt), but prefer text "Loading…" |

## 8. 3D policy (D3, full text)

**Banned everywhere in core UI:** real-time WebGL/three.js/r3f, canvas particle systems, shader backgrounds, 3D card flips, parallax depth stacks, tilt-on-hover, scroll-jacked camera moves, 3D globes/maps. The dependencies were removed from `package.json` and do not return for UI work. The site's dimensionality budget is spent on photography and the 2D morph.

**Sanctioned future 3D (production only, content-gated):**
1. **Virtual darshan panoramas** — 360° photospheres of real temple interiors/courtyards, opened from the gallery lightbox as a clearly-labeled item. Requirements: real captured panoramas only (no synthetic reconstructions), loads only on explicit tap (`next/dynamic`, zero bytes otherwise), drag/gyro to look around — gyro counts as motion and is off under reduced-motion (drag remains), full keyboard operability (arrows pan, Esc exits), and a flat-image fallback.
2. **Photogrammetry monument viewers** — only where a real scan exists (e.g. ASI/CyArk partnerships), same gating rules, treated as a gallery media kind.

Both are additive `MediaItem.kind` values in the future (`"panorama"`, `"model"`); the schema anticipates extension, nothing implements them now. Any other 3D proposal requires a file-14 amendment with a named user benefit that photography cannot deliver.

## 9. Acceptance criteria
- No `animation-iteration-count: infinite` (or equivalent loops) **except** the Amendment-B homepage set (§5#7 birds, §5#10 marquee, §5#11 living-hero drift, and the hero scroll-cue line) — all confined to `components/home/*`, all disabled under reduced motion. `repeat: Infinity` (Framer) still returns nothing. (Ken Burns §5#4 and the progress dot §5#5 are finite per-dwell runs, restarted per slide — not loops.)
- With `prefers-reduced-motion: reduce`: no element transforms on scroll or hover (the hero parallax rig never starts; birds/marquee/cursor-card are inert); navigation is instant; autoplay never starts; the site remains fully functional and visually complete — the homepage reads exactly as the static Threshold composition.
- No **interaction** animation exceeds 400ms; dwell-scoped motion (§5#4–5) runs exactly `--hero-dwell`; nothing else fires without gesture/scroll trigger.
- The hero autoplay law (§6) passes all six clauses, verified in-browser (hover-pause, focus-pause, manual-stop, toggle, reduced-motion off, progress dot).
- The morph survives: card image → hero image is a single continuous element transition on supporting browsers.

## 10. Anti-patterns
- Ambient loops (flames, glows, slow spins, particles) and marquee/parallax **anywhere but the enumerated homepage set** (§5#6–10) — that set is exhaustive; the answer to "one more tasteful loop" is no.
- Autoplay anywhere but the hero, or hero autoplay missing any clause of the §6 law (an autoplay without a working pause control is an accessibility defect, not a style choice).
- Reveal-wrapping Explore results or anything a filter tap re-renders.
- Skeleton shimmer animations for server-rendered content (content arrives with the page; skeletons are for genuinely async islands only).
- Extending the Amendment-B cinematic motion **off the homepage** (to chrome, Explore, temple, state/deity pages), or shipping any of it without its reduced-motion off-switch. The parallax rig, birds, sky-shift, cursor card, and marquee live in `components/home/*` and nowhere else.

## 11. What Sonnet does next
Nothing standalone — this file is consumed by every UI phase. When implementing Phase 3+: import easing/duration values from the Tailwind config rather than re-declaring literals; add the §5 micro-interactions only in the phase that builds their host component (deity draw exists conceptually for tiles — implement in the phase that next touches `deity-tiles.tsx`; boundary trace lands with the map in Phase 4; caret with the section index in Phase 5).
