# 08 — Animation & Motion System

> **CTemples Master Specification, file 8 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: DESIGN_SYSTEM_V2 §11, UX_SPEC motion clauses, CLAUDE.md "Carousels and autoplay" (absorbed). Rulings carried: D2 (no autoplay), D3 (3D policy), D22 (micro-interactions), D23 (one carousel).

---

## 1. Philosophy

Motion is punctuation, not decoration. The site has exactly **one signature moment** (the card→hero morph), a quiet scroll-reveal grammar, three sanctioned micro-interactions, and nothing else. If a proposed animation isn't in this file, it doesn't ship.

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

Hard ceiling: **400ms** for any single animation. Nothing loops. Nothing plays without a user gesture or a scroll-into-view trigger.

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

Plus the ambient-free standard set: card lift/zoom on hover (file 03 §5), button `active:scale-[0.98]`, link-draw underline (200ms background-size), popover fade/scale-in ≤150ms, hero crossfade 300ms, map-state fill transitions 150ms, bottom-sheet spring (Framer default, damped — no bounce past target).

## 6. Carousel & autoplay law (absorbed from the locked decisions)

- The homepage hero is the **only** carousel: user-driven (arrows/dots/keyboard ←→ Home/End/swipe), crossfade 300ms, **no autoplay in any form** — no auto-advance, no autoplay-paused-on-hover, no kinetic drift.
- Every other multi-item surface is a grid or a native horizontal scroll (momentum scrolling, right-edge fade hint, no JS carousel, no arrows/dots).
- Video (when it exists): `muted` + `playsInline`, poster shown, plays only on explicit tap; visible "Tap to unmute" is the only path to sound. `prefers-reduced-data`: no video preload.

## 7. Reduced-motion matrix (every animation × its reduced behavior)

Global CSS forces `animation-duration/transition-duration → 0.001ms` under `prefers-reduced-motion: reduce`; the entries below define the *intended* reduced experience, which components must honor explicitly (via `useReducedMotion`) rather than relying on the global kill-switch alone:

| Animation | Reduced behavior |
|---|---|
| View-transition morph + slides | disabled; instant navigation |
| Scroll reveals / stagger | content visible immediately (no transform, no blur; opacity-only 200ms fade permitted) |
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
- Zero `animation-iteration-count: infinite` (or equivalent loops) anywhere; grep for `repeat: Infinity` returns nothing.
- With `prefers-reduced-motion: reduce`: no element transforms on scroll or hover; navigation is instant; the site remains fully functional and visually complete.
- No animation exceeds 400ms; no animation fires without gesture/scroll trigger.
- The morph survives: card image → hero image is a single continuous element transition on supporting browsers.

## 10. Anti-patterns
- "Tasteful" ambient loops (flames, glows, slow spins, marquee text) — the answer is no.
- Reveal-wrapping Explore results or anything a filter tap re-renders.
- Skeleton shimmer animations for server-rendered content (content arrives with the page; skeletons are for genuinely async islands only).
- Re-adding parallax (component was deleted; stays deleted).

## 11. What Sonnet does next
Nothing standalone — this file is consumed by every UI phase. When implementing Phase 3+: import easing/duration values from the Tailwind config rather than re-declaring literals; add the §5 micro-interactions only in the phase that builds their host component (deity draw exists conceptually for tiles — implement in the phase that next touches `deity-tiles.tsx`; boundary trace lands with the map in Phase 4; caret with the section index in Phase 5).
