# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: CTemples

A Next.js 15 frontend prototype for a temple-tourism content platform — a comprehensive encyclopedia of Indian temples, similar to Wikipedia but focused exclusively on temples. Static data only, no backend. Design rationale in `DESIGN.md`; build order in `IMPLEMENTATION_PLAN.md`.

> **Direction pivot (in progress):** the project's stated direction is a light-mode, vibrant, welcoming identity (white / temple red / sand yellow / warm gold — see *Project Vision* below). The current code is still the older dusk-lit "nightstone" design from `DESIGN.md`; a redesign is expected. When working on visual decisions, follow the **Project Vision** section as the target — not the existing `nightstone` tokens in `tailwind.config.ts` and `globals.css`.

Stack: Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v3 · Framer Motion · React View Transitions (native, via `experimental.viewTransition`) · lucide-react · next/font (Fraunces / Hanken Grotesk / Space Mono). Optional `react-three-fiber` accent (dynamic-imported, with 2D fallback).

## Commands

```bash
npm install            # first run needs network — next/font downloads fonts
npm run dev            # http://localhost:3000
npm run build          # production build; static-generates every /temples/[id]
npm run start          # serve the production build
npm run typecheck      # tsc --noEmit
npm run test           # vitest run — unit tests for lib/ logic
npm run test:watch     # vitest watch mode
npm run lint           # next lint
docker build -t ctemples . && docker run -p 3000:3000 ctemples   # container
```

Vitest config (in `vitest.config.ts`) only picks up `lib/**/*.test.ts`. To run a single suite, use `npx vitest run lib/filter.test.ts` (or any `lib/*.test.ts` path). `app/` and `components/` have no test files by design.

`npm audit` reports dev-only esbuild/vite/postcss advisories that do not ship in the runtime bundle. **Do not run `npm audit fix --force`** — it downgrades Next.js and breaks the app.

## Project Vision

This website is a comprehensive encyclopedia of Indian temples, similar to Wikipedia but focused exclusively on temples.

### Design system

> **Palette superseded (2026-07-08):** the exact hex values below are stale. The approved
> visual direction is now "Modern Utsavam" — porcelain canvas, `magenta #E5006D` / `coral
> #FF3D6E` / `saffron #FF7A00` / `turmeric #FFC300` / `plum #3D0A40` — implemented in
> `tailwind.config.ts` and documented in `DESIGN.md`. The token *names* below (temple-red,
> sand-yellow, warm-gold) still exist as aliases onto the new hexes so old code keeps
> working, but treat `DESIGN.md` + `tailwind.config.ts` as canonical, not this section.
> See `PROJECT_CONTEXT.md`'s Build status callout for the full context.

- Light mode is the primary and default theme.
- Avoid dark mode designs unless explicitly requested.
- Use vibrant and welcoming colors inspired by Indian temple architecture and culture.
- Primary colors (superseded — see callout above):
  - White (`#FFFFFF`)
  - Temple Red (`#C62828` or similar)
  - Sand Yellow (`#E6C068` or similar)
  - Warm Gold accents
- The design should feel spiritual, premium, trustworthy, and tourist-friendly.
- Prioritize readability and visual appeal over minimalism.

### Content scale

- The final platform will contain **20,000+ temples** across India.
- Each temple will have: photos · historical information · location details · timings · festivals · architecture information · cultural significance · visitor information.
- Day-to-day development works against the current placeholder array in `data/temples.ts`. The placeholder count (15 now) is an implementation detail, not a design target — every page, filter, search, pagination, and `generateStaticParams` should be written as if the array already contained the full 20,000+ set. **Never make assumptions based on the current dataset size.**

### User experience goals

- Users should discover new temples naturally.
- Encourage long reading sessions similar to Wikipedia.
- Highlight related temples and destinations.
- Use attractive imagery and rich content layouts.
- Make tourists want to explore and visit temples.
- Mobile-first design with excellent performance.

### Visual inspiration

The website should feel like a mix of:

- Wikipedia's information depth
- Modern travel websites
- Indian cultural heritage portals
- Premium tourism platforms

## Architecture

### The content contract

The whole app derives from a single array of `Temple` records in `data/temples.ts`. To go live, replace that array with the full generated set (15 now → 2,000+ later). Nothing else needs to change — every page, filter, region count, and `generateStaticParams` reads through `lib/temples.ts`. Nothing hardcodes the current count.

