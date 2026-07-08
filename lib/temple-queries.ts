import type { Temple, Region } from "./types";
import { REGION_ORDER } from "./regions";
import { slugify } from "./utils";
import { DEITY_ORDER, matchesDeity } from "./deities";
import { haversineKm } from "./distance";

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
