# 05 — Explore Experience

> **CTemples Master Specification, file 5 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: UX_SPEC §2 and §8.1–8.3, CLAUDE.md "Filter popovers". Rulings carried: D4, D5, D6, D19, D25. URL grammar lives in file 02 §3; map internals in file 07; search internals in file 10. This file owns the page.

---

## 1. Page contract

`/explore` is the only browsing surface. Two presentations of one result set: **list** (default, D4) and **map** (`?view=map`, lazy-loaded). The URL is the complete state; the page is a server component reading `searchParams` and calling **one** data function: `queryTemples(TempleQuery)` (D25) — which returns `{ items, total, page, perPage: 24, totalPages, matchedAliases, facets }`. Nothing else touches data.

**Page title (H1):** "Explore" bare; "Explore · {summary}" when filtered, where summary = first active facet's label ("Explore · Tamil Nadu", "Explore · Shiva", "Explore · 'mahadev'").

## 2. Common chrome (both modes)

- **Mode toggle:** two-segment pill (List | Map), right of the H1. Active segment magenta-soft bg + magenta-deep text; `role="tablist"` is **not** used (it's navigation, not tabs) — two links preserving all other params, `aria-current` on active. Toggling resets scroll to results top.
- **"Your state" pill** (file 02 §3.5): if `localStorage` has a state and no `?state=` is set: "Showing near you: {State} · Change" as a dismissible suggestion chip that *offers* the filter (click applies `?state=`), never auto-applies it (URLs stay universal). Without storage: "Pick your state for local results →" opens the state filter.
- **Result count line** (mono, ink-muted, `aria-live="polite"`): template `"{total} temples · showing {from}–{to}"`; with state filter: `"{total} temples in {State} · showing {from}–{to}"`. Singular handled ("1 temple"). Never a hardcoded number (B6).

## 3. List mode

Single column: search bar → filter row → active-filter chips → smart-match banner (conditional) → result grid → pagination.

### 3.1 Search bar
Full-width (max 640px), file 03 §6.6 tokens. Placeholder: "Search temples, deities, places…". Debounce 300ms → `router.replace` with the new `?q=` (App Router navigation per file 02 §3.1 — the server component re-renders; input focus is preserved because the bar is a client island); Enter commits immediately via `router.push`; × clears `?q=` (and `exact`) and refocuses. The header overlay (file 10 §6) is the *quick* entry; this bar is the *persistent* one — same engine.

### 3.2 Filter row — exactly four (locked): State · Deity · Tag · Sort
Trigger buttons (secondary-button styling, chevron; active filters show "{Facet}: {value}" and a magenta-deep dot). All popovers = Radix (D19) per file 03 §6.4.

| Filter | Popover contents | Behavior |
|---|---|---|
| State | type-ahead input + list of states **derived from data** (`facets.states`, each "{State} ({n})"), alphabetical | single-select; radio semantics |
| Deity | the six (D11), icon + label + derived count | single-select |
| Tag | checkbox list from `facets.tags` (top 12 by count + type-ahead for the rest) | multi ≤3; 4th check blocked with inline note "Up to 3 tags at a time" (`role="status"`) |
| Sort | Top rated / Most visited / A–Z (`PUBLIC_SORT_OPTIONS`, D6) | single-select; default Top rated |

Facet options never show zero-count entries **except** the currently-selected value (so deselection is always possible).

### 3.3 Active-filter chips
Below the row when ≥1 non-default filter: removable chips (file 03 §6.3) — "Tamil Nadu ×", "Shiva ×", "tag ×"…, plus "Reset all" (tertiary button) which returns to bare `/explore`. Sort shows a chip only when non-default ("Sort: A–Z ×" → resets to rating).

### 3.4 Smart-match banner (alias hits)
When `matchedAliases.length > 0` and `exact` is not set: banner above results — magenta-soft bg, magenta-deep text, `role="status" aria-live="polite"`, dismissible ×. Copy template: `"Showing {canonical label} results for '{original query}'"` (e.g. "Showing Shiva results for 'mahadev'"; temple-target aliases: "Showing Jagannath Temple, Puri for 'jagannath'"). **Dismissal navigates to the current URL + `exact=1`** (file 02 §3.1) — alias expansion is disabled server-side, the banner disappears (no aliases fire), and the state round-trips/shares like everything else. Clearing or changing `q` drops `exact`.

### 3.5 Result grid
1/2/3 columns of TempleCard (the morph source). Cards from `items` (`TempleSummary` projection — pages never receive full records, D25). First 4 images eager (no priority), rest lazy. Order is exactly the server order — no client re-sorting.

### 3.6 Pagination
File 03 §6.9. 24/page. Page links are real `<a>`s preserving all params; out-of-range clamps (file 02 §3.1).

## 4. Sort semantics (D6)
`rating`: rating desc, name asc. `popularity`: `popularity.score` desc (prototype: committed snapshot ordinal, D12), rating desc, name asc — labeled "Most visited". `name`: locale-aware A–Z. Legacy values coerced silently (file 02 §3.1).

## 5. Empty & edge states (derived copy templates)

| Case | Title | Body | CTA |
|---|---|---|---|
| Filters match nothing | "No temples match your filters." | "Try removing a filter or broadening your search." | Reset all filters |
| Query matches nothing | "No temples match '{q}'." | "Try a deity (Shiva, Vishnu, Devi), a state, or a city." | Clear search |
| Map: no state selected, no stored state | (results column) "Pick a state on the map to see its temples." | — | — |
| Map: selected state has none | "No temples in {State} yet." | "We're always adding more." | Browse all temples (→ list) |
| Page out of range | render nearest valid page | — | — |

All per file 03 §6.10; announced via `role="status"`.

## 6. Map mode (`?view=map`)

- **Desktop ≥lg:** two-pane — map 60% (file 07 §3), results column 40% (sticky, own scroll).
- **Mobile:** map 40vh sticky top; results in the **bottom sheet** (file 03 §6.8): peek (handle + "{State} · {n} temples" or "Pick a state"), half (compact list), full (list + the same four filters). Drag between snaps; focus trapped at half/full; Esc → peek; reduced-motion per file 08 §7. Documented fallback if iOS Safari fights the snap logic: fixed full-screen sheet with open/close only — ship it rather than a janky drag.
- **Results column contents:** H2 "{State}" + derived count (or the pick-a-state empty state); search input scoped to the state ("Search temples in {State}…" — composes `q` + `state` in the same `queryTemples` call); sort control (same three); vertical card list (compact horizontal TempleCard variant: 96×72 4:3 thumb, name, city, rating); pagination.
- Selecting a state (map or list) syncs `?state=`; everything round-trips.
- The map bundle (`IndiaMap`, sheet, geometry) loads via `next/dynamic` only in map mode; list mode never pays for it.

## 7. Loading & transitions
Server-rendered; filter/sort/page changes re-render via navigation — content swaps directly (no reveal animations, file 08 §4; no skeletons). A 16px magenta spinner (`role="status"`, "Loading") may appear inline next to the count line during slow transitions (React `useLinkStatus`/pending UI), nothing else.

## 8. Rationale
One data call (`queryTemples`) is what makes list and map two views of one truth and makes the 20k backend swap invisible (D25). Radix for exactly this surface (D19): four interacting popovers with type-ahead is where hand-rolled focus code historically breaks. 24/page balances scroll depth against click depth at 20k (834 pages worst-case bare — acceptable because bare-browse is not a real journey; filters and search are).

## 9. Acceptance criteria
- Round-trip: for every reachable UI state, URL→UI and UI→URL→refresh→UI are identical; back/forward walks filter history correctly.
- `queryTemples` is the page's only data import; no component receives a full `Temple`.
- Keyboard-only: complete a filter-search-paginate-open-temple journey without a pointer; all four popovers trap focus, Esc-restore, outside-click close.
- Tag filter physically cannot exceed 3; facet lists show no zero-count options (except selected); every count derived.
- Map mode: list↔map toggle preserves every filter; mobile sheet reaches all three snaps by drag and by keyboard.
- Lighthouse: list ≥90 / map ≥85; map JS absent from list-mode bundle.

## 10. Anti-patterns
- Client-side filtering/sorting of received items ("it's only one page of data" — no).
- A fifth filter, an "All filters" drawer, or filter state outside the URL.
- Skeleton grids, reveal-wrapped results, spinner overlays that block the old results (content replaces content).
- Auto-applying the stored "your state" to the URL (personalization ≠ shared state).

## 11. What Sonnet does next
**Phase 3** (file 13): implement list mode end-to-end against §1–5 + file 02 §3 (including `queryTemples` over the in-memory array, D25), replacing `explore-client.tsx`/`filter-chip.tsx`; execute file 04's [DELTA] URL migrations in the same phase. **Phase 4:** map mode per §6 + file 07. Golden-query tests (file 10 §8) land with Phase 3's search wiring.