`lib/types.ts` is the schema. `lib/validate.ts` is a dev-time shape validator; the `placeholder dataset` vitest suite flags bad slugs, out-of-range ratings, coordinates outside India, missing cost estimates, etc.

### Data flow

```
data/temples.ts  →  lib/temples.ts  (data-bound public API)
                  ↘  lib/temple-queries.ts  (pure helpers, unit-tested)
                  ↘  lib/filter.ts  (Explore search/filter/sort, pure)
                  ↘  lib/format.ts  (cost/number/distance formatters)
                  ↘  lib/regions.ts  (REGION_ORDER, region → pigment mapping)
```

- `lib/temples.ts` is the only file pages import for data. It wraps pure helpers in `temple-queries.ts` with the real `temples` array.
- `lib/temple-queries.ts`, `lib/filter.ts`, `lib/format.ts`, `lib/validate.ts` are **pure** (no data import), so they're trivially unit-tested with fixtures in `lib/__fixtures__/`.
- Path alias: `@/*` maps to repo root (see `tsconfig.json`).

### Routes (`app/`)

- `page.tsx` — Home: parallax hero, mission blurb, featured showcase, region mandala, stats.
- `explore/page.tsx` — Read URL params (`?region=&tag=&q=&sort=`) → render `ExploreClient` (search/filter/sort grid; cards are the morph source).
- `temples/[id]/page.tsx` — Detail page. `generateStaticParams` from `getTempleIds()`. Long dossier: overview → history → legends → architecture → significance → best-time/festivals → timings/fees → how-to-reach → cost-to-visit table → gallery (lightbox) → map → related.
- `about/`, `contact/` — About + Partner form (UI-only; form is explicitly not wired — no fake success).
- `not-found.tsx`, `layout.tsx`, `globals.css`, `fonts.ts` — shell.

### Components (`components/`)

- `brand/` — `GopuramMark`, `MandalaMark`, `Divider` (hand-built SVGs).
- `home/` — `Hero`, `RegionExplorer`, `HeroEmbers` (r3f accent, lazy).
- `explore/` — `ExploreClient`, `FilterChip`.
- `temple/` — `TempleCard` + detail-page section components.
- `media/` — `TempleImage` (next/image) + `TempleScene` (procedural SVG fallback). Real URLs flow through next/image; failures auto-fall-back to `TempleScene`; empty `""` also renders procedural art. Fixed aspect-ratio boxes → zero CLS.
- `motion/` — `Reveal`, `Stagger`, `Parallax` (Framer Motion primitives), `ViewTransition` + `TransitionLink`. `MotionConfig` gate for `prefers-reduced-motion`.
- `ui/` — `Button`, `Chip`/`Tag`, `Eyebrow`, `StatFigure`, `Rating`, `SectionHeading`.
- `layout/` — `Header` (keyboard-operable), `Footer`, skip-link.

### Signature interaction

Card → detail hero shared-element morph via React's native View Transitions API. `experimental.viewTransition: true` in `next.config.mjs`; shared `view-transition-name` and morph CSS in `components/motion/view-transition.tsx` + `app/globals.css`. Directional page slides use `addTransitionType` via `TransitionLink`. Degrades gracefully where the API isn't supported; disabled under `prefers-reduced-motion`.

### Images

`heroImage` and `gallery` in the data are populated with real Wikimedia Commons URLs (served `unoptimized` to avoid 429s from one IP proxying 15+ images). To use self-hosted photography, add the host to `images.remotePatterns` in `next.config.mjs`. Procedural `TempleScene` SVGs are the always-safe fallback.

### Design system (target direction)

Follow the **Project Vision** section above. The current `DESIGN.md`, `tailwind.config.ts`, and `globals.css` are still the older dark "nightstone" system and are pending a redesign to match the new light-mode direction.

