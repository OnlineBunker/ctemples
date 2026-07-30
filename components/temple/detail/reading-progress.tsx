"use client";

import { useEffect, useState } from "react";

/**
 * Reading-progress bar for the temple entry (owner directive 2026-07-30) — a hairline magenta
 * rule across the very top of the viewport showing how far through the page you are.
 *
 * Intentionally NOT gated on reduced motion: this is information, not decoration. What reduced
 * motion removes is the easing, which is why the fill is a width change with no transition —
 * it tracks the scroll position exactly rather than animating toward it.
 *
 * The scroll listener is rAF-throttled and passive, and the element is `aria-hidden` because
 * the visible scrollbar already conveys position to assistive tech (a live-region percentage
 * would be noise). It renders nothing until there is something to scroll.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    let raf = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollable(max > 40);
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!scrollable) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent print:hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-magenta to-coral"
        style={{ width: `${(progress * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
