import { Bricolage_Grotesque, Inter, Space_Mono, Noto_Sans_Telugu } from "next/font/google";

/**
 * Self-hosted via next/font (downloaded and served from the app at build time — no
 * runtime request to Google). Pairing rationale is in DESIGN.md ("Modern Utsavam").
 */

// Display — Bricolage Grotesque: a warm, slightly humanist grotesque with an
// optical-size axis. Carries the confident "festival" headline voice. Variable.
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

// Body — Inter: neutral, highly legible UI + reading sans. Variable weight.
export const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

// Utility / data — Space Mono for eyebrows, coordinates, fees, and indices.
export const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

// Telugu accent — Noto Sans Telugu for the bilingual hero flourish (hero only; the rest of
// the prototype's content is English). Trimmed to exactly what renders: ONE weight (600) and
// the Telugu subset alone. It previously shipped three weights plus the latin subset, i.e. two
// unused faces and a duplicate latin alphabet, on every route — the latin glyphs are never
// needed because the fallback chain (`--font-body`) handles non-Telugu text.
export const fontTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["600"],
  display: "swap",
  variable: "--font-telugu",
});
