import { cache } from "react";
import { temples as rawTemples } from "@/data/temples";
import popularityScores from "@/data/popularity.json";
import type { Temple, Region } from "./types";
import {
  findTempleById,
  pickFeatured,
  pickRelated,
  countByRegion,
  countByState,
  topByState,
  countByTag,
  runExploreQuery,
  type StateCount,
  type TagCount,
  type ExploreQuery,
  type ExploreFacets,
} from "./temple-queries";
import { countByDeity, pickByDeityKey, matchesDeity, DEITY_ORDER, type DeityKey } from "./deities";
import type { SortKey } from "./filter";
import { getHero } from "./media";
import { cheapestBudget } from "./format";

/**
 * Data-bound public API — the ONLY module pages import for data (CLAUDE.md "the data
 * seam"). Every function reads the single `temples` array from data/temples.ts, so
 * swapping the placeholder array for a generated set needs no changes here or in any
 * page. All functions are async (even though the array read is instant) so the store
 * behind this file can change — files, then a CMS — without touching a single page
 * (docs/11 §3). Pure composition logic lives in ./temple-queries and ./search; this
 * file only supplies the real array and, for queryTemples, projects to TempleSummary.
 */

// Merges the precomputed popularity score (data/popularity.json, docs/09 §4) onto each
// record — the score is derived, not hand-authored, so it lives in its own committed
// file (scripts/compute-popularity.ts) rather than in data/temples.ts.
const scoreById = new Map(popularityScores.map((p) => [p.id, p.score]));
const temples: Temple[] = rawTemples.map((t) => ({ ...t, popularityScore: scoreById.get(t.id) }));

export async function getAllTemples(): Promise<Temple[]> {
  return temples;
}

export async function getTempleCount(): Promise<number> {
  return temples.length;
}

/**
 * `cache()`-wrapped (React, request-scoped) — `generateMetadata` and the page component
 * both need the same temple, and without memoizing, that's two redundant array scans
 * per request. Applies to every lookup below that a page and its `generateMetadata`
 * plausibly call with the same arguments in one request.
 */
export const getTempleById = cache(async (id: string): Promise<Temple | null> => {
  return findTempleById(temples, id);
});

/** Slugs for generateStaticParams on /temples/[id]. */
export async function getTempleIds(): Promise<string[]> {
  return temples.map((t) => t.id);
}

export async function getFeaturedTemples(limit?: number): Promise<Temple[]> {
  return pickFeatured(temples, limit);
}

export async function getRelatedTemples(temple: Temple, limit?: number): Promise<Temple[]> {
  return pickRelated(temples, temple, limit);
}

export const getRegionCounts = cache(async (): Promise<Record<Region, number>> => {
  return countByRegion(temples);
});

/** States present in the data, with slug + count, richest first (homepage state strip). */
export const getStateCounts = cache(async (): Promise<StateCount[]> => {
  return countByState(temples);
});

/** Top temples in a state (state-strip popover). */
export async function getTopTemplesByState(state: string, limit?: number): Promise<Temple[]> {
  return topByState(temples, state, limit);
}

/** Count of temples under each of the six canonical deities (homepage deity tiles). */
export const getDeityCounts = cache(async (): Promise<Record<DeityKey, number>> => {
  return countByDeity(temples);
});

/**
 * Every tag present anywhere in the FULL dataset, with slug + count — unfiltered. Not
 * used by Explore itself (queryTemples's `facets.tags` is already selected-safe, per
 * `ensurePresent` in lib/temple-queries.ts) — kept for any surface that needs a global
 * tag census independent of the current filter context.
 */
export const getTagCounts = cache(async (): Promise<TagCount[]> => {
  return countByTag(temples);
});

/** Temples under a deity, highest rating first. */
export async function getTemplesByDeity(key: DeityKey, limit?: number): Promise<Temple[]> {
  return pickByDeityKey(temples, key, limit);
}

// ─────────────────────────── Explore query surface (Phase 3) ───────────────────────────

/**
 * Card-weight projection for listing surfaces (docs/11 §3) — Explore never receives full
 * Temple records. Fields not yet in the prototype schema are derived, never invented:
 * `uid` = the slug (a real ULID arrives with the Stage-B migration, docs/09 §5 — until
 * then this must not be persisted anywhere external); `deities` = the existing keyword
 * matcher; `tier` = 1 (every current hand-written record is Tier 1, docs/09 §1);
 * `cheapestBudget` is an extension beyond docs/11's literal shape, needed to keep the
 * shipped "from ₹X" card meta working without carrying the full costEstimates array.
 */
export interface TempleSummary {
  id: string;
  uid: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  religion: string;
  deities: DeityKey[];
  tagline: string;
  hero: ReturnType<typeof getHero>;
  rating?: number;
  tags: string[];
  tier: 1;
  featured: boolean;
  cheapestBudget: number | null;
}

function toSummary(t: Temple): TempleSummary {
  return {
    id: t.id,
    uid: t.id,
    name: t.name,
    city: t.city,
    state: t.state,
    region: t.region,
    religion: t.religion,
    deities: DEITY_ORDER.filter((key) => matchesDeity(t, key)),
    tagline: t.tagline,
    hero: getHero(t.media),
    rating: t.rating,
    tags: t.tags,
    tier: 1,
    featured: t.featured,
    cheapestBudget: cheapestBudget(t.costEstimates),
  };
}

export interface TempleQuery {
  q?: string;
  /** `?exact=1` (docs/02 §3.1) — disables alias expansion for the current query. */
  exact?: boolean;
  /** State slug, matches `?state=`. */
  state?: string;
  deity?: DeityKey;
  /** Tag slugs, matches repeated `?tag=` (max 3 — enforced by the page, not here). */
  tags?: string[];
  /** Reserved (v2 facet, docs/02 §3.1) — accepted but not yet applied. */
  religion?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface PagedTemples {
  items: TempleSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  matchedAliases: string[];
  matchedAliasLabel: string | null;
  facets: ExploreFacets;
}

/**
 * The single Explore data call (docs/05 §1, docs/11 §3) — filters, alias-aware search,
 * sort, and pagination in one round trip, with contextual facet counts for the filter
 * popovers. `religion` is accepted per the reserved contract but not yet applied
 * (prototype has no religion facet UI — docs/02 §3.1).
 */
export async function queryTemples(query: TempleQuery): Promise<PagedTemples> {
  const internalQuery: ExploreQuery = {
    q: query.q,
    exact: query.exact,
    stateSlug: query.state,
    deity: query.deity,
    tagSlugs: query.tags,
    sort: query.sort,
    page: query.page,
    perPage: query.perPage,
  };
  const result = runExploreQuery(temples, internalQuery);
  return {
    items: result.items.map(toSummary),
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
    matchedAliases: result.matchedAliases,
    matchedAliasLabel: result.matchedAliasLabel,
    facets: result.facets,
  };
}

/** Global (unfiltered) facet snapshot — for surfaces that need counts without a query. */
export const getFacetCounts = cache(async (): Promise<ExploreFacets> => {
  return runExploreQuery(temples, {}).facets;
});
