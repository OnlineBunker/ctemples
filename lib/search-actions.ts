"use server";

import { queryTemples, type TempleSummary } from "./temples";

export interface SearchSuggestions {
  items: TempleSummary[];
  matchedAliasLabel: string | null;
}

const MIN_QUERY_LENGTH = 2;

/**
 * The header search overlay's typeahead data path (docs/10 §3 — prototype/Stage B: "a
 * server action … over the in-memory docs"). Wraps `queryTemples`, the same engine every
 * entry point uses (docs/10 §1 — "one engine, every entry point"), so the overlay, the
 * Explore search bar, and a direct `/explore?q=` URL always agree on the same top result
 * for the same query. The `type: temple|place|deity` grouped-suggestion response shape
 * (docs/10 §3) is a Stage C+ (Meilisearch `/api/suggest`) upgrade — the prototype's data
 * model has no place/deity entities distinct from temples to group by yet.
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return { items: [], matchedAliasLabel: null };

  const result = await queryTemples({ q, perPage: 6 });
  return { items: result.items, matchedAliasLabel: result.matchedAliasLabel };
}
