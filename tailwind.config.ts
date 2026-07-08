import type { Config } from "tailwindcss";

/**
 * CTemples design tokens — light-mode direction (Design System V2).
 * White canvas · temple red · sand yellow · warm gold. Palette and roles are
 * documented in DESIGN_SYSTEM_V2.md §1–2. This is the Phase 0 token foundation
 * that the Phase 1 chrome recolor builds on.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core — white canvas, ink text, warm hairlines (§1.1).
        canvas: {
          DEFAULT: "#FFFFFF",
          soft: "#FAF7F0",
          elevated: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#5A5A5A",
          subtle: "#8A8A8A",
        },
        line: {
          DEFAULT: "#E5E0D6",
          strong: "#C9C2B0",
        },
        // Brand pigments (§1.2).
        "temple-red": {
          DEFAULT: "#C62828",
          soft: "#FBE9E7",
          deep: "#8E1F1F",
        },
        "sand-yellow": {
          DEFAULT: "#E6C068",
          soft: "#FBF1D9",
          deep: "#B68A3C",
        },
        "warm-gold": {
          DEFAULT: "#B8860B",
          soft: "#F5E9C8",
          deep: "#8A6408",
        },
        // Functional (§1.3). danger shares the temple-red hue by design.
        success: { DEFAULT: "#2E7D32", soft: "#E8F5E9" },
        warning: { DEFAULT: "#E6A23C", soft: "#FFF4E0" },
        info: { DEFAULT: "#3E6CC4", soft: "#E3EAF7" },
        danger: { DEFAULT: "#C62828", soft: "#FBE9E7" },
        // Region coding (§1.4) — icon + label lead; colour reinforces.
        region: {
          north: "#3E6CC4",
          south: "#C62828",
          east: "#3E9385",
          west: "#E6A23C",
          northeast: "#4FA06B",
          central: "#B8860B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display sizes (clamp) for editorial hero moments.
        "display-xl": ["clamp(3rem, 9vw, 8.5rem)", { lineHeight: "0.94", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "0.98", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        label: "0.22em",
      },
      maxWidth: {
        prose: "68ch",
        "container-tight": "640px",
        "container-default": "960px",
        "container-wide": "1280px",
        "container-max": "1440px",
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        // Restrained elevation on a light canvas (§10.1).
        sm: "0 1px 2px rgba(26, 26, 26, 0.06)",
        md: "0 2px 8px rgba(26, 26, 26, 0.08)",
        lg: "0 4px 16px rgba(26, 26, 26, 0.10)",
        xl: "0 8px 32px rgba(26, 26, 26, 0.12)",
        focus: "0 0 0 2px #C62828",
      },
      transitionTimingFunction: {
        // Shared easing for reveals + view transitions (§11.2).
        threshold: "cubic-bezier(0.22, 1, 0.36, 1)",
        reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
