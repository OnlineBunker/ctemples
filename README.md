# CTemples

A frontend prototype for a temple-tourism content platform — a cinematic guide to the
temples of India: history, legend, architecture, festivals, and honest travel costs.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React
View Transitions · react-three-fiber**. Static data, no backend.

The design rationale (palette, type, motion) lives in [`DESIGN.md`](./DESIGN.md); the
build order lives in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

---

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build (static-generates every temple route)
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
npm run test         # vitest — unit tests for the data/logic layer
npm run lint         # next lint
```

> `next/font` downloads and self-hosts the fonts at build time, so `dev`/`build` need
> network access on the first run.

---

## Adding the real content ← start here

**There is one file to edit: [`data/temples.ts`](./data/temples.ts).**

It exports a single typed array:

```ts
export const temples: Temple[] = [ /* … */ ];
```

To go live with the full library, **replace that array** with the generated one (15 now,
2,000+ later). Match the `Temple` shape in [`lib/types.ts`](./lib/types.ts) — that's the
contract. Nothing else needs to change: every page, filter, route, region count, and the
`generateStaticParams` for `/temples/[id]` all derive from this array. Nothing in the app
hardcodes the current count.

A validator guards the shape — run `npm run test` and the `placeholder dataset` suite will
flag any record with a bad slug, out-of-range rating, coordinates outside India, missing
cost estimates, etc.

### Images and video

`heroImage` and `gallery` are populated with **real, freely-licensed Wikimedia Commons
photos** (fetched from the Wikipedia media API — not hand-typed, so the URLs resolve).
`videoUrl` is still `""`, reserved for the temple film.

How images render (`components/media/temple-image.tsx` + `photo-with-fallback.tsx`):

- A real URL flows through **`next/image`** with blur-up. Wikimedia URLs are served
  `unoptimized` (browser → Wikimedia's CDN directly), because proxying 15+ images through
  the Next optimizer from one server IP gets rate-limited (429). Self-hosted images you add
  later flow through the optimizer normally.
- If any URL fails to load, it **falls back automatically** to on-brand procedural
  `<TempleScene>` art — so the grid never shows a broken image.
- An empty `""` also renders the procedural scene. Every image sits in a fixed
  aspect-ratio box, so there is zero layout shift regardless of source.

To swap in your own photography, set `heroImage` / `gallery` to your URLs and add the host
to `images.remotePatterns` in [`next.config.mjs`](./next.config.mjs).

> **Image caveat:** the placeholder photos are pulled live from Wikimedia and matched to
> each temple's Wikipedia article. They resolved at build time, but give them a quick
> visual spot-check before going live — occasionally a page's lead image is a map, crowd, or
> aerial rather than the classic hero shot.

---

## Folder structure

```
app/                      # App Router routes
  page.tsx                # Home (hero, featured, region mandala, stats)
  explore/page.tsx        # Explore — searchable/filterable grid (reads ?region=&tag=&q=&sort=)
  temples/[id]/page.tsx   # Temple detail — generateStaticParams + the long dossier
  about/ · contact/       # About + Partner (UI-only form)
  layout.tsx · globals.css · fonts.ts · icon.svg
components/
  brand/                  # GopuramMark, MandalaMark, Divider
  home/                   # Hero, RegionExplorer, HeroEmbers (r3f accent)
  explore/                # ExploreClient, FilterChip
  temple/                 # TempleCard + detail/ section components
  media/                  # TempleImage (next/image) + TempleScene (procedural art)
  motion/                 # Reveal/Stagger/Parallax, ViewTransition + TransitionLink
  ui/                     # Button, Chip/Tag, Eyebrow, Stat, Rating, SectionHeading
lib/
  types.ts                # the Temple schema (the content contract)
  temples.ts              # data-bound access layer (getFeatured, getTempleById, …)
  temple-queries.ts       # pure query helpers (unit-tested)
  filter.ts · format.ts · validate.ts · regions.ts   # pure, unit-tested logic
  *.test.ts               # vitest suites
data/temples.ts           # ← THE content array (placeholders now)
```

## The signature interaction

The Explore/showcase card image morphs into the temple's hero on navigation, using React's
native **View Transitions API** (`experimental.viewTransition` in `next.config.mjs`; the
shared `view-transition-name` and morph CSS live in `components/…/view-transition.tsx` and
`app/globals.css`). Directional page slides use `addTransitionType` via `TransitionLink`.
Everything degrades gracefully where the API isn't supported, and all of it is disabled
under `prefers-reduced-motion`.

---

## Deployment

The project is ready for both targets; the owner handles the actual deploy.

### Vercel (zero config)

Import the repo — Vercel detects Next.js. No extra settings. `output: "standalone"` is
harmless on Vercel.

### Docker / Render (container)

A multi-stage [`Dockerfile`](./Dockerfile) builds a slim `node:22-alpine` runtime from
Next's standalone output.

```bash
docker build -t ctemples .
docker run -p 3000:3000 ctemples      # http://localhost:3000
```

On Render: a Docker web service, port `3000`, no other config required.

---

## Notes

- **No backend.** The Partner form (`/contact`) is UI-only and says so — it never pretends
  to send anything.
- **`npm audit`** reports advisories in **dev-only tooling** (esbuild/vite via vitest, and a
  postcss transitively bundled inside Next). None ship in the runtime bundle. **Do not run
  `npm audit fix --force`** — it would downgrade Next.js to a v9 and break the app.
- **Accessibility & motion** are treated as a floor: semantic HTML, labelled controls, a
  keyboard-operable filter UI and lightbox, visible focus, alt text, and full
  `prefers-reduced-motion` support.
