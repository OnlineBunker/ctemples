# 12 — SEO & Content Strategy

> **CTemples Master Specification, file 12 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> New territory. Rulings carried: D4–D7 (canonicalization), D13 (thin-page guard), D26. **The prototype is and stays `noindex`** (`robots: { index: false }` in the root layout — already shipped); everything here activates at the production index flip except items marked **[NOW]**.

---

## 1. Strategy
CTemples wins search the way encyclopedias do: one canonical, deep, interlinked page per entity, honest metadata, and structured data — not editorial-calendar content marketing. There is no blog. Content velocity *is* the ingestion pipeline (file 09): every published temple is a new indexable asset. The moat is E-E-A-T: sourced facts, a public methodology, visible licensing.

## 2. Metadata templates (canonical; **[NOW]** where they cost nothing)

| Route | `<title>` | Description |
|---|---|---|
| `/` | `CTemples — India's temples, mapped` | "A tourism-first encyclopedia of India's temples: history, architecture, festivals, timings, and how to visit — from the Jyotirlingas to the shore temples." |
| `/temples/[id]` | `{Name}, {City} — history, timings & how to visit` | first 155ch of `whyVisit` (fallback: tagline, then overview) — hand-written text, never generated-for-SEO |
| `/explore` | `Explore India's temples` | static |
| `/explore?state=X` | `Temples in {State}` | `"{count} temples in {State}: …"` derived |
| `/explore?deity=X` | `{Deity} temples in India` | derived |
| `/about`, `/methodology` | literal | literal |

Titles ≤60ch (name truncates with city dropped first); template suffix `· CTemples` via `title.template`.

## 3. Structured data (production)
- **Temple pages:** JSON-LD `@type` by religion — `HinduTemple` (hindu), `Place` + `additionalType` gurdwara/jain/buddhist vihara — with `name`, `alternateName` (deity prose), `description`, `geo` (lat/lng), `address` (city/state/IN), `image` (hero CDN URL), `isAccessibleForFree` / `openingHoursSpecification` (only when `entryFee`/`timings` exist — never fabricated), `sameAs` (wikidataId → Wikidata URL), `touristType`. Plus `BreadcrumbList` (Home → Explore → {State} → {Temple}) — markup only, no visual breadcrumb (file 02 §2).
- **Organization + WebSite** (with `SearchAction` → `/explore?q={search_term_string}`) on the root.
- No `AggregateRating` markup — the rating is editorial, not user reviews; claiming review markup would be dishonest and penalizable (D12's spirit).

## 4. Index / canonical matrix (from D4–D6, D13)

| Surface | Indexed | Canonical |
|---|---|---|
| `/`, `/about`, `/methodology` | ✅ | self |
| Temple pages T1/T2, and T3 ≥40-word overview | ✅ | self |
| T3 below prose floor | ❌ `noindex,follow` | self |
| `/explore` bare; single `state`/`deity`/`tag`; non-default sort; `page≥2` | ✅ | self (params ordered per file 02 §3.3) |
| `?q=`, multi-facet combos, `?view=map` | ❌ `noindex,follow` | stripped/list equivalent |
| `/contact`, `/suggest` | ❌ | self |
| Legacy sort/param URLs | — | 301 per file 02 |

## 5. Sitemaps (production)
`generateSitemaps()` sharded **per state** (36 shards + one for static routes + Explore facet pages), `lastModified` = `editorial.updatedAt`, only index-eligible URLs included. Sitemap index at `/sitemap.xml`. Ping on publish via the revalidation webhook.

## 6. E-E-A-T assets
- **`/methodology` (D7, [NOW])**: how entries are researched, sourced, tiered, and verified; the no-fabrication policy; the licensing note; how to suggest corrections (→ `/suggest`). This page is the citation anchor.
- **Source visibility (production):** temple pages render a compact "Sources" line (from `verification.sources`) and a verification badge ("Editor-verified · updated {month year}") — honesty as ranking asset.
- **Attribution compliance** (file 09 §8) — also an E-E-A-T signal.
- Author/entity: "CTemples Editorial" with the methodology page as its identity anchor; no fake author personas.

## 7. Internal linking system (D26)
The computed sections **are** the link graph — no "SEO links" modules:
- Every temple page emits ≥10 internal links: back-link (state Explore), 15/16/17 related cards (≤10), quick-facts deity → `/explore?deity=`, state in breadcrumb JSON-LD, nearby attractions (unlinked text — they're not entities).
- Explore facet pages link down to temples (cards) and across (facet chips).
- Homepage tiles/chips seed the crawl of every facet.
- **Production landing pages** `/states/[slug]` + `/deities/[slug]` (reserved, file 02 §1.2): editorial intro (hand-written, 150–300 words) + top temples + facet links + map extract; unlocked per-state only when the state has ≥1 T1 + ≥10 total records (thin-landing guard). These become the category-query surfaces ("temples in Tamil Nadu") that filtered Explore URLs serve until then.

## 8. Open Graph / social
**[NOW]** per-page OG title/description/hero image (already partially shipped). Production: generated OG cards (`next/og`) — hero photo + name + state chip in Utsavam styling — cached per temple. Twitter `summary_large_image`.

## 9. Performance as ranking (already locked)
Core Web Vitals floor = file 01 §5 (LCP <2.5s, CLS 0, INP via minimal JS). Nothing new — noted because it's half of SEO.

## 10. Acceptance criteria
- Production flip checklist exists as one PR: remove `robots: index:false`, add JSON-LD, sitemaps, canonicals per §4 — nothing else changes (metadata was templated all along).
- Rich-results test passes on a T1, T2, and T3-indexable temple; no fabricated fields in any JSON-LD (spot-check `openingHoursSpecification` absent where `timings` is).
- Every indexable URL is in exactly one sitemap shard; `?q=`/multi-facet/map URLs are in none and carry `noindex`.
- Temple-page internal-link count ≥10 verified on the three tier archetypes.

## 11. Anti-patterns
- Programmatic thin pages ("Shiva temples in {every-city}") — facet URLs + future landing pages only; doorway pages kill the domain.
- Review/rating markup without user reviews; keyword-stuffed titles; auto-generated meta descriptions that differ from on-page prose; a blog for "freshness"; index-flipping before attribution and methodology ship (E-E-A-T prerequisites).

## 12. What Sonnet does next
**[NOW] items** ride existing phases: metadata templates verify/complete in Phase 5 (temple page rebuild); `/methodology` in Phase 8; OG basics already live. The production flip is a single dedicated phase in file 13 (Phase 11), blocked on: attribution UI, methodology, JSON-LD, sitemaps — do not partially flip.
