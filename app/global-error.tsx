"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown by the ROOT LAYOUT itself (fonts, providers, chrome).
 * `app/error.tsx` cannot catch those — it renders *inside* the layout that failed — so without
 * this file such a failure produces a completely blank white page.
 *
 * It must supply its own `<html>`/`<body>`, because the layout that normally provides them is
 * exactly what broke. That also means no Tailwind-dependent chrome and no fonts can be assumed
 * here: the styling is deliberately inline and self-contained, using the locked palette values
 * directly so the page still looks like CTemples even with the design system unavailable.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#241021",
          color: "#FBF6F0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          {/* The gopuram mark, inlined — components/ may itself be unavailable here. */}
          <svg
            viewBox="0 0 48 56"
            width="46"
            height="52"
            fill="none"
            stroke="#E5006D"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 52 L18 12 L30 12 L44 52 Z" />
            <line x1="6.8" y1="44" x2="41.2" y2="44" />
            <line x1="9.6" y1="36" x2="38.4" y2="36" />
            <line x1="12.4" y1="28" x2="35.6" y2="28" />
            <path d="M20 52 L20 43 Q24 38.5 28 43 L28 52" />
            <path d="M18 12 L24 4.5 L30 12" />
          </svg>
          <p
            style={{
              marginTop: "22px",
              fontSize: "10.5px",
              letterSpacing: "0.3em",
              color: "#FFC300",
              textTransform: "uppercase",
            }}
          >
            Something gave way
          </p>
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(28px,5vw,44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            CTemples couldn&apos;t load.
          </h1>
          <p style={{ marginTop: "12px", fontSize: "15px", lineHeight: 1.6, color: "rgba(251,246,240,.6)" }}>
            Something failed before the page could be built. Reloading usually clears it.
          </p>
          <div style={{ marginTop: "28px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: "999px",
                background: "#E5006D",
                color: "#FBF6F0",
                padding: "14px 26px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
            {/* A raw anchor, deliberately: `next/link` performs a client-side navigation, and
                the thing that just failed is the root layout that hosts the router. A full
                document load is the only reliable way out of a broken shell. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: "1.5px solid rgba(251,246,240,.35)",
                color: "#FBF6F0",
                padding: "14px 26px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
          {error.digest ? (
            <p style={{ marginTop: "30px", fontSize: "9.5px", letterSpacing: "0.2em", color: "rgba(251,246,240,.35)", textTransform: "uppercase" }}>
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
