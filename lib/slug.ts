import { slugify } from "./utils";
import { haversineKm } from "./distance";

const GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/**
 * Standard geohash encoder, truncated to `precision` characters. Used only as the
 * last-resort slug disambiguator (docs/09 §5) — deterministic from coordinates, never a
 * fabricated distinguisher like an incrementing counter.
 */
export function geohash(lat: number, lng: number, precision = 5): string {
  let latMin = -90,
    latMax = 90,
    lngMin = -180,
    lngMax = 180;
  let isLng = true;
  let bit = 0;
  let charBits = 0;
  let out = "";

  while (out.length < precision) {
    if (isLng) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        charBits = (charBits << 1) | 1;
        lngMin = mid;
      } else {
        charBits = charBits << 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        charBits = (charBits << 1) | 1;
        latMin = mid;
      } else {
        charBits = charBits << 1;
        latMax = mid;
      }
    }
    isLng = !isLng;
    bit++;
    if (bit === 5) {
      out += GEOHASH_BASE32[charBits];
      bit = 0;
      charBits = 0;
    }
  }
  return out;
}

export interface SlugRegistryEntry {
  slug: string;
  name: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  mintedAt: string; // ISO date
  /** Prior slugs this record has held — appended on rename, each 301-redirected. */
  slugHistory?: string[];
}

export interface SlugMintInput {
  name: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
}

/**
 * Progressive disambiguation (docs/09 §5, D14): slugify(name) → collision → +city →
 * collision → +state → collision → +geohash5. Never a fake distinguisher (no counters).
 * Pure — takes the current registry, doesn't mutate or persist it (the caller commits
 * the returned slug as a new SlugRegistryEntry).
 */
export function mintSlug(input: SlugMintInput, registry: SlugRegistryEntry[]): string {
  const taken = new Set(registry.map((e) => e.slug));
  const base = slugify(input.name);
  if (!taken.has(base)) return base;

  const withCity = `${base}-${slugify(input.city)}`;
  if (!taken.has(withCity)) return withCity;

  const withState = `${withCity}-${slugify(input.state)}`;
  if (!taken.has(withState)) return withState;

  const withGeohash = `${withState}-g${geohash(input.coordinates.lat, input.coordinates.lng, 5)}`;
  if (!taken.has(withGeohash)) return withGeohash;

  // The cascade is exhausted: two records with the same name+city+state AND the same
  // ~5-char geohash cell. No further deterministic distinguisher is defined (docs/09 §5
  // explicitly rules out fake ones), so this must surface rather than silently mint a
  // colliding slug.
  throw new Error(
    `mintSlug: exhausted the full disambiguation cascade for "${input.name}" (${input.city}, ${input.state}) — "${withGeohash}" is already taken.`,
  );
}

const SAME_RECORD_RADIUS_KM = 2;

/**
 * Idempotent entry point (docs/09 §10 — "re-running ingestion never renames an existing
 * slug"): if a registry entry matches this exact name/city/state AND sits within
 * `SAME_RECORD_RADIUS_KM` of it, it's treated as the same record and its frozen slug is
 * returned unchanged. Name/city/state alone isn't enough — two genuinely distinct
 * temples can share all three at 20k scale (a generic name in a big city); coordinates
 * are the disambiguating signal that keeps them from silently colliding onto one slug.
 */
export function getOrMintSlug(input: SlugMintInput, registry: SlugRegistryEntry[]): string {
  const existing = registry.find(
    (e) =>
      e.name === input.name &&
      e.city === input.city &&
      e.state === input.state &&
      haversineKm(e.coordinates, input.coordinates) <= SAME_RECORD_RADIUS_KM,
  );
  return existing ? existing.slug : mintSlug(input, registry);
}
