# CTemples — Design Rationale ("Modern Utsavam")

> The visual and tonal direction for CTemples. This supersedes the older dark
> "nightstone" rationale. It records *why* the system looks the way it does; the
> token/component specifics live in `DESIGN_SYSTEM_V2.md`, and the canonical hexes
> live in `tailwind.config.ts`.

## The idea

CTemples is a Wikipedia-deep, travel-magazine-warm encyclopedia of Indian temples.
The identity is **light, vibrant, premium, and tourism-first** — an *utsavam*
(festival) feeling made calm and modern, not a museum and not a brochure.

The direction is anchored to an approved visual reference: bold grotesk display type,
saturated magenta-to-saffron gradients, and kolam-inspired geometry on a calm
porcelain canvas. Confident and contemporary — unmistakably Indian, unmistakably modern.

## Palette

A porcelain canvas with a festival pigment box. Colour is used with intent: one
magenta call-to-action per surface, saffron/turmeric for warmth and highlights,
plum for depth and display type.

| Token | Hex | Role |
|---|---|---|
| `porcelain` | `#FBF6F0` | Page canvas |
| `canvas` | `#FFFFFF` | Elevated surfaces (cards, menus, sheets) |
| `ink` | `#241021` | Body text (plum-tinted charcoal) |
| `plum` | `#3D0A40` | Display headings, deep surfaces |
| `magenta` | `#E5006D` | Primary CTA, links, brand emphasis |
| `coral` | `#FF3D6E` | Secondary accent, gradient mid-stop |
| `saffron` | `#FF7A00` | Warm accent, gradient end-stop |
| `turmeric` | `#FFC300` | Highlights, star fills, "featured" |
| `line` | `#ECE0D6` | Warm hairlines, card borders |

**The signature gradient** (`bg-utsavam`) runs magenta → coral → saffron at 135°. It
is reserved for the primary CTA and a small number of accent/imagery panels — never
behind body text.

### Aliasing note

The Phase-1 chrome was built on earlier semantic names. Those are kept as **aliases**
so the chrome adopts the palette with no edits: `temple-red → magenta`,
`sand-yellow → turmeric`, `warm-gold → saffron`. New code should prefer the reference
names (`magenta` / `coral` / `saffron` / `turmeric` / `plum`).

## Typography

- **Display — Bricolage Grotesque.** A warm, slightly humanist grotesque with an
  optical-size axis; carries the confident festival headline voice.
- **Body — Inter.** Neutral, highly legible for long reading and dense UI.
- **Utility / data — Space Mono.** Eyebrows, coordinates, fees, indices — the
  "field-guide" layer.
- **Telugu accent — Noto Sans Telugu.** A tasteful bilingual flourish in the hero
  (e.g. *పవిత్ర దేవాలయాలు*). The prototype's content remains English-only; Telugu is
  decoration here, not a translation layer (multi-language content is deferred).

All four are self-hosted via `next/font` (no runtime request to Google).

## Motion & imagery

- Restrained motion: scroll reveals (16px rise + un-blur, ~350ms), a gentle page
  crossfade, and the one signature card → hero morph. No ambient loops, no autoplay.
  `prefers-reduced-motion` is a floor.
- Kolam-inspired line geometry (concentric arcs, octagons) is the graphic motif for
  decorative fills — light, never load-bearing.
- Real photography is placeholder Wikimedia imagery; every image degrades to the
  procedural daytime `TempleScene` so nothing ever shows a broken frame.

## Prototype honesty

Light mode only. Forms are UI-only. Nothing hardcodes the current dataset size — every
count, tile, and filter derives from `data/temples.ts`, so the full 20,000+ library
drops in without touching pages.
