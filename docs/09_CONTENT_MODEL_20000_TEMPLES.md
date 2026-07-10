# 09 — Content Model for 20,000+ Temples

> **CTemples Master Specification, file 9 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> Supersedes: CLAUDE.md "Schema additions", scattered schema notes. Rulings carried: D11–D15. The prototype schema in `lib/types.ts` is the current implementation; this file defines its **production evolution** and the content operation around it. Prototype-mandatory items are marked **[NOW]**; everything else activates per file 11's stages.

---

## 1. Principles

1. **Facts trace to sources; absence beats invention.** Every numeric or historical claim carries provenance; fields without sources stay empty, and the page design makes empty legal (file 06).
2. **Tier is a validation contract, not a rendering switch** (D13).
3. **Identity is immutable; presentation is editable.** `uid` never changes; slugs freeze at mint; prose can be rewritten forever.
4. **The 15 hand-written records are the quality bar** — every automated pipeline is measured against them, not the reverse.

## 2. The evolved schema (production `lib/types.ts`)

New/changed types (unchanged types — `Festival`, `CostEstimate`, `NearbyAttraction`, `Region` — omitted):

```ts
export type DeityKey = "shiva" | "vishnu" | "devi" | "ganesha" | "murugan" | "hanuman"; // moves here; lib/deities re-exports (breaks import cycle)
export type Religion = "hindu" | "jain" | "buddhist" | "sikh";
export type ContentTier = 1 | 2 | 3;
export type WorkflowState = "draft" | "in_review" | "approved" | "published" | "archived";
export type VerificationStatus = "unverified" | "machine-checked" | "editor-verified" | "expert-verified";
export type Locale = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "bn" | "mr";

export interface SourceRef { kind: "wikipedia" | "wikidata" | "osm" | "asi" | "temple-board" | "state-tourism" | "book" | "other"; label: string; url?: string; accessedAt?: string }
export interface Verification { status: VerificationStatus; sources: SourceRef[]; lastVerifiedAt?: string; verifiedBy?: string }
export interface Editorial { state: WorkflowState; tier: ContentTier; createdAt: string; updatedAt: string; publishedAt?: string }
export interface Popularity { score: number /* 0–100, never rendered */; basis: "editorial" | "wikipedia-pageviews" | "site-analytics" | "blended"; computedAt: string }
export interface VisitorStat { approxAnnual: number; year: number; source: SourceRef /* REQUIRED — no source, no display */ }

export type MediaLicense = "CC0" | "PD" | "CC-BY-2.0" | "CC-BY-3.0" | "CC-BY-4.0" | "CC-BY-SA-2.0" | "CC-BY-SA-3.0" | "CC-BY-SA-4.0" | "GODL-India" | "owned";
export interface MediaAttribution { author: string; license: MediaLicense; licenseUrl: string; sourceUrl: string /* Commons file page, not upload URL */; title?: string }
export interface MediaItem {
  kind: "image" | "video";              // "panorama" | "model" reserved (file 08 §8)
  url: string; poster?: string; alt: string;
  width: number; height: number;         // required — CLS
  blurDataURL?: string; durationSec?: number;
  attribution: MediaAttribution;         // REQUIRED (D14 — fixes live CC-BY-SA violation)
  sourceId?: string;                     // Commons file title / M-id — resync + dedup
}

export interface Temple {
  // identity
  id: string;                // canonical slug (URL contract) — §5
  uid: string;               // immutable ULID — the join key everywhere else
  slugHistory?: string[];    // → 301s
  wikidataId?: string; osmId?: string;   // dedup anchors + enrichment keys
  // facets
  name: string; state: string; city: string; region: Region;
  religion: Religion;        // closed union (was free text)
  deity: string;             // display prose, unchanged
  deities: DeityKey[];       // curated facet (D11): machine-seeded, human-confirmed; empty for non-hindu
  tags: string[];            // from the controlled registry (§6)
  // editorial spine (required at EVERY tier)
  tagline: string; overview: string;
  media: MediaItem[];        // media[0] = hero; may be [] at Tier 3 only (SVG fallback)
  coordinates: { lat: number; lng: number };
  // deep dossier (tier-gated, optional)
  whyVisit?: string;         // T1/T2 required by the tier matrix; T3 optional
  history?: string; legendsAndMythology?: string; architecture?: string; spiritualSignificance?: string;
  quickFacts?: { built?: string; dynasty?: string; architecturalStyle?: string; presidingDeity?: string };
  architecturalStyleSlug?: string;
  timings?: { opening: string; closing: string; notes?: string };
  entryFee?: { indian: string; foreign?: string; cameraOrPhoneFee?: string };
  bestTimeToVisit?: { idealMonths: string; idealTimeOfDay?: string; festivals: Festival[] };
  howToReach?: { byAir?: string; byTrain?: string; byRoad: string };
  costEstimates?: CostEstimate[]; nearbyAttractions?: NearbyAttraction[];
  tripDuration?: { temples: number; days: number; km: number };
  // ranking
  rating?: number;           // editorial 0–5; optional — stubs unrated, UI hides stars
  featured: boolean;
  heroPinned?: number;       // D27: editorial hero order (1-based); heroPool eligibility = has checklist-passing photo
  popularity: Popularity;
  visitorStat?: VisitorStat;
  // provenance & lifecycle
  verification: Verification; editorial: Editorial;
  // precomputed at publish (file 11 §3)
  relatedIds?: string[];
}

export interface TempleTranslation {  // i18n-ready, ZERO data now
  templeId: string /* uid */; locale: Exclude<Locale, "en">;
  tagline?: string; overview?: string; whyVisit?: string;
  history?: string; legendsAndMythology?: string; architecture?: string; spiritualSignificance?: string;
  // structured fields are never translated
}
```

