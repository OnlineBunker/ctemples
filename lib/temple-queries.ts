import type { Temple, Region } from "./types";
import { REGION_ORDER } from "./regions";
import { slugify } from "./utils";
import { DEITY_ORDER, matchesDeity, countByDeity, type DeityKey } from "./deities";
import { haversineKm } from "./distance";
import { sortTemples, type SortKey } from "./filter";
import { searchTemples } from "./search";

/**
 * Pure query helpers over a temple array. Kept free of any data import so they can be
 * unit-tested with fixtures and so nothing here assumes the current item count.
 * The data-bound public API in temples.ts wraps these with the real array.
 */

export function findTempleById(list: Temple[], id: string): Temple | null {
  return list.find((t) => t.id === id) ?? null;
}

export function pickFeatured(list: Temple[], limit?: number): Temple[] {
  const featured = list
    .filter((t) => t.featured)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

/**
 * Do two temples share a canonical deity? The `deity` field is free-text prose, unique
 * per temple (e.g. two different Shiva Jyotirlingas never share a string), so exact
 * equality would never fire on real data — this checks membership in the same canonical
 * deity (see lib/deities.ts) instead.
 */
function sharesDeity(a: Temple, b: Temple): boolean {
  return DEITY_ORDER.some((key) => matchesDeity(a, key) && matchesDeity(b, key));
}

/**
 * Related temples ranked by shared context: same region weighs most, then state and
 * deity, then overlapping tags. Ties break on rating, then name. Excludes self.
 */
export function pickRelated(list: Temple[], temple: Temple, limit = 3): Temple[] {
  const scored = list
    .filter((t) => t.id !== temple.id)
    .map((t) => {
      let score = 0;
      if (t.region === temple.region) score += 3;
      if (t.state === temple.state) score += 2;
      if (sharesDeity(t, temple)) score += 2;
      score += t.tags.filter((tag) => temple.tags.includes(tag)).length;
      return { t, score };
    });
  scored.sort(
    (a, b) => b.score - a.score || b.t.rating - a.t.rating || a.t.name.localeCompare(b.t.name),
  );
  return scored.slice(0, limit).map((s) => s.t);
}

export function countByRegion(list: Temple[]): Record<Region, number> {
  const counts = Object.fromEntries(REGION_ORDER.map((r) => [r, 0])) as Record<Region, number>;
  for (const t of list) counts[t.region] += 1;
  return counts;
}

export interface StateCount {
  state: string;
  slug: string;
  region: Region;
  count: number;
}

/**
 * Every state present in the data, with a URL slug and temple count, richest first.
 * Derived from the array — no fixed list of states, so the full set scales in.
 */
export function countByState(list: Temple[]): StateCount[] {
  const map = new Map<string, { region: Region; count: number }>();
  for (const t of list) {
    const entry = map.get(t.state);
    if (entry) entry.count += 1;
    else map.set(t.state, { region: t.region, count: 1 });
  }
  return [...map.entries()]
    .map(([state, { region, count }]) => ({ state, slug: slugify(state), region, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
}

export interface TagCount {
  tag: string;
  slug: string;
  count: number;
}

/**
 * Every tag present in the data, with a URL slug and count, richest first. Mirrors
 * countByState's shape/slug convention so Explore's tag filter works the same way as
 * the state filter — URLs use slugs (`?tag=unesco-world-heritage`), never raw display
 * strings with spaces/casing.
 */
export function countByTag(list: Temple[]): TagCount[] {
  const map = new Map<string, { tag: string; count: number }>();
  for (const t of list) {
    for (const tag of t.tags) {
      const slug = slugify(tag);
      const entry = map.get(slug);
      if (entry) entry.count += 1;
      else map.set(slug, { tag, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, { tag, count }]) => ({ tag, slug, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Top temples in a state, highest rating first (for the state-strip popover). */
export function topByState(list: Temple[], state: string, limit = 4): Temple[] {
  return list
    .filter((t) => t.state === state)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Temples sharing a canonical deity with `temple` (see lib/deities.ts), highest rating
 * first. Excludes self. For the detail page's "By the same deity" section (Phase 5).
 */
export function pickByDeity(list: Temple[], temple: Temple, limit = 3): Temple[] {
  return list
    .filter((t) => t.id !== temple.id && sharesDeity(t, temple))
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Temples sharing `temple.architecturalStyleSlug`, highest rating first. Excludes self.
 * For the detail page's "Same architectural style" section (Phase 5).
 */
export function pickByArchitecturalStyle(list: Temple[], temple: Temple, limit = 3): Temple[] {
  return list
    .filter((t) => t.id !== temple.id && t.architecturalStyleSlug === temple.architecturalStyleSlug)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export interface NearbyResult {
  temple: Temple;
  distanceKm: number;
}

/**
 * Temples within `km` of (lat, lng), nearest first, via Haversine distance. A point
 * exactly at distance 0 (i.e. the query point's own temple, if it's in `list`) is
 * excluded, so callers don't need to filter self out separately. For the detail page's
 * "Plan around" and "Within 100 km" sections (Phase 5).
 */
export function pickWithinRadius(
  list: Temple[],
  lat: number,
  lng: number,
  km: number,
  limit?: number,
): NearbyResult[] {
  const withDistance = list
    .map((t) => ({ temple: t, distanceKm: haversineKm({ lat, lng }, t.coordinates) }))
    .filter((r) => r.distanceKm > 0 && r.distanceKm <= km)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return typeof limit === "number" ? withDistance.slice(0, limit) : withDistance;
}

export interface ExploreQuery {
  q?: string;
  /** `?exact=1` — dismisses the smart-match banner by disabling alias expansion. */
  exact?: boolean;
  /** State slug (`slugify(state)`), matches `?state=`. */
  stateSlug?: string;
  deity?: DeityKey;
  /** Tag slugs (`slugify(tag)`), matches repeated `?tag=`. OR semantics within the facet. */
  tagSlugs?: string[];
  sort?: SortKey;
  /** 1-based. */
  page?: number;
  perPage?: number;
}

export interface ExploreFacets {
  states: StateCount[];
  deities: Record<DeityKey, number>;
  tags: TagCount[];
}

export interface ExploreResult {
  items: Temple[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  matchedAliases: string[];
  facets: ExploreFacets;
}

/** Keeps a currently-selected slug present (at count 0 if needed) even when the
 *  contextual computation dropped it — docs/05 §3.3: a selected value must stay
 *  visible/deselectable. `fallbackSource` is the FULL unfiltered list, so this never
 *  needs a second data call from the page (docs/05 §9 — queryTemples is the only call). */
function ensurePresent<T extends { slug: string; count: number }>(
  contextual: T[],
  selectedSlugs: string[],
  fallbackSource: T[],
): T[] {
  if (selectedSlugs.length === 0) return contextual;
  const bySlug = new Map(contextual.map((o) => [o.slug, o]));
  for (const slug of selectedSlugs) {
    if (!bySlug.has(slug)) {
      const fallback = fallbackSource.find((g) => g.slug === slug);
      if (fallback) bySlug.set(slug, { ...fallback, count: 0 });
    }
  }
  return [...bySlug.values()];
}

/**
 * The single query composition behind Explore's list mode (docs/05 §1, docs/11 §3's
 * queryTemples). Pure — the data-bound `queryTemples` wrapper in lib/temples.ts supplies
 * the real array and projects the output to TempleSummary.
 *
 * Ordering rule (recorded here and in docs/05 §4): when `q` is non-empty, result order
 * is ALWAYS the search relevance order (score desc, rating desc, name asc) — the `sort`
 * param does not re-order matches. This is what the golden-query suite (docs/10 §8)
 * requires (e.g. "jagannath" must pin the Puri temple first) and matches standard
 * search UX: sort controls apply to browsing, not to ranking search matches. `sort`
 * applies in full whenever `q` is empty (browse mode) — default "rating" per D6.
 *
 * Facet counts are contextual: each facet's counts are computed with every OTHER active
 * filter applied but NOT its own — INCLUDING `q` as one of those "other filters" (a
 * search for "somnath" narrows the state/deity/tag facets down to Somnath's own facets,
 * not the unfiltered dataset) — so selecting a deity narrows the state/tag counts, but
 * the deity facet itself still shows every deity's count against the state/tag/q filters
 * alone. `ensurePresent` then guarantees a currently-selected state/tag stays visible
 * even at 0, so it always stays deselectable (docs/05 §3.3).
 */
export function runExploreQuery(list: Temple[], query: ExploreQuery): ExploreResult {
  const {
    q = "",
    exact = false,
    stateSlug,
    deity,
    tagSlugs = [],
    sort = "rating",
    page = 1,
    perPage = 24,
  } = query;

  const byState = (arr: Temple[]) =>
    stateSlug ? arr.filter((t) => slugify(t.state) === stateSlug) : arr;
  const byDeity = (arr: Temple[]) => (deity ? arr.filter((t) => matchesDeity(t, deity)) : arr);
  const byTags = (arr: Temple[]) =>
    tagSlugs.length
      ? arr.filter((t) => tagSlugs.some((slug) => t.tags.some((tag) => slugify(tag) === slug)))
      : arr;

  const trimmedQ = q.trim();
  const byQuery = (arr: Temple[]) =>
    trimmedQ ? searchTemples(arr, trimmedQ, { disableAliases: exact }).results : arr;

  const facets: ExploreFacets = {
    states: ensurePresent(
      countByState(byQuery(byTags(byDeity(list)))),
      stateSlug ? [stateSlug] : [],
      countByState(list),
    ),
    deities: countByDeity(byQuery(byTags(byState(list)))),
    tags: ensurePresent(countByTag(byQuery(byDeity(byState(list)))), tagSlugs, countByTag(list)),
  };

  let matched = byTags(byDeity(byState(list)));
  let matchedAliases: string[] = [];

  if (trimmedQ) {
    const outcome = searchTemples(matched, trimmedQ, { disableAliases: exact });
    matched = outcome.results;
    matchedAliases = outcome.matchedAliases;
  } else {
    matched = sortTemples(matched, sort);
  }

  const total = matched.length;
  const perPageClamped = perPage > 0 ? perPage : 24;
  const totalPages = Math.max(1, Math.ceil(total / perPageClamped));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const start = (pageClamped - 1) * perPageClamped;

  return {
    items: matched.slice(start, start + perPageClamped),
    total,
    page: pageClamped,
    perPage: perPageClamped,
    totalPages,
    matchedAliases,
    facets,
  };
}
