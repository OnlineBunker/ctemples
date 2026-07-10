# 11 — Backend Evolution Plan

> **CTemples Master Specification, file 11 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> New territory (no legacy doc covers this). Rulings carried: D24, D25. Companion files: 09 (schema/pipeline), 10 (search), 12 (SEO flips).

---

## 1. The one architectural bet
`lib/temples.ts` is the **seam**: pages import data functions only from it, so the store behind it can change four times without touching a page. Everything in this file protects that seam.

## 2. The stages (D24)

| | **A — now** | **B — files** | **C — CMS** | **D — 20k** |
|---|---|---|---|---|
| Records | ≤ ~200 | ≤ ~2,000 | ≤ ~10,000 | 20,000+ |
| Store | `data/temples.ts` TS array | `content/temples/{slug}.json` + Zod | Payload CMS on Postgres | same, tuned |
| Authoring | code PRs | PRs + ingestion scripts | CMS drafts/roles/workflow (`editorial.state`) | + review queues at volume |
| Rendering | full SSG | full SSG (build ≤10min) | hybrid: prerender T1+top-T2 (~2–3k) + `dynamicParams` + `revalidate: 86400` + tag-based on-demand revalidation | same; prerender set capped regardless of catalog |
| Search | in-memory scan | in-memory over `SearchDoc` projection | Meilisearch (upsert on publish) | same |
| Images | Wikimedia hotlinks, `unoptimized` | **ingestion pipeline live** (§5) | same | same |
| **Move when** | non-engineer must edit, OR ~200 records / ~3MB TS (the compiler dies long before 20k×250KB ≈ 330MB) | >2k records, editors need workflow, build >10min, or search p95 >100ms | >10k or facet/Explore latency degrades | — |

## 3. The seam contract (D25)

**[NOW]** All `lib/temples.ts` functions become **async** (pages are already async server components; awaiting a sync value is free — this is the cheap move that prevents a 20-consumer refactor later). Mapping:

| Function | Stage D implementation | Page changes |
|---|---|---|
| `getTempleById(id)` | `findOne(slug)`, checks `slugHistory` → redirect target | none |
| `getTempleIds()` → `getPrerenderTempleIds()` | T1 + top-popularity subset | `generateStaticParams` only |
| `getFeaturedTemples` / `getTopTemplesByState` | indexed queries | none |
| `getRelatedTemples` | reads `relatedIds` — **`pickRelated` runs at publish time**, denormalized; neighbors recomputed on publish | none |
| `getRegionCounts` / `getStateCounts` / `getDeityCounts` → `getFacetCounts()` | facet snapshot, cache-tagged | none |
| `getAllTemples` | **banned from page code**; moves to `lib/temples-internal.ts` (build scripts only, ESLint `no-restricted-imports`) | Explore migrates to `queryTemples` |

**New surface [NOW, implemented over the array]:**
```ts
queryTemples(q: TempleQuery): Promise<PagedTemples>   // THE Explore call — filters+search+sort+page+facets in one
getFacetCounts(): Promise<FacetCounts>
getTemplesNear(lat, lng, km, limit?): Promise<{ temple: TempleSummary; distanceKm: number }[]>
suggestTemples(prefix, limit?): Promise<Suggestion[]>
// TempleQuery { q?, state?, deity?, tags?≤3, religion?, sort?, page?, perPage=24 }
// PagedTemples { items: TempleSummary[], total, page, perPage, totalPages, matchedAliases, facets }
```
`TempleSummary` (card projection — listings never receive 15KB records): `{ id, uid, name, city, state, region, religion, deities, tagline, hero, rating?, tags, tier, featured }`.

