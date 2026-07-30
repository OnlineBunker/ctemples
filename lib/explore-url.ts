import type { DeityKey } from "./deities";
import { DEITY_ORDER } from "./deities";
import type { SortKey } from "./filter";
import type { LatLng } from "./distance";

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
  /**
   * `?near=<lat>,<lng>` — the visitor's own coordinates, supplied by the browser's
   * Geolocation API (never guessed). Present only when they've allowed it; it unlocks the
   * `nearest` sort and the "N km away" caption. Rounded to 3dp (~110 m) when written, so a
   * shared URL never carries a precise home address.
   */
  near?: LatLng;
}

const VALID_SORT: SortKey[] = ["rating", "popularity", "name", "nearest"];
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

  const near = parseNear(first(sp.near));

  const sortRaw = first(sp.sort)?.trim() ?? "";
  const sortParsed: SortKey = (VALID_SORT as string[]).includes(sortRaw)
    ? (sortRaw as SortKey)
    : (LEGACY_SORT_MAP[sortRaw] ?? "rating");
  // `nearest` without coordinates is unsatisfiable (it would silently fall through to an
  // arbitrary order) — coerce it back to the default rather than pretend to sort by distance.
  const sort: SortKey = sortParsed === "nearest" && !near ? "rating" : sortParsed;

  const pageRaw = Number(first(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return { view, q, exact, state, deity, tags, sort, page, near };
}

/** `"12.972,77.594"` → `{lat,lng}`; anything malformed or out of range → undefined. */
function parseNear(raw: string | undefined): LatLng | undefined {
  if (!raw) return undefined;
  const [latRaw, lngRaw, ...rest] = raw.split(",");
  if (rest.length > 0) return undefined;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  return { lat, lng };
}

/** Coordinates are written at 3dp (~110 m) — enough to rank temples, too coarse to locate a home. */
export function formatNearParam(near: LatLng): string {
  return `${near.lat.toFixed(3)},${near.lng.toFixed(3)}`;
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
  // Mirror the parse-side rule so build/parse stay inverses: no coordinates, no `nearest`.
  const sort: SortKey = next.sort === "nearest" && !next.near ? "rating" : next.sort;

  if (next.state) params.set("state", next.state);
  if (next.deity) params.set("deity", next.deity);
  [...next.tags].sort((a, b) => a.localeCompare(b)).slice(0, MAX_TAGS).forEach((t) => params.append("tag", t));
  if (sort !== "rating") params.set("sort", sort);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.q) params.set("q", next.q);
  if (next.q && next.exact) params.set("exact", "1");
  if (next.view === "map") params.set("view", "map");
  if (next.near) params.set("near", formatNearParam(next.near));

  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

/**
 * A clean switch to the other view (docs/15 §0b, owner directive 2026-07-30). List and map
 * are two distinct ways of browsing, and their controls are deliberately NOT shared: the map's
 * state selection and the list's facet filters both live in `?state=`, so carrying params
 * across meant picking a state on the map silently pre-filtered the list. Switching modes
 * therefore starts fresh — only the visitor's own location (a personalisation, not a filter)
 * survives, so "nearest me" still works the moment they land back in list mode.
 */
export function buildViewHref(current: ParsedExploreParams, view: ExploreView): string {
  return buildExploreHref(current, {
    view,
    q: "",
    exact: false,
    state: undefined,
    deity: undefined,
    tags: [],
    sort: view === "list" && current.near ? "nearest" : "rating",
    page: 1,
  });
}

/** Drops `exact` whenever `q` changes/clears — an `exact` flag with no query is meaningless. */
export function withQuery(current: ParsedExploreParams, q: string): ParsedExploreParams {
  return { ...current, q, exact: q ? current.exact : false, page: 1 };
}
