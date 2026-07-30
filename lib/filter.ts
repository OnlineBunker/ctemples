import type { Temple, Region } from "./types";
import { parseRupeeRange } from "./format";

/**
 * Pure Explore filtering, search, and sort. Everything is derived from the passed-in
 * array (facets included), so it works unchanged whether there are 4 temples or 2,000+.
 * Unit-tested — see filter.test.ts.
 */

/**
 * `nearest` is a *contextual* sort: it is only meaningful alongside a `near` coordinate
 * (the visitor's own location) and is therefore never offered in the static option list —
 * `runExploreQuery` handles it directly, and the Explore sort control only surfaces it once
 * coordinates exist. Everything else sorts purely from the record.
 */
export type SortKey = "featured" | "rating" | "name" | "cost" | "popularity" | "nearest";

// Kept for backward compatibility with the pre-redesign Explore page
// (app/explore/page.tsx's VALID_SORT), which still reads all 5 keys. New (Phase 3)
// Explore UI should use PUBLIC_SORT_OPTIONS below instead.
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "rating", label: "Top rated" },
  { key: "name", label: "A–Z" },
  { key: "cost", label: "Lowest cost" },
  { key: "popularity", label: "Most visited" },
];

/**
 * The 3 public sort options per DESIGN_SYSTEM_V2 §6.4/§8.6 — "Featured" and "Lowest
 * cost" are dropped from the public-facing list (Featured is an internal default
 * ordering; cost was a prototype-only convenience). For the new (Phase 3) Explore sort
 * filter.
 */
export const PUBLIC_SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Top rated" },
  { key: "popularity", label: "Most visited" },
  { key: "name", label: "A–Z" },
];

export interface TempleFilters {
  query?: string;
  regions?: Region[];
  deities?: string[];
  tags?: string[];
  sort?: SortKey;
}

function haystack(t: Temple): string {
  return [t.name, t.city, t.state, t.region, t.deity, t.religion, t.tagline, ...t.tags]
    .join(" ")
    .toLowerCase();
}

/** All whitespace-separated terms must appear somewhere in the temple's searchable text. */
export function matchesQuery(t: Temple, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const h = haystack(t);
  return terms.every((term) => h.includes(term));
}

function cheapest(t: Temple): number {
  const mins = t.costEstimates
    .map((e) => parseRupeeRange(e.budget).min)
    .filter((n) => n > 0);
  return mins.length ? Math.min(...mins) : Number.POSITIVE_INFINITY;
}

export function sortTemples(list: Temple[], sort: SortKey): Temple[] {
  const copy = [...list];
  switch (sort) {
    case "rating":
      copy.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
      break;
    case "name":
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "cost":
      copy.sort((a, b) => cheapest(a) - cheapest(b) || a.name.localeCompare(b.name));
      break;
    case "popularity":
      // docs/09 §4 (D12): the precomputed 0–100 ordinal (scripts/compute-popularity.ts,
      // merged onto each Temple by lib/temples.ts). Ties: score → rating → name.
      copy.sort(
        (a, b) =>
          (b.popularityScore ?? 0) - (a.popularityScore ?? 0) ||
          b.rating - a.rating ||
          a.name.localeCompare(b.name),
      );
      break;
    case "featured":
    default:
      copy.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          a.name.localeCompare(b.name),
      );
  }
  return copy;
}

export function filterTemples(temples: Temple[], filters: TempleFilters = {}): Temple[] {
  const { query = "", regions = [], deities = [], tags = [], sort = "featured" } = filters;
  const filtered = temples.filter((t) => {
    if (regions.length && !regions.includes(t.region)) return false;
    if (deities.length && !deities.includes(t.deity)) return false;
    if (tags.length && !tags.some((tag) => t.tags.includes(tag))) return false;
    if (!matchesQuery(t, query)) return false;
    return true;
  });
  return sortTemples(filtered, sort);
}

export interface Facet {
  value: string;
  count: number;
}

/** Distinct values + counts for a single-value facet, sorted by frequency then name. */
export function collectFacet(temples: Temple[], key: "region" | "deity"): Facet[] {
  const counts = new Map<string, number>();
  for (const t of temples) {
    const v = t[key];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return facetsFromMap(counts);
}

/** Distinct tags + counts across the (multi-valued) tags field. */
export function collectTags(temples: Temple[]): Facet[] {
  const counts = new Map<string, number>();
  for (const t of temples) {
    for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return facetsFromMap(counts);
}

function facetsFromMap(counts: Map<string, number>): Facet[] {
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function countActiveFilters(filters: TempleFilters): number {
  return (
    (filters.query?.trim() ? 1 : 0) +
    (filters.regions?.length ?? 0) +
    (filters.deities?.length ?? 0) +
    (filters.tags?.length ?? 0)
  );
}
