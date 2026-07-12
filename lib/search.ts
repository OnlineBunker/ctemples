import type { Temple } from "./types";
import { DEITY_ORDER, matchesDeity, type DeityKey } from "./deities";
import { slugify } from "./utils";
import { matchAliases, type AliasTarget } from "./search-aliases";

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
 * One fired alias's target's contribution to a temple's score (docs/10 §4 weights:
 * temple +2.5 pins the target; deity/place +2.0; tag +1.5).
 */
function targetScore(t: Temple, target: AliasTarget): number {
  switch (target.type) {
    case "deity":
      return matchesDeity(t, target.key) ? 2.0 : 0;
    case "temple":
      return t.id === target.slug ? 2.5 : 0;
    case "place": {
      const cityHit = !!target.city && t.city.toLowerCase() === target.city.toLowerCase();
      const stateHit = !!target.stateSlug && slugify(t.state) === target.stateSlug;
      return cityHit || stateHit ? 2.0 : 0;
    }
    case "tag":
      return t.tags.some((tag) => tag.toLowerCase() === target.tag.toLowerCase()) ? 1.5 : 0;
  }
}

/**
 * Alias-aware ranked search over a temple array. Pure and server-safe — per docs/10 §1
 * ("no client-side search computation, ever"), this is meant to be called from a server
 * component or server action, never shipped to the client. Ranking formula (docs/10 §2):
 *
 *   score = 2.0*(alias hit: deity/place) + 2.5*(alias hit: temple) + 1.5*(alias hit: tag)
 *         + 1.5*(deity match) + 1.2*(name match) + 0.8*(city/state)
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

  // Per-token (word-boundary) matching, not a whole-query lookup (docs/10 §4) — a fired
  // alias's targets can each contribute (composable, D10), and more than one alias can
  // fire in the same query.
  const firedAliases = options.disableAliases ? [] : matchAliases(q);
  const matchedAliases = firedAliases.map((a) => a.alias);

  const scored = list.map((t) => {
    let score = 0;

    for (const alias of firedAliases) {
      for (const target of alias.targets) {
        score += targetScore(t, target);
      }
    }

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
