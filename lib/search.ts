import type { Temple } from "./types";
import { DEITY_ORDER, matchesDeity, type DeityKey } from "./deities";
import { SEARCH_ALIASES } from "./search-aliases";

export interface SearchOptions {
  limit?: number;
  /** Skip alias expansion entirely — powers Explore's `?exact=1` (dismissing the smart-match banner). */
  disableAliases?: boolean;
}

export interface SearchOutcome {
  results: Temple[];
  /** Alias keys (not canonical values) that fired for this query — see search-aliases.ts. */
  matchedAliases: string[];
}

const RATING_BASELINE = 3.5;

function ratingBonus(rating: number): number {
  return Math.max(0, Math.min(0.5, (rating - RATING_BASELINE) * 0.5));
}

function isDeityKey(s: string): s is DeityKey {
  return (DEITY_ORDER as readonly string[]).includes(s);
}

/**
 * Alias-aware ranked search over a temple array. Pure and server-safe — per UX_SPEC
 * §4.1 ("no client-side search computation"), this is meant to be called from a server
 * component, never shipped to the client. Ranking formula from UX_SPEC §4.2:
 *
 *   score = 2.0*(alias hit) + 1.5*(deity match) + 1.2*(name match) + 0.8*(city/state)
 *         + 0.5*(tag) + 0.3*(overview/history) + rating_bonus
 *
 * An empty query returns the full list sorted by rating (the default Explore order).
 */
export function searchTemples(
  list: Temple[],
  query: string,
  options: SearchOptions = {},
): SearchOutcome {
  const q = query.trim().toLowerCase();

  if (!q) {
    const results = [...list].sort(
      (a, b) => b.rating - a.rating || a.name.localeCompare(b.name),
    );
    return { results: applyLimit(results, options), matchedAliases: [] };
  }

  const aliasCanonical = options.disableAliases ? undefined : SEARCH_ALIASES[q];
  const matchedAliases = aliasCanonical ? [q] : [];

  const scored = list.map((t) => {
    let score = 0;

    if (aliasCanonical && matchesDeity(t, aliasCanonical)) score += 2.0;

    const deityHit =
      (isDeityKey(q) && matchesDeity(t, q)) ||
      t.deity.toLowerCase() === q ||
      t.deity.toLowerCase().startsWith(q);
    if (deityHit) score += 1.5;

    const nameLower = t.name.toLowerCase();
    if (nameLower === q || nameLower.startsWith(q)) score += 1.2;

    if (t.city.toLowerCase().includes(q) || t.state.toLowerCase().includes(q)) score += 0.8;

    if (t.tags.some((tag) => tag.toLowerCase().includes(q))) score += 0.5;

    if (t.overview.toLowerCase().includes(q) || t.history.toLowerCase().includes(q)) score += 0.3;

    if (score > 0) score += ratingBonus(t.rating);

    return { temple: t, score };
  });

  const results = scored
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.temple.rating - a.temple.rating || a.temple.name.localeCompare(b.temple.name),
    )
    .map((r) => r.temple);

  return { results: applyLimit(results, options), matchedAliases };
}

function applyLimit(results: Temple[], options: SearchOptions): Temple[] {
  return typeof options.limit === "number" ? results.slice(0, options.limit) : results;
}
