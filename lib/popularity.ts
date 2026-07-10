import { getTagEntry } from "@/data/tag-registry";

/**
 * Pure popularity scoring (docs/09 §4, D12) — takes primitives only, no content-array
 * import, so it's unit-testable independent of data/temples.ts. The orchestration (I/O:
 * reading data/temples.ts + data/wiki-pageviews.json, writing data/popularity.json)
 * lives in scripts/compute-popularity.ts.
 */
export interface PopularityInput {
  wikiViews: number;
  /** The highest wikiViews across the whole corpus in this computation run. */
  maxWikiViews: number;
  tags: string[];
  featured: boolean;
  rating: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Tag-registry prominence multiplier: the highest `prominence` value across the
 * temple's tags (UNESCO World Heritage 1.0; Jyotirlinga/Char Dham/Shakti Pitha 0.9);
 * falls back to featured (0.5) or the default (0.2) when no tag carries one.
 */
export function computeProminence(tags: string[], featured: boolean): number {
  const values = tags
    .map((tag) => getTagEntry(tag)?.prominence)
    .filter((p): p is number => typeof p === "number");
  if (values.length > 0) return Math.max(...values);
  return featured ? 0.5 : 0.2;
}

/**
 * score = 100 × ( 0.60 × log10(wikiViews+1)/log10(maxWikiViews+1)
 *              + 0.25 × prominence
 *              + 0.15 × clamp((rating−3.5)/1.5, 0, 1) )
 * Rounded to 2 decimal places for a stable, diffable committed file.
 */
export function computePopularityScore(input: PopularityInput): number {
  const { wikiViews, maxWikiViews, tags, featured, rating } = input;
  const viewsTerm = maxWikiViews > 0 ? Math.log10(wikiViews + 1) / Math.log10(maxWikiViews + 1) : 0;
  const prominence = computeProminence(tags, featured);
  const ratingTerm = clamp((rating - 3.5) / 1.5, 0, 1);
  const score = 100 * (0.6 * viewsTerm + 0.25 * prominence + 0.15 * ratingTerm);
  return Math.round(score * 100) / 100;
}
