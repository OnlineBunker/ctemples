import type { CostEstimate } from "./types";

/**
 * Formatting helpers for the "field-guide" data layer (costs, distances, coordinates).
 * All pure and unit-tested — see format.test.ts.
 */

/** Format an integer number of rupees with Indian digit grouping: 400000 -> "₹4,00,000". */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Parse a human-authored rupee range like "₹4,000 - ₹6,000 per person" or
 * "₹15,000+ per person" into numbers. An open-ended "+" range has max === null.
 * Used for sorting temples by cost and for "from ₹X" summaries.
 */
export function parseRupeeRange(input: string): { min: number; max: number | null } {
  const nums = (input.match(/[\d,]+/g) ?? [])
    .map((s) => parseInt(s.replace(/,/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  if (nums.length === 0) return { min: 0, max: null };
  if (nums.length === 1) {
    return { min: nums[0], max: /\+/.test(input) ? null : nums[0] };
  }
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/** Lowest budget-band starting price across a temple's cost estimates, or null. */
export function cheapestBudget(estimates: CostEstimate[]): number | null {
  const mins = estimates
    .map((e) => parseRupeeRange(e.budget).min)
    .filter((n) => n > 0);
  return mins.length ? Math.min(...mins) : null;
}

/** "412 km", with Indian grouping for large distances. */
export function formatDistance(km: number): string {
  return `${km.toLocaleString("en-IN")} km`;
}

/** One-decimal rating: 4.8. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Cartographic label: "12.9700° N, 79.1300° E". */
export function formatCoordinates(coordinates: { lat: number; lng: number }): string {
  const ns = coordinates.lat >= 0 ? "N" : "S";
  const ew = coordinates.lng >= 0 ? "E" : "W";
  return `${Math.abs(coordinates.lat).toFixed(4)}° ${ns}, ${Math.abs(coordinates.lng).toFixed(4)}° ${ew}`;
}

/** "1 festival" / "3 festivals". */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count.toLocaleString("en-IN")} ${word}`;
}
