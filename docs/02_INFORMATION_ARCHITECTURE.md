# 02 — Information Architecture

> **CTemples Master Specification, file 2 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: CLAUDE.md §"Information architecture"/"URL contracts", UX_SPEC §2.1/§5, PROJECT_CONTEXT §2. Conflicts resolved here: A1 (D4), A2 (D5), B3 (D6), A9 (D7), B10 (D9).

---

## 1. Sitemap

### 1.1 Prototype routes (complete list — nothing else exists)

| Route | Renders | Rendering mode |
|---|---|---|
| `/` | Homepage (file 04) | SSG |
| `/explore` | Explore, list mode default (file 05) | dynamic (reads searchParams) |
| `/explore?view=map` | Explore, map mode (files 05, 07) | dynamic; map bundle `next/dynamic` |
| `/temples/[id]` | Temple page (file 06) | SSG via `generateStaticParams` |
| `/about` | About + embedded methodology content | SSG |
| `/methodology` | Thin route rendering the same methodology content (D7) | SSG |
| `/contact` | Partner-inquiry form, UI-only | SSG |
| `/suggest` | Suggest-a-temple form, UI-only | SSG |
| `not-found` | 404 | static |

**Rules:** There is no `/states/[slug]`, `/deities/[slug]`, `/regions/[slug]`, or `/blog` in the prototype — state, deity, and region are Explore filters. No API routes. Forms never submit anywhere (visible "prototype — nothing was sent" notice; no fake success).

### 1.2 Reserved production routes (do not implement in prototype; do not squat their paths)

| Route | Purpose | Unlock condition |
|---|---|---|
| `/states/[slug]` | State landing page (SEO surface, file 12 §7) | Production + Tier-1 content coverage for the state |
| `/deities/[slug]` | Deity landing page (file 12 §7) | Production |
| `/festivals/[slug]` | Festival landing (far future) | Editorial program exists |
| `/api/suggest` | Typeahead endpoint (file 10 §6) | Stage B+ (file 11) |
| `/sitemap.xml`, `/sitemap/[id].xml` | Sharded sitemaps (file 12 §5) | Production index flip |

## 2. The header and footer (navigation system)

**Header (all breakpoints, sticky, porcelain/90 + blur, 1px `line` bottom hairline):**
- Logo (gopuram mark + "Ctemples" wordmark) → `/`.
- Desktop nav: `Explore ▾` dropdown (All temples `/explore`; Pilgrimage `/explore?tag=pilgrimage`; Architecture `/explore?tag=heritage`; Discover `/explore?sort=popularity`) — note these are **list-mode** links per D4 and use real, resolvable params (the legacy `?preset=` param is retired; see §3.6). `About` → `/about`.
- Search button (icon) → opens the search overlay (file 10 §6); Cmd/Ctrl-K equivalent (D21).
- Language pill "EN ▾": 8 languages listed, non-English marked "Coming soon", non-selectable.
- Mobile: logo + search icon + hamburger → full-screen sheet (focus-trapped, Esc closes) with the same items plus "Suggest a temple".

**Footer (3 columns desktop / 1 mobile):**
- About: mark, one-liner, `About` → `/about`, `Methodology` → `/methodology` (D7).
- Contribute: `Suggest a temple →` `/suggest`; `Partner with us →` `/contact`.
- Connect: social placeholders (UI-only), map-data attribution line (D16, file 07 §2.4), copyright, "v0.1 prototype" tag.

**Back-link pattern (D8):** temple pages render "← Back to [state] temples" → `/explore?state=<state-slug>` above the hero. No breadcrumbs anywhere in the prototype (JSON-LD BreadcrumbList arrives with production SEO, file 12 §3 — markup-only, no visual breadcrumb).

## 3. URL contracts (locked)

### 3.1 `/explore` parameters

| Param | Values | Default | Notes |
|---|---|---|---|
| `view` | `list` \| `map` | `list` (D4) | presentation only; never changes the result set |
| `q` | free text | — | alias-aware (file 10); URL-encoded |
| `exact` | `1` | absent | disables alias expansion for `q` (set by dismissing the smart-match banner, file 05 §3.4); meaningless without `q`; dropped when `q` clears |
| `state` | state slug (`slugify(stateName)`, e.g. `tamil-nadu`, `jammu-and-kashmir`) | — | single-select |
| `deity` | one of `shiva\|vishnu\|devi\|ganesha\|murugan\|hanuman` | — | single-select (D11) |
| `tag` | tag slug; **repeats**, max 3 (D5) | — | site-built links alphabetize; 4th+ ignored |
| `sort` | `rating` \| `popularity` \| `name` | `rating` (D6) | legacy `featured`→`rating`, `cost`→`rating`, `alpha`→`name`, silently |
| `page` | integer ≥ 1 | 1 | out-of-range clamps to nearest valid |
| `religion` | **reserved** — `hindu\|jain\|buddhist\|sikh` | — | v2 only; prototype ignores it |

