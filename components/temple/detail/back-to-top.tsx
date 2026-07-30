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

  // rAF-gated like every other scroll listener in the codebase. Unthrottled, this ran a React
  // state comparison on every scroll event — cheap individually, but it fires far more often
  // than once per frame on a touch device, and this is the long temple page.
  useEffect(() => {
    let raf = 0;
    let queued = false;
    const measure = () => {
      queued = false;
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
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
