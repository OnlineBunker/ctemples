import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts (last wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * URL-safe slug from a human label ("Tamil Nadu" -> "tamil-nadu", "Jammu and
 * Kashmir" -> "jammu-and-kashmir"). Used for state/deity filter URLs so nothing
 * hardcodes the current dataset.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tiny inline SVG shimmer, base64-encoded for use as next/image `blurDataURL`.
 * Warm porcelain tones so real photos fade in over the light canvas without shift.
 */
export function shimmer(width: number, height: number): string {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#F4EADF" offset="0%"/><stop stop-color="#FBF6F0" offset="50%"/><stop stop-color="#F4EADF" offset="100%"/></linearGradient></defs><rect width="${width}" height="${height}" fill="#F4EADF"/><rect width="${width}" height="${height}" fill="url(#g)" opacity="0.7"/></svg>`;
  const toBase64 =
    typeof window === "undefined" ? Buffer.from(svg).toString("base64") : window.btoa(svg);
  return `data:image/svg+xml;base64,${toBase64}`;
}
