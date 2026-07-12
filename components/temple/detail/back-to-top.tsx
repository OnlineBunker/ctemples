"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Mobile-only back-to-top (docs/06 §4) — appears after 2 viewport-heights of scroll.
 * Desktop has the sticky section-index rail instead, so this is hidden at lg+.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 2);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-plum shadow-lg transition-colors hover:text-magenta print:hidden lg:hidden"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