**Round-trip law:** every filter, sort, mode, and page change updates the URL **via App Router navigation** — `router.replace(url)` for continuous input (typing/debounce), `router.push(url)` for discrete choices (filter select, sort, mode), real `<Link>`s for pagination — so the server component re-renders with the new `searchParams`. (Never `history.pushState`-style "shallow" updates: they don't re-run server components, so results would never change.) Refresh/back/forward restores exact state; any Explore URL is shareable. The page never stores filter state anywhere the URL doesn't.

**Unknown/invalid values:** ignored silently and dropped when the site next builds a URL (no error states for bad params). Unknown params are preserved on navigation only if harmless (`utm_*`), otherwise dropped.

### 3.2 `/temples/[id]`

Takes **no query parameters**. `[id]` is the temple slug. Unknown slug → check `slugHistory` (production: 301 to current slug; prototype: 404). 404 renders `not-found` with "Back to home" + "Explore temples" CTAs.

### 3.3 Canonicalization matrix (production; harmless no-ops in prototype)

| URL state | Canonical | Indexable |
|---|---|---|
| `/explore` (no params) | self | yes |
| `?state=X` or `?deity=X` or single `?tag=X` | self (params alphabetized: deity, state, tag, then sort/page if non-default) | yes |
| `?q=…` (with or without `exact`) | `/explore` | no |
| ≥2 tags, or state+deity+tag combos beyond 2 facets | `/explore?<first facet>` | no (D5) |
| `?view=map&…` | same URL without `view` (D4) | no |
| `?sort=` non-default or `?page=` ≥2 | self | yes (rel prev/next dropped — Google ignores; rely on crawlable pagination links) |
| legacy sort values | 301 to coerced value | — |

### 3.4 Slug & redirect policy (D14)

Slugs are minted once (progressive disambiguation: `name` → `+city` → `+state` → `+geohash5`), frozen forever, and registered in `data/slug-registry.json`. A rename appends the old slug to `slugHistory`; redirects are generated from it (`next.config` `redirects()` at Stage B; middleware lookup at Stage C+). No slug is ever recomputed from a name change.

### 3.5 The "Your state" affordance

`localStorage["ctemples:your-state"]` stores a state slug. It **personalizes defaults only** (pre-fills the state filter chip and the map's initial selection); it never changes URL semantics — a shared URL renders identically for everyone. If unset or storage unavailable: "Pick your state for local results →" inline dropdown; no error.

### 3.6 Retired params

`?region=` and `?preset=` (legacy header/homepage links) are retired: region intent is expressed via the map's region pills (client-side, not URL) or a `state`/`tag` filter; presets become real filter URLs. Old URLs with these params must not 404 — the params are ignored per §3.1's invalid-value rule.

## 4. Discovery model (state / deity / religion)

- **State discovery:** homepage state strip (top-6 by count + "See all") → popover of top temples → `/explore?state=X`. Map mode selects states geographically. States are derived from data (D9): the *filter list* enumerates only states with ≥1 temple; the *map geometry* always renders all 36.
- **Deity discovery:** homepage deity tiles (six, icon-led) → `/explore?deity=X`. Membership = curated `deities[]` in production, keyword-matcher in prototype (D11). Zero-count deities show "Explore →" instead of a count — never "0 temples".
- **Religion:** a schema facet from day one (file 09 §2), a *filter* only in v2 (`?religion=` reserved). Non-Hindu sites (the dataset already includes a gurdwara) are first-class records discoverable via search, state, tags, and map — the deity tiles are explicitly not their only path.
- **Region:** a display grouping (six regions, pigment-coded) — never a route, never a URL param (see §3.6).

## 5. Rationale

List-default (D4) wins on: LCP (map bundle stays out of the critical path), immediate content value (a list shows temples in one paint; a map needs a second interaction), scale (pagination is O(page), map needs clustering), and CLAUDE.md's own precedence rule. Repeated tag params (D5) match Next's native `searchParams` array handling and avoid comma-encoding ambiguity. Coercing legacy sort values (D6) keeps every previously-shared URL working. The thin `/methodology` route (D7) costs one file and buys a permanent E-E-A-T anchor (file 12).

## 6. Acceptance criteria

- `/explore` with zero params renders list mode, sorted by rating, page 1 — byte-identical for all users.
- Setting each param, refreshing, and using back/forward reproduces exact UI state; a pasted URL reproduces it on another machine.
- `?tag=a&tag=b&tag=c&tag=d` applies exactly a,b,c; `?sort=cost` behaves as `?sort=rating`; `?view=banana` behaves as list.
- Every nav element is keyboard-operable; the mobile sheet traps focus; skip-link is first focusable on every route.
- No route outside §1.1 resolves in the prototype; `/methodology` renders with status 200.

## 7. Anti-patterns

- Storing filter state in React state/context/localStorage instead of the URL.
- Adding a route because a section "deserves a page" (state/deity landings are production-gated).
- Emitting `?view=map` links from non-geographic contexts (cards, chips, search results).
- Comma-joined tags, `?preset=`, `?region=`, or any new param without amending this file first.

## 8. What Sonnet does next

Phase 3 (file 13): implement `/explore` list mode against §3.1 exactly — including param parsing with the coercion/ignore rules, URL-building helpers that alphabetize tags and strip defaults, and round-trip tests (parse→build→parse is identity). Update header Explore-dropdown links to §2's real URLs when touching the header.