- **Canvas:** white / near-white (light mode is primary and default). Avoid dark backgrounds unless explicitly requested.
- **Palette:** white · temple red (`#C62828` or similar) · sand yellow (`#E6C068` or similar) · warm gold accents. Vibrant, welcoming, spiritual — not minimal.
- **Type roles:** Fraunces (display, carved-stone feel) · Hanken Grotesk (body, humanist) · Space Mono (utility/data: eyebrows, coordinates, fees, indices).
- **Region → pigment mapping** (pending redesign): the old mapping in `lib/regions.ts` and `globals.css` ties regions to lapis / vermilion / verdigris / marigold / jade / brass. When the visual system is rebuilt, the region-pigment mapping should be re-derived from the new palette (or dropped in favor of typography/positioning cues if it conflicts with the light/white canvas).
- **Motion philosophy:** scroll reveals (~16px + un-blur) share easing with view transitions; signature morph is the one memorable moment; ambient flicker/rotation is restrained. `prefers-reduced-motion` is a floor, not a feature.

### Accessibility & performance as a floor

Semantic HTML, labelled controls, keyboard-operable filter UI and lightbox, visible focus, alt text, AA contrast, full `prefers-reduced-motion` support, zero CLS (fixed aspect-ratio image boxes, single `priority` image, font subsetting via `next/font`). The optional 3D accent is `next/dynamic` lazy-loaded with a 2D static fallback.

## Finalized decisions

This section captures architectural and product decisions that have been approved and are now **permanent guidance** for future development. When a decision here conflicts with a convention elsewhere, this section wins. The full audit trail is in `REDESIGN_PLAN.md`; the page-level UX is in `UX_SPEC.md`; the design primitives are in `DESIGN_SYSTEM_V2.md`; the project index is in `PROJECT_CONTEXT.md`.

### Information architecture

- **The 3-click rule is the goal.** A user should reach any temple in 3 clicks from the homepage. Prefer 2.
- **There is no `/states/[slug]`, no `/deities/[slug]`, no `/regions/[slug]`, no `/blog`.** State, deity, and region are filters on `/explore`, not top-level routes.
- **The URL is the single source of truth.** Every filter, sort, page, and mode on `/explore` round-trips through the URL. The back/forward buttons restore any state. The URL is shareable.
- **Nothing hardcodes the current dataset size.** No "showing 1 of 15" copy, no "we have 15 temples" stats — every count is derived from the data.

### URL contracts

- `/explore` accepts: `?view=list|map` (default `list`), `?q=<alias-aware query>`, `?state=<slug>`, `?deity=<slug>`, `?tag=<slug>` (repeats up to 3), `?sort=rating|popularity|name` (default `rating`), `?preset=<slug>`, `?page=<n>`.
- `/temples/[id]` takes no query parameters. The back link is state-aware: "← Back to [state] temples" → `/explore?view=map&state=<slug>`.

### Carousels and autoplay

- **The only carousel on the site is the homepage hero** (5–6 slides, no autoplay).
- All other "scrollable" content is a horizontal scroll on mobile / grid on desktop, not a carousel.
- **No autoplay anywhere.** The hero has visible prev/next buttons, dots, and keyboard control (←/→, Home/End). It does not autoplay, does not autoplay-paused-on-hover, and does not animate the slide on its own.
- **Video is muted by default** (`muted`, `playsInline`, no controls initially). A visible "Tap to unmute" button is the only path to sound. No autoplay on any video.
- **No ambient loops.** No diya flicker, no mandala spin, no 3D embers, no autoplaying animations of any kind. `prefers-reduced-motion` is a floor: every animation is reduced or disabled.

### Search

- **One search, two entry points.** The same `lib/search.ts` powers the header search overlay and the `/explore` search bar. The header overlay is a quick entry; the Explore bar is the persistent search.
- **The search returns one ranked list.** No "smart" vs "all" split, no tabs.
- **Aliases are data, not code.** `lib/search-aliases.ts` is a typed `Record<string, string>` with a "Why this alias?" comment per entry. Extending the map is a content-strategy decision, not a code review.
- **The smart-match banner** is `role="status"` and `aria-live="polite"`. It shows "Showing X for Y (matched as Z)" when an alias matches, and is dismissible.

### Map

- **No API key. No Mapbox, no Leaflet, no Google Maps JS API.** The Explore map is an inline SVG of India, state polygons from a public-domain GeoJSON, region cluster circles sized by `log(count + 1)`.
- **Each state is a `<g role="button" tabindex="0">`** with an `aria-label`. A visually-hidden `<ul>` of state links is the screen-reader contract; the SVG itself is decorative.
- **The detail page's small map** is a coordinate plot, not a real map. It links out to Google Maps for directions with the lat/lng pre-filled.
- **The map component is `next/dynamic` lazy-loaded** (not in the initial bundle). It only loads on `?view=map`.

