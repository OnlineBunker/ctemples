import type { Temple, Region } from "./types";
import { REGION_ORDER } from "./regions";
import { slugify } from "./utils";
import { DEITY_ORDER, matchesDeity } from "./deities";

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
