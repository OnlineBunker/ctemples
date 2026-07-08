import { temples } from "@/data/temples";
import type { Temple } from "./types";
import { findTempleById, pickFeatured, pickRelated, countByRegion } from "./temple-queries";

/**
 * Data-bound public API. Every function reads the single `temples` array from
 * data/temples.ts, so swapping the placeholder array for the full generated set
 * (15 now, 2,000+ later) needs no changes here or in any page. See README.
 */

export function getAllTemples(): Temple[] {
  return temples;
}

export function getTempleCount(): number {
  return temples.length;
}

export function getTempleById(id: string): Temple | null {
  return findTempleById(temples, id);
}

/** Slugs for generateStaticParams on /temples/[id]. */
export function getTempleIds(): string[] {
  return temples.map((t) => t.id);
}

export function getFeaturedTemples(limit?: number): Temple[] {
  return pickFeatured(temples, limit);
}

export function getRelatedTemples(temple: Temple, limit?: number): Temple[] {
  return pickRelated(temples, temple, limit);
}

export function getRegionCounts() {
  return countByRegion(temples);
}
