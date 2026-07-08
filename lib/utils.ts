import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts (last wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Tiny inline SVG shimmer, base64-encoded for use as next/image `blurDataURL`.
 * Used on the real-photo path so images fade in without layout shift.
 */
export function shimmer(width: number, height: number): string {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#1D1836" offset="0%"/><stop stop-color="#272040" offset="50%"/><stop stop-color="#1D1836" offset="100%"/></linearGradient></defs><rect width="${width}" height="${height}" fill="#171327"/><rect width="${width}" height="${height}" fill="url(#g)" opacity="0.6"/></svg>`;
  const toBase64 =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(svg);
  return `data:image/svg+xml;base64,${toBase64}`;
}
