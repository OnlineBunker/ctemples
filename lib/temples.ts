import { temples } from "@/data/temples";
import type { Temple } from "./types";
import {
  findTempleById,
  pickFeatured,
  pickRelated,
  countByRegion,
  countByState,
  topByState,
  type StateCount,
} from "./temple-queries";
import { countByDeity, pickByDeityKey, type DeityKey } from "./deities";

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

/** States present in the data, with slug + count, richest first (homepage state strip). */
export function getStateCounts(): StateCount[] {
  return countByState(temples);
}

/** Top temples in a state (state-strip popover). */
export function getTopTemplesByState(state: string, limit?: number): Temple[] {
  return topByState(temples, state, limit);
}

/** Count of temples under each of the six canonical deities (homepage deity tiles). */
export function getDeityCounts(): Record<DeityKey, number> {
  return countByDeity(temples);
}

/** Temples under a deity, highest rating first. */
export function getTemplesByDeity(key: DeityKey, limit?: number): Temple[] {
  return pickByDeityKey(temples, key, limit);
}
