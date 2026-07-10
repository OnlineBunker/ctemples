# 10 — Search & Discovery System

> **CTemples Master Specification, file 10 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: UX_SPEC §4, CLAUDE.md "Search". Rulings carried: D10, D12, D21, D25. Current implementation: `lib/search.ts` + `lib/search-aliases.ts` (deity-only aliases — upgraded by this file).

---

## 1. Principles
One engine, every entry point. Server-side only — no client-side search computation, ever (payload + spec law). The return contract `{ results, matchedAliases }` and the `?q=` URL semantics are frozen; everything behind them may be swapped.

## 2. Ranking formula (canonical)
```
score = 2.0×(alias hit: deity/place/tag)  + 2.5×(alias hit: temple — pins the target)
      + 1.5×(deity match)  + 1.2×(name exact/prefix)
      + 0.8×(city|state contains)  + 0.5×(tag contains)
      + 0.3×(overview|history contains)
      + rating_bonus  // clamp((rating−3.5)×0.5, 0, 0.5); 0 when unrated
```
Zero-score records are excluded. Ties: score → rating → name. Empty query = full list by rating (Explore default order). At the engine swap (§7) these weights become *behavioral* targets, not literal transplants — the golden-query suite (§8) is the contract.

## 3. Search fields — the `SearchDoc` projection **[NOW at Stage B, design now]**
Scoring never touches full records: `buildSearchDocs()` projects `{ uid, slug, name, nameLower, altNames[], deityProse, deities[], city, state, stateSlug, tags[], taglineLower, overviewExcerpt (300ch), historyExcerpt (300ch), rating?, popularityScore, tier }` — pre-lowercased at build. This kills the per-query re-lowercasing of full prose (the current implementation's scale ceiling) and *is* the future index document.

## 4. Alias architecture (D10)
```ts
export type AliasTarget =
  | { type: "deity"; key: DeityKey }
  | { type: "temple"; slug: string }
  | { type: "place"; city?: string; stateSlug?: string }
  | { type: "tag"; tag: string };
export interface SearchAlias { alias: string; targets: AliasTarget[]; note: string /* required why-doc */ }
```
- Composable: `jagannath → [deity:vishnu, place:{city:"Puri"}]`; `balaji → [deity:vishnu, temple:"tirumala-venkateswara-temple"]`; `mahadev → [deity:shiva]`; `ayyappa → [place/temple targets]` — never a 7th deity (D11).
- **Per-token matching** (fixes the current whole-query-only limitation): tokenize the query, longest-alias-first scan, each fired alias contributes its targets' boosts; `matchedAliases` = fired alias keys (shape unchanged → banner unchanged).
- Weights per target type: temple +2.5 (pin), deity/place +2.0, tag +1.5.
- Governance: aliases are data (`lib/search-aliases.ts` now, CMS collection later); every entry carries `note`; **CI resolves every target** (deity key exists, slug in registry, city/state in dataset, tag in registry) — a typo'd alias cannot ship. Alias edits never require reindexing (applied at query time, in front of any engine).
- Banner copy resolves the canonical label from the first target: deity → DEITY_META label ("Showing Shiva results for 'mahadev'"); temple → temple name.

## 5. Scale path (quantified) & engine decision
- **15 records:** current pure scan — fine (<1ms).
- **~2,000:** full-record scan ≈ 30–40MB transient string allocation/query → GC-bound p95 on serverless. The §3 projection (~50× less allocation) buys headroom to ~2–3k. **Trigger to move: >2k records or p95 search >100ms.**
- **20,000:** any O(n) per-request scan is dead (memory + CPU + no typo tolerance). **Engine = Meilisearch** (D25): zero-config typo tolerance; ranking rules map to our attribute hierarchy; `facetDistribution` powers file 05's facets for free; `_geo` replaces radius scans; one small binary (~20MB index for 20k docs). Rejected: Typesense (parity, weaker fit for facet/ranking ergonomics here), Fuse-at-build (O(n), no facets, huge client/lambda payload), pg_trgm (weeks of bespoke SQL for worse ranking; acceptable only as degraded fallback).
- Meili settings (recorded for Stage C): `searchableAttributes: [name, altNames, deityProse, city, state, tags, taglineLower, overviewExcerpt]`; `rankingRules: [words, typo, proximity, attribute, sort, exactness, popularityScore:desc, rating:desc]`; `filterableAttributes: [stateSlug, deities, tags, religion, tier, featured, _geo]`; `sortableAttributes: [popularityScore, rating, name]`. Alias boosts via `multiSearch`: filtered query (targets) + plain query, merged filtered-first, deduped by uid.

## 6. Entry points
1. **Explore search bar** — file 05 §3.1 (300ms debounce → `?q=`).
2. **Header overlay** (Phase 6): opens from the header button or **Cmd/Ctrl-K** (D21 — no-op when focus is in input/textarea/contenteditable; `⌘K` hint rendered on the trigger). Desktop: 480px anchored panel (z-70); mobile: sheet at half snap. Contents: input; live top-6 results (150ms debounce, min 2 chars, AbortController-cancelled); each result = thumb (32px, TempleScene fallback) + name + "{city}, {state}" + alias chip when fired ("matched: mahadev → Shiva"); footer link "See all results for '{q}' →" → `/explore?q=…`; empty input shows the popular-search chips. Keyboard: ↓↑ rove (`role="listbox"/"option"`, `aria-activedescendant`), Enter opens highlighted (or Explore when none), Esc closes. Results count announced politely.
3. **Typeahead data path:** prototype/Stage B — server action or route handler over the in-memory docs; Stage C+ — `GET /api/suggest?q=` → Meili `limit: 7`, response ≤2KB `{ type: temple|place|deity, label, sublabel, slug }` grouped Temples/Places/Deities, `s-maxage=86400` + SWR (suggestions tolerate staleness). No images beyond the 32px thumb already in-payload; no client-side corpus.

## 7. Contract preservation through the swap
`searchTemples(list, q, opts)` becomes seam-internal; pages call `queryTemples` (D25) which returns `matchedAliases` through `PagedTemples`. The adapter (in-memory now, Meili later) owns: alias expansion (ours, in front of the engine — skipped entirely when the query carries `exact=1`, file 02 §3.1), scoring/querying, and the projection back to `TempleSummary`. `TempleQuery` gains `exact?: boolean` accordingly. URL semantics, banner behavior, and result shapes never change.

## 8. Golden-query suite (the behavioral lock) **[NOW with Phase 3]**
~15 canonical queries asserting top-3 membership/order, run in CI, updated only via file-14 amendment: `mahadev` → Shiva temples, alias fires · `balaji` → Tirumala #1 · `jagannath` → Puri #1 · `madurai` → Meenakshi #1 · `varanasi` → Kashi Vishwanath #1 · `golden temple` → Amritsar #1 · `jyotirlinga` → only Jyotirlinga-tagged, rating-ordered · `unesco` (via tag alias) → the three UNESCO records · `meenakshee` (typo) → Meenakshi top-3 [activates with Meili; in-memory engine exempt] · `tamil nadu` → TN temples · `sun temple` → Konark #1 · `shiva` → Shiva set, rating-ordered · `himalayan` → Kedarnath present · `kanchipuram` → place-alias behavior (no dataset match today → zero results until such a temple exists; the alias may still ship) · empty → rating order. Engine swaps must pass this suite unchanged.

## 9. Acceptance criteria
- Same query → same results via Explore bar, header overlay, and direct URL (one engine).
- Alias CI: introducing `{ alias: "xyz", targets: [{type:"temple",slug:"nope"}] }` fails the build.
- Per-token: "mahadev temple ujjain" fires the mahadev alias.
- Header overlay: fully keyboard-operable; zero requests before 2 chars; in-flight cancelled on keystroke; Cmd-K guard works in the search input itself.
- No fabricated result metadata (no invented "popularity" numbers in UI — D12).
- Golden suite green in CI at every stage.

## 10. Anti-patterns
- Client-bundled indexes (Fuse in the browser); fuzzy-matching hand-rolled in JS; alias logic inside the engine (mappings/synonyms configured per-engine) — aliases stay in our data layer; widening weights ad-hoc to fix one query (fix via alias or golden-suite amendment); a second "smart results" tab (one ranked list, always).

## 11. What Sonnet does next
**Phase 3:** wire Explore to `queryTemples`; ship the golden-query suite (in-memory expectations). **Phase 6:** header overlay + Cmd-K + the D10 alias upgrade (type change in `lib/search-aliases.ts` + per-token matching in `lib/search.ts` + target-resolution CI test) + typeahead path. **Stage B+ (file 11):** `SearchDoc` projection; **Stage C:** Meili adapter behind the same seam, gated by §8.
