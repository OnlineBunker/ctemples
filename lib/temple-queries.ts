import type { Temple, Region } from "./types";
import { REGION_ORDER } from "./regions";

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
      if (t.deity === temple.deity) score += 2;
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
