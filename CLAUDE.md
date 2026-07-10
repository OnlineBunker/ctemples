# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is deliberately **thin**: it covers operations only. Every product, UX, design, content, and architecture decision lives in the master specification at **`docs/01–14`** — that spec is canonical and this file must never contradict it.

## Read this first

1. **`PROJECT_CONTEXT.md` §Build status** — the only source of truth for what is actually implemented.
2. **`docs/13_IMPLEMENTATION_MASTER_PLAN.md`** — the active phase, its scope, and its gates.
3. The phase's normative spec files (listed in file 13), always including `docs/01_PRODUCT_NORTH_STAR.md` (the decision register D1–D27) and `docs/14_CLAUDE_CODE_OPERATING_SYSTEM.md` (the working protocol this file summarizes).

**Precedence:** `docs/01–14` > this file > legacy docs (`UX_SPEC.md`, `DESIGN_SYSTEM_V2.md`, `REDESIGN_PLAN.md`, `IMPLEMENTATION_PHASES.md`, `DESIGN.md` — all banner-marked as superseded, kept for history only). Do not cite legacy docs as authority. Do not make product decisions — if the spec is silent, stop and escalate with a recommendation (file 14 §6).

## Project

CTemples: a tourism-first encyclopedia of India's temples (Next.js 15 frontend prototype, static data, no backend yet), scaling by design from 15 placeholder records to 20,000+. Identity: "Modern Utsavam" — porcelain canvas, magenta/coral/saffron/turmeric/plum, Bricolage Grotesque/Inter/Space Mono (+ Noto Sans Telugu hero accent). Full identity and quality bars: `docs/01`, `docs/03`.

Stack: Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v3 · Framer Motion · native View Transitions (`experimental.viewTransition`) · lucide-react · next/font.

## Commands

```bash
npm install            # first run needs network (next/font downloads)
npm run dev            # http://localhost:3000
npm run build          # production build (kill stray `next dev` first — parallel builds corrupt .next)
npm run start
npm run typecheck      # tsc --noEmit
npm run test           # vitest — lib/**/*.test.ts only (components verify in browser)
npm run test:watch
npm run lint
docker build -t ctemples . && docker run -p 3000:3000 ctemples
```

Single suite: `npx vitest run lib/<name>.test.ts`.
**Never run `npm audit fix --force`** — it downgrades Next.js and breaks the app.

## Architecture map

- `data/temples.ts` — the content array (single source; being staged toward files/CMS per `docs/11`).
- `lib/temples.ts` — **the data seam**: the only module pages import for data. Pure helpers live in `lib/temple-queries.ts`, `lib/filter.ts`, `lib/search.ts`, `lib/format.ts`, `lib/deities.ts`, `lib/media.ts`, `lib/distance.ts` (all unit-tested, no data imports). `lib/types.ts` is the schema; `lib/validate.ts` guards the data.
- `app/` — routes per `docs/02 §1.1`. `components/` — brand/home/explore/temple/media/motion/ui/layout, specced in `docs/03–08`.
- Path alias `@/*` → repo root. `next.config.mjs`: `output: "standalone"`, `experimental.viewTransition: true`.
- Transitional note: pages not yet rebuilt under the current identity are converted **only** by their owning phase (`docs/13`) — never piecemeal.

## Working rules (digest of `docs/14` — that file governs)

- **Every phase gate:** typecheck + test + lint + build green → browser-verify changed surfaces (desktop + 375px, keyboard pass) → adversarial review, fix confirmed findings → update `PROJECT_CONTEXT.md` §Build status **in the same commit** → commit + push.
- **Git:** commit as the user's configured identity (verify `git config user.name/email` first; never override, never invent). **No `Co-Authored-By: Claude` trailers. No force push.** Check `gh auth status` before pushing (multiple accounts on this machine; active must be OnlineBunker). Direct push to `master` is this repo's established mode.
- **Standing prohibitions:** new runtime deps (sole sanctioned exception: Radix Popover/Dialog, D19) · WebGL/3D in UI (D3) · autoplay/ambient loops (`docs/08`) · hardcoded dataset counts · fabricated statistics (D12) · dynamic Tailwind classes for data-driven colors · hand-editing generated artifacts (`lib/india-geo.ts`, `data/popularity.json`).
- **Decisions made in chat must be written into the spec before implementation.** Unwritten decisions don't exist.