**Notes:** `whyVisit` is optional in the type and tier-validated (T1/T2 require it; T3 may omit — empty string is always invalid). `heroImage`/`gallery`/`videoUrl` are deleted from the type when the Phase-7 consumer migration completes. Migration script for the 15 records: lowercase religion, seed `deities`, mint `uid`s, backfill attribution/width/height via the Commons `imageinfo` API, stamp editorial/verification/popularity.

## 3. Content tiers (D13) — validation matrix

| Requirement | **T1 Dossier** (~500) | **T2 Standard** (~3,500) | **T3 Stub** (~16,000) |
|---|---|---|---|
| overview | ≥120 words | ≥60 | 40–80 |
| whyVisit | ≥3 sentences | ≥2 | optional |
| history | ≥500 words | optional (≥150 if present) | — |
| legends / architecture / significance | required (≥200/≥200/≥150 w) | optional | — |
| media (attributed) | ≥6 | ≥2 | ≥0 |
| quickFacts | all 4 | ≥2 | optional |
| timings | required | required | optional — **never guessed** |
| entryFee / howToReach / bestTime | required (3 modes; months+≥2 festivals) | partial (byRoad; months) | optional |
| costEstimates / nearbyAttractions | 3–4 / ≥3 | optional | — |
| rating | required | required | optional |
| deities (hindu) | human-confirmed | human-confirmed | machine-seeded |
| publish gate | editor-verified (+expert spot-check) | editor-verified | machine-checked |

Page degradation is file 06's job (sections render on data). **SEO guard:** T3 below the 40-word overview floor → `noindex` via metadata (file 12 §4) — a metadata branch, not a layout branch.

## 4. Popularity model (D12)

**[NOW]** `scripts/compute-popularity.ts`, output committed to `data/popularity.json` (reproducible, offline builds):
```
score = 100 × ( 0.60 × log10(wikiViews+1)/log10(maxWikiViews+1)
              + 0.25 × prominence      // tag-registry multipliers: unesco 1.0; jyotirlinga/char-dham/shakti-pitha 0.9; featured 0.5; else 0.2
              + 0.15 × clamp((rating−3.5)/1.5, 0, 1) )
```
`wikiViews` = trailing-12-month Wikimedia pageviews, fetched once, cached in the JSON with `fetchedAt`. Ties: score → rating → name. `lib/filter.ts` "popularity" switches from the featured+rating proxy to this score. **Production:** monthly cron, blend 0.5 site-analytics (self-hosted Plausible/PostHog: page views + result clicks, 90-day) + 0.3 wiki views + 0.2 prominence, expressed as percentile. Official shrine-board numbers (TTD etc.) feed `visitorStat` (citable display) — never the score. **Never rendered as a number; the sort label stays "Most visited".**

## 5. Identity: slugs at 20k (D14)

Progressive disambiguation, minted once against a persistent registry (**[NOW]** `lib/slug.ts` + `data/slug-registry.json`), frozen forever:
`slugify(name)` → collision: `+ city` → `+ state` → `+ g{geohash5}` (deterministic, never a fake distinguisher). First-come keeps the short slug (Tier-1 famous temples ingest first, so they stay clean). Renames append to `slugHistory` → generated 301s. Honorifics are **not** stripped from slugs (the displayed name is the slugged name); they *are* stripped for dedup matching (§6). `id` = slug remains the URL key; `uid` joins everything else.

## 6. Editorial pipeline (harvest → publish)

