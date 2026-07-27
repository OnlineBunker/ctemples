import type { Config } from "tailwindcss";

/**
 * CTemples design tokens — "Modern Utsavam" light-mode direction.
 *
 * Reference palette (see DESIGN.md and the approved visual reference):
 *   porcelain canvas · magenta · coral · saffron · turmeric · plum.
 */

const magenta = { DEFAULT: "#E5006D", soft: "#FCE0EE", deep: "#B80057" } as const;
const coral = { DEFAULT: "#FF3D6E", soft: "#FFE3EA", deep: "#E02453" } as const;
const saffron = { DEFAULT: "#FF7A00", soft: "#FFE9D3", deep: "#D96400" } as const;
const turmeric = { DEFAULT: "#FFC300", soft: "#FFF3CC", deep: "#E0AB00" } as const;
const plum = { DEFAULT: "#3D0A40", soft: "#F3E6F0", deep: "#2A0730", muted: "#6E4A70" } as const;

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
        // Core neutrals — porcelain page, white elevated surfaces, plum-tinted ink.
        porcelain: { DEFAULT: "#FBF6F0", deep: "#F4EADF" },
        canvas: { DEFAULT: "#FFFFFF", soft: "#F4EADF", elevated: "#FFFFFF" },
        ink: { DEFAULT: "#241021", muted: "#6B5A67", subtle: "#9A8C96" },
        line: { DEFAULT: "#ECE0D6", strong: "#D8C8BA" },

        // Section-band surfaces (docs/15 §2B, "the walk through a temple") — every value
        // is a LOCKED palette color; no new hues. bg-surface-* names the chamber.
        surface: {
          canvas: "#FBF6F0", // porcelain — the nave (default reading ground)
          recess: "#F4EADF", // porcelain-deep — a side chamber (reconciles proto #EFE6DA)
          sanctum: "#3D0A40", // plum — the inner sanctum (gravity)
          deep: "#241021", // ink — the garbhagriha (rarest: gallery band, 404)
        },

        // Reference brand pigments (canonical vocabulary for new code).
        magenta,
        coral,
        saffron,
        turmeric,
        plum,

        // Functional — danger decoupled to a true red (errors must not read as brand).
        success: { DEFAULT: "#2E7D32", soft: "#E8F5E9" },
        warning: { DEFAULT: "#E6A23C", soft: "#FFF4E0" },
        info: { DEFAULT: "#3E6CC4", soft: "#E3EAF7" },
        danger: { DEFAULT: "#D32F2F", soft: "#FCE4E4" },

        // Region coding — icon + label lead; colour reinforces (DESIGN_SYSTEM §1.4).
        region: {
          north: "#7A2C9E",
          south: "#E5006D",
          east: "#FF7A00",
          west: "#FF3D6E",
          northeast: "#E0AB00",
          central: "#3D0A40",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        telugu: ["var(--font-telugu)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fluid display sizes (clamp) for editorial hero moments.
        "display-xl": ["clamp(2.75rem, 8vw, 7rem)", { lineHeight: "0.96", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 5.5vw, 4.5rem)", { lineHeight: "1.0", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.85rem, 3.6vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        // Card/title Bricolage (D23 permits Bricolage in cards) — replaces ad-hoc text-xl.
        "title-lg": ["1.375rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "title-md": ["1.125rem", { lineHeight: "1.2", letterSpacing: "-0.005em" }],
        // Semantic body scale (Inter) — retires scattered text-[…] literals (docs/15 §2C).
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5" }],
        // Label scale (Space Mono) — small brand-colored text uses magenta-deep (.eyebrow).
        label: ["0.7rem", { lineHeight: "1.4" }],
        "label-sm": ["0.65rem", { lineHeight: "1.3" }],
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
        card: "1.25rem",
        // Small controls get their own radius (docs/15 §2D — the missing small radius).
        input: "0.625rem",
        chip: "0.625rem",
        // The arch, in three earned tiers (docs/15 §2A). ENFORCEMENT: use only on
        // imagery-you-enter and passages between sections — never on chrome/controls/text.
        portal: "999px 999px 1.25rem 1.25rem", // portrait imagery you enter
        arch: "2.25rem 2.25rem 1rem 1rem", // landscape imagery that morphs (card === hero)
        "arch-sm": "1.25rem 1.25rem 0.5rem 0.5rem", // small thumbnails
      },
      boxShadow: {
        // Restrained, warm elevation on a porcelain canvas (DESIGN_SYSTEM §10).
        sm: "0 1px 2px rgba(61, 10, 64, 0.06)",
        md: "0 2px 10px rgba(61, 10, 64, 0.08)",
        lg: "0 8px 28px rgba(61, 10, 64, 0.10)",
        xl: "0 18px 48px rgba(61, 10, 64, 0.14)",
        focus: "0 0 0 2px #E5006D",
      },
      backgroundImage: {
        // The signature festival gradient (imagery panels, decorative fills). CAUTION:
        // the saffron end (#FF7A00) is ~2.6:1 with white text — do not pair bg-utsavam
        // with white/light text; components/ui/button.tsx uses a shorter, AA-safe
        // magenta->coral-deep span instead.
        utsavam: "linear-gradient(135deg, #E5006D 0%, #FF3D6E 46%, #FF7A00 100%)",
        "utsavam-soft": "linear-gradient(135deg, #FCE0EE 0%, #FFE9D3 100%)",
      },
      transitionTimingFunction: {
        // Shared easing for reveals + view transitions (DESIGN_SYSTEM §11.2).
        threshold: "cubic-bezier(0.22, 1, 0.36, 1)",
        reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