### Mobile bottom sheet

- **The map mode's right column on mobile is a bottom sheet** with snap points: peek (handle + state name), half (compact list), full (full list + filters).
- **The sheet uses Framer Motion's `drag` and `useDragControls`.** Focus is trapped at half/full; Esc closes; the sheet is dismissible by dragging below peek.
- **Respects `prefers-reduced-motion`** — the drag is disabled; the sheet opens/closes with a fade.
- The simpler full-screen sheet (no snap points) is the documented fallback if the snap-point implementation is unworkable on iOS Safari.

### Detail page

- **18 sections, in a fixed order** (per `UX_SPEC.md` §3). The order is: hero → quick-facts bar → why visit → plan around → best time → overview → how to reach → history → legends & mythology → architecture → spiritual significance → cost to visit → gallery → map → within 100 km → by the same deity → same architectural style → nearby attractions.
- **One H1 per page** (in the hero). H2 per major section. H3 for sub-sections (e.g. within "Architecture" — vimana, mandapa, gopuram).
- **Timings and entry are in the quick-facts bar**, not a separate "Timings & entry" section. The old 11-section dossier is replaced by the new 18-section dossier.
- **The 4 new "related" sections** (plan around, within 100 km, by the same deity, same architectural style) are pure-helper-driven (`pickByDeity`, `pickByArchitecturalStyle`, `pickWithinRadius` via Haversine). They hide themselves when there's no match.
- **"Why visit" is editorial, not auto-generated.** Each temple gets a hand-written 3–4-sentence `whyVisit` paragraph. This is content work, not engineering work.

### Forms

- **All forms are UI-only.** `/contact` and `/suggest` show a visible "this is a prototype, nothing was sent" notice. No network call, no fake success, no optimistic update, no fake loading.
- **No API routes.** There is no backend, no fetch to a server endpoint, no third-party form service.
- The "Suggest a temple" form is at `/suggest` (not at `/contact`). The `/contact` form is the partner inquiry.

### Removed from the prototype

- **The 3D embers accent** (`components/home/hero-embers.tsx` + `hero-embers-mount.tsx`) is removed. The light-mode hero is photo-only. `three` and `@react-three/fiber` are removed from `package.json`.
- **The region mandala** (`components/home/region-explorer.tsx`) is removed. The mandala SVG itself is reused as a decorative motif in the methodology teaser or footer. Region navigation now happens via the state strip (homepage), the deity tiles (homepage), and the region pills (Explore map).
- **The parallax component** (`components/motion/parallax.tsx`) is removed. The new hero has no parallax.
- **The `Parallax` motion on the home hero is removed.** The hero is a static full-bleed photo carousel.
- **The "scroll inward" cue at the bottom of the hero is removed.**
- **The 4-stat strip on the homepage is removed.** The "Trip ideas" section + state strip + deity tiles replace it. The `Stat` component itself survives for the `/about` page and detail-page callouts.
- **The "Featured temples" 3-column grid on the homepage is removed.** Folded into trip ideas + popular searches.
- **`heroImage` and `gallery: string[]` on the `Temple` type are removed.** Replaced by `media: MediaItem[]` (a refactor of both fields, image + video support). The schema is locked in Phase 0.
- **The "load more" pagination on Explore is removed.** Replaced by page-number pagination (‹ 1 2 3 … N ›).

### Schema additions (locked in Phase 0)

- `Temple.whyVisit: string` — 3–4 sentences for the "Why visit" section.
- `Temple.architecturalStyleSlug: string` — derived slug for the "Same style" section.
- `Temple.tripDuration?: { temples: number; days: number; km: number }` — optional, populated for ~6 of 15 temples in the prototype.
- `Temple.media: MediaItem[]` — refactor of `heroImage` + `gallery` into a single list, with video support.
- `MediaItem` type: `{ kind: "image" | "video"; url: string; poster?: string; alt: string; width?: number; height?: number; durationSec?: number }`.

### Lib additions (locked in Phase 0)