**Prototype derivations (Stage A — the fields that don't exist in `lib/types.ts` yet are *derived*, never invented ad hoc):** `uid` = the slug (placeholder equal to `id`; real ULIDs arrive with the Stage-B migration — until then `uid` must not be persisted anywhere external, it exists only to freeze the shape); `deities` = the existing keyword matcher (`lib/deities.ts` `matchesDeity` over the six keys); `tier` = `1` for all current hand-written records (they are the T1 bar, file 09 §1); `religion` = lowercase of the record's free-text religion mapped onto the closed union (`"Hindu"→"hindu"`, `"Sikh"→"sikh"`; unmappable values are a validation error, not a guess); `hero` = `getHero(media)`. When Stage B's migration lands real fields, these derivations delete — the projection shape never changes.

## 4. Next 15 rendering specifics (Stage C reference implementation)
```ts
// app/temples/[id]/page.tsx
export const dynamicParams = true;
export const revalidate = 86400;                       // safety-net TTL
export async function generateStaticParams() {
  return (await getPrerenderTempleIds()).map((id) => ({ id }));
}
```
Data functions wrap queries in `unstable_cache(fn, keys, { tags: ["temple:"+slug] })` (adopt `"use cache"` + `cacheTag` when stable). Payload `afterChange` → `POST /api/revalidate` (secret header) → `revalidateTag("temple:{slug}")` + `revalidateTag("temple-lists")` + `revalidateTag("facets")` + Meili upsert. Explore renders dynamically per request through `queryTemples`. Sitemaps: `generateSitemaps()` sharded per state (file 12 §5).

## 5. Image pipeline (Stage B, fixes the attribution debt)
Per media item: resolve Commons `imageinfo` (`extmetadata` → author/license, `size` → width/height) by `sourceId` → reject licenses outside the allowlist → download once (≤2560px) → store **Cloudflare R2** keyed `temples/{uid}/{n}-{contenthash}.jpg` → generate 16px webp `blurDataURL` → rewrite `MediaItem.url` to the media domain → serve via **Cloudflare Image Resizing** with a custom `next/image` loader (`images.loaderFile`). Why not the default Vercel optimizer: source-image quotas at 20k×6 images get expensive; R2 has zero egress. Why not keep hotlinking: Wikimedia discourages hotlinks at traffic (throttling, no SLA) and the prototype already saw 429s. Attribution data flows into the lightbox credit (file 06 §6).

## 6. CMS decision: **Payload CMS (v3)**
TS-native (collection config *is* TypeScript, generated types diff against `lib/types.ts`), self-hosts inside the same Next app on Postgres (no second platform), drafts/versions/access control map 1:1 onto `editorial.state`/review queues, `afterChange` hooks drive revalidation + indexing, comfortable at 20k documents. Rejected: Sanity (hosted pricing at volume, GROQ lock-in), Strapi (weaker TS/versioning), Contentful (cost, schema-in-UI), Directus (schema lives in DB, breaking types-as-contract). The Zod mirror (`lib/schema.ts`) is the single schema source for validators, ingestion, and the Payload config.

## 7. Ops floor (Stage C+)
Postgres + Meili on one small VM/container pair (or managed equivalents); nightly DB + R2 backups; Plausible/PostHog self-hosted for the popularity signal (file 09 §4); uptime checks on `/`, one temple page, `/api/suggest`; error tracking (Sentry). Degraded modes: Meili down → seam falls back to pg ILIKE prefix search (correctness over ranking); CMS down → site serves cached/static pages unaffected.

## 8. What to build NOW (prototype, zero backend) — the exact list
1. Async-ify `lib/temples.ts` + update call sites.
2. `queryTemples` + `TempleSummary` + `getFacetCounts` over the array; Explore consumes only these (Phase 3).
3. Slug registry + `lib/slug.ts` minting (file 09 §5).
4. `compute-popularity.ts` + `data/popularity.json` + filter switch (file 09 §4).
5. Tag registry + validator wiring (file 09 §6).
6. Anti-slop lint over the 15 records (file 09 §7).
7. Interim image attribution credit (file 09 §8).
8. `SearchDoc` projection + `buildSearchDocs()` (file 10 §3) — may ride with Phase 6.
9. Golden-query suite (file 10 §8).
10. Zod mirror `lib/schema.ts`.
11. Typed schema stubs for §/09 evolution (types only, zero data) where zero-cost.

Items 1–2 are Phase 3 prerequisites; 3–7 form Phase 3.5 "Content foundations"; 8–11 attach to their host phases (file 13).

## 9. Acceptance criteria
- Grep proves no page/component imports `data/temples` or calls a pure helper with the full array directly — everything routes through `lib/temples.ts`.
- Stage transitions require zero changes under `app/` except `generateStaticParams` and metadata flips (validated at Stage B by swapping the array loader for the JSON loader in a branch and diffing rendered HTML).
- The golden-query suite and the full vitest suite pass unchanged across every stage swap.
- At Stage C: publish-to-live ≤60s (webhook revalidation), build time independent of catalog size.

## 10. Anti-patterns
- Reaching around the seam "just for this one component"; shipping the CMS before Stage-B triggers fire (premature ops burden); computing facets/related per request at scale (publish-time denormalization is the model); letting build time scale O(catalog) (the prerender set is capped); mixing analytics into `visitorStat` (cited figures only, D12).

## 11. What Sonnet does next
Execute §8 items 1–2 inside Phase 3 (they're its data layer), 3–7 as Phase 3.5, per file 13's sequencing. Stage B+ work waits for its triggers — do not build ahead of them.
