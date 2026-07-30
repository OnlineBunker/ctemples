"use server";

import { getTempleSummariesByIds, type TempleSummary } from "./temples";

/**
 * The wishlist's data path. Saved ids live in the visitor's own `localStorage`, so the page
 * can only learn what to render on the client — but it must not therefore ship the whole
 * dataset down to filter locally (that stops scaling long before 20,000 records, docs/11 §3).
 * This action takes just the saved ids and returns just those card-weight summaries.
 */
export async function getWishlistTemples(ids: string[]): Promise<TempleSummary[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const clean = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (clean.length === 0) return [];
  return getTempleSummariesByIds(clean);
}