- `haversineKm(a, b)` — pure Haversine distance.
- `pickByDeity(list, deity, limit)` — same-deity match.
- `pickByArchitecturalStyle(list, style, limit)` — same-style match.
- `pickWithinRadius(list, lat, lng, km, limit)` — Haversine-distance match.
- `formatRelativeDistance(km)` — "38 km away" / "412 km".
- `searchTemples(list, query, options)` — alias-aware ranked search; returns `{ results, matchedAliases }`.
- `lib/search-aliases.ts` — the alias map. Data, not code.
- `lib/india-geo.ts` — parsed India state polygons and helpers.
- `lib/media.ts` — `getHero`, `getGallery`, `getVideo` helpers.

### Filter popovers

- **4 filters in a fixed order: State · Deity · Tag · Sort.** No more, no less. Each is a trigger button + a popover.
- **Max 3 tags.** The TagFilter enforces this. The design system prevents over-narrowing.
- **The "Featured" and "Lowest cost" sort options are removed** from the public sort list. The 3 public options are: Top rated (default), Most visited, A–Z.
- **All popovers trap focus, dismiss on Esc, and dismiss on outside click.** Use a battle-tested headless primitive (e.g. Radix `Popover` or `react-aria` `useOverlay`), not a hand-rolled one.

### Accessibility floor (locked)

- WCAG 2.1 AA contrast on every surface.
- Keyboard-operable on every interactive element.
- Visible focus on every focusable element (2-px `temple-red` outline, 2-px offset).
- `prefers-reduced-motion` respected everywhere (every animation reduced or disabled).
- `prefers-reduced-data` considered (no autoplay video, no autoplay carousel).
- Touch targets ≥ 44×44 px.
- 200% zoom test passes (no horizontal scroll).
- Screen-reader walkthrough passes on every page.
- Semantic HTML, labelled controls, alt text on every image.
- Skip-to-content is the first focusable element on every page.

### Performance floor (locked)

- Lighthouse Performance ≥ 90 on `/`, `/explore`, `/temples/<id>`.
- Lighthouse Accessibility ≥ 95 on every page.
- Lighthouse Best Practices ≥ 95 on every page.
- LCP < 2.5 s on simulated 4G Moto G4.
- Single `priority` image per page (the hero).
- All other images are lazy-loaded with `next/image`.
- `next/dynamic` for the India map (map mode only).
- `next/font` self-hosts all three fonts.

### Color tokens (locked)

- The full palette is in `PROJECT_CONTEXT.md` §1. The brief summary: white canvas (`#FFFFFF`), ink text (`#1A1A1A`), temple red (`#C62828`), sand yellow (`#E6C068`), warm gold (`#B8860B`). Region pigments and deity hues are derived from this palette in `lib/regions.ts` and `DESIGN_SYSTEM_V2.md` §1.4–1.5.
- **No dark mode.** The brief is light-mode only. The "nightstone" tokens in `tailwind.config.ts` and `globals.css` are pending replacement — see `REDESIGN_PLAN.md` §2.1–2.2.

### Out of scope (permanent)

These are in the approved architecture but explicitly **out of scope for the prototype** and deferred to a future production build:

- Multi-language content (UI chrome only; English + 7 placeholders).
- User accounts, saved temples, trip planning.
- Real CMS / authoring tools.
- Real video content (schema is ready).
- State, deity, and region landing pages.
- A blog / editorial content for SEO.
- Server-side search index (Fuse.js, Meilisearch).
- Booking / "Plan visit" with third parties.
- Mobile app.
- Dark mode.
- Real-time data (festivals, timings).
- Static generation at 20,000+ (a known scale step, deferred).

The prototype does not pretend to address these. The full deferral list is in `REDESIGN_PLAN.md` §18 and `PROJECT_CONTEXT.md` §11.3.

## Tooling notes

- ESLint (`next/core-web-vitals`) ignores `.agents/`, `.claude/`, `skill-observations/`, `skill-updates/`.
- `tsconfig.json` excludes the same directories and uses path alias `@/*` → repo root.
- `next.config.mjs`: `output: "standalone"` (for the Dockerfile), `reactStrictMode: true`, `experimental.viewTransition: true`.
- No Cursor or Copilot rules are present; project conventions live in `DESIGN.md`, `IMPLEMENTATION_PLAN.md`, and this file.
