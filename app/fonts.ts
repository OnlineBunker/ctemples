import { Fraunces, Hanken_Grotesk, Space_Mono } from "next/font/google";

/**
 * Self-hosted via next/font (downloaded and served from the app at build time — no
 * runtime request to Google). Weights kept minimal for a small font payload.
 * Rationale for the pairing is in DESIGN.md.
 */

// Display — a carved, high-contrast optical serif. Variable (wght + opsz), + italic.
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
});

// Body — a warm humanist grotesque for reading + UI. Variable weight.
export const fontBody = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

// Utility / data — a monospace with character for the "field-guide" layer.
export const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});
