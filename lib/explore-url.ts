import type { DeityKey } from "./deities";
import { DEITY_ORDER } from "./deities";
import type { SortKey } from "./filter";

/**
 * The /explore URL contract (docs/02 §3.1) — pure parse/build so the page, the filter
 * components, and pagination all agree on one grammar. Nothing here reads or writes the
 * URL directly; callers own `useSearchParams`/`router.push`/`<Link href>`.
 */

export type ExploreView = "list" | "map";

export interface ParsedExploreParams {
  view: ExploreView;
  q: string;
  exact: boolean;
  state?: string;
  deity?: DeityKey;
  tags: string[];
  sort: SortKey;
  page: number;
}

const VALID_SORT: SortKey[] = ["rating", "popularity", "name"];
const LEGACY_SORT_MAP: Record<string, SortKey> = { featured: "rating", cost: "rating", alpha: "name" };
const MAX_TAGS = 3;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Parse raw Next.js searchParams into the canonical shape. Every rule here matches
 * docs/02 §3.1: unknown/invalid values are ignored (never an error state), legacy sort
 * values are coerced, tags are capped at 3, page is clamped to >=1 (upper-bound clamping
 * against `totalPages` happens in the seam — this function doesn't know the result size).
 */
export function parseExploreParams(
  sp: Record<string, string | string[] | undefined>,
): ParsedExploreParams {
  const view: ExploreView = first(sp.view) === "map" ? "map" : "list";
  const q = (first(sp.q) ?? "").trim();
  const exact = first(sp.exact) === "1";

  const stateRaw = first(sp.state)?.trim();
  const state = stateRaw ? stateRaw : undefined;

  const deityRaw = first(sp.deity)?.trim() as DeityKey | undefined;
  const deity = deityRaw && (DEITY_ORDER as readonly string[]).includes(deityRaw) ? deityRaw : undefined;

  const tags = [...new Set(toArray(sp.tag).map((t) => t.trim()).filter(Boolean))].slice(0, MAX_TAGS);

  const sortRaw = first(sp.sort)?.trim() ?? "";
  const sort: SortKey = (VALID_SORT as string[]).includes(sortRaw)
    ? (sortRaw as SortKey)
    : (LEGACY_SORT_MAP[sortRaw] ?? "rating");

  const pageRaw = Number(first(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return { view, q, exact, state, deity, tags, sort, page };
}

/**
 * Build a canonical Explore URL from a (partial) params override applied on top of the
 * current parsed params — this is how every filter control, chip removal, and
 * pagination link is constructed, so the round-trip law (docs/02 §3.1) holds by
 * construction: defaults are always dropped, tags are always alphabetized.
 */
export function buildExploreHref(
  current: ParsedExploreParams,
  overrides: Partial<ParsedExploreParams> = {},
): string {
  const next: ParsedExploreParams = { ...current, ...overrides };
  const params = new URLSearchParams();

  if (next.state) params.set("state", next.state);
  if (next.deity) params.set("deity", next.deity);
  [...next.tags].sort((a, b) => a.localeCompare(b)).slice(0, MAX_TAGS).forEach((t) => params.append("tag", t));
  if (next.sort !== "rating") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.q) params.set("q", next.q);
  if (next.q && next.exact) params.set("exact", "1");
  if (next.view === "map") params.set("view", "map");

  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

/** Drops `exact` whenever `q` changes/clears — an `exact` flag with no query is meaningless. */
export function withQuery(current: ParsedExploreParams, q: string): ParsedExploreParams {
  return { ...current, q, exact: q ? current.exact : false, page: 1 };
}