1. **Harvest:** Wikidata (SPARQL: temple/gurdwara/Jain/Buddhist instances in India — QID, coords, names, P18 image) > ASI monuments > OSM (`amenity=place_of_worship`) > state tourism > temple boards. Staged with per-field `SourceRef`s; field-merge precedence in that order.
2. **Dedup:** geohash-6 blocking (±neighbors); name normalization (NFC, diacritic fold, strip `sri|shri|shree|arulmigu|thiru`); Jaro-Winkler ≥0.90 auto-merge / 0.75–0.90 human queue / else distinct. `wikidataId`/`osmId` are hard anchors.
3. **Grounded enrichment:** LLM drafting for T2/T3 prose **only** retrieval-grounded on the record's own sources; prompts forbid numeric claims not verbatim in a source; output lands as `unverified` and must re-pass gates.
4. **Validate:** the machine gates (§7 + existing suite + `validateTempleForTier` + `checkCoordinateInState` (file 07 §2.3) + `checkDeitiesForReligion` (hindu ⇒ ≥1; else empty) + `checkMediaAttribution` + `checkSlugRegistry` + `checkUnsourcedNumbers` tripwire (regex for visitor-count-shaped prose without `visitorStat.source`) + tag-registry membership + CI dead-link checks).
5. **Human review:** T1 full editorial + expert spot-checks (~2–4h/record); T2 checklist (~10min); T3 **batch sampling** — 5% random per ingestion batch, >2% factual-failure rejects the whole batch back to step 3.
6. **Publish:** workflow state flips → revalidation webhook + search-index upsert (file 11).

**Tag registry [NOW]:** `data/tag-registry.ts` — a controlled vocabulary (~60–120 entries: `{ tag, slug, kind: "heritage"|"deity-form"|"circuit"|"feature"|"experience", prominence? }`). Free-text tags are a validation error. Existing 44 distinct tags are seeded and normalized into it.

## 7. Anti-slop enforcement (D15) — CI gates over prose

| Gate | Rule | Mechanism |
|---|---|---|
| Banned phrases | versioned lexicon (file 01 §3.2 seed list) | lint script over prose fields; error |
| Opener cap | no sentence-opener pattern >2% of corpus `overview`s | corpus script, warn→error at scale |
| N-gram dedupe | any 10-gram in >3 records fails the newest | corpus script |
| Voice contracts | whyVisit: 2nd person, 40–90 words, ≥1 concrete non-name noun phrase; history: past tense, no bullet prose | per-field heuristics + reviewer checklist |
| Length variance | per-tier word-count distributions must not collapse to a spike (σ floor) | corpus stats in CI report |
| Unsourced claims | §6.4 tripwire | validator error |
| Human gate | 5%/batch sampling (T3), full review (T1/T2) | process, tracked in CMS |

The lexicon and thresholds live in `data/anti-slop.ts` — data, versioned, extendable without code review.

## 8. Media & attribution operation
Every image carries `attribution` (§2). Ingestion (file 11 §5) resolves author/license/size from the Commons API by `sourceId`, rejects licenses outside the allowlist, generates blur placeholders, and rewrites URLs to the CDN. UI obligations: lightbox credit line + `/about` licensing note **[NOW: interim "Images: Wikimedia Commons" credit ships before the field exists — the live-violation stopgap]**. `owned` license marks commissioned photography (the long-term differentiator).

## 9. i18n readiness
`TempleTranslation` (typed, empty) + `Locale` union ship in the schema; `getTempleById(id, locale)` overlay lands when the first language does; UI strings move to a messages file at the same time. Until then: English content, Telugu hero flourish only (D1), language pill "coming soon".

## 10. Acceptance criteria
- The 15 records pass the T1 matrix after the migration script; validators reject: an unregistered tag, an unattributed image, a hindu record with empty `deities`, a sourced-less `visitorStat`, prose with a banned phrase, coordinates outside their state polygon.
- `data/popularity.json` regenerates byte-identically from its committed inputs; "Most visited" ordering derives from it.
- Slug minting is idempotent and registry-checked; re-running ingestion never renames an existing slug.
- No page or component reads `editorial.tier` for layout.

## 11. Anti-patterns
- Filling gaps to "complete" a page (guessed timings/fees are corruption, not coverage); trusting a single source for history claims; per-record custom fields ("just this one temple needs…"); letting the enrichment model see other temples' prose (cross-contamination → n-gram failures); slugs derived from mutable names at render time.

## 12. What Sonnet does next
**[NOW] items** enter the plan as Phase 3.5 "Content foundations" (file 13): tag registry + validator wiring; slug registry + `lib/slug.ts`; `compute-popularity.ts` + `data/popularity.json` + filter.ts switch; interim attribution credit; anti-slop lint script over the 15 records (fix any violations found — the hand-written 15 should already pass). The full schema evolution + migration script is **Stage B work** (file 11) — typed stubs may land earlier only if zero-cost.
