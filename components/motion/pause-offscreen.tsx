"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pauses the looping decorative animations inside its subtree while that subtree is off-screen.
 *
 * CSS animations do not stop when they scroll out of view: the homepage's two birds (a drift
 * wrapper plus a flap layer each), the hero's slow breathing drift, and the finale marquee were
 * all still animating for the entire session — the marquee sits below the fold, so it ran the
 * whole time a visitor read the page without ever being seen. That is continuous compositor and
 * battery cost for zero perceivable benefit, and it lands hardest on the low-end Android devices
 * least able to absorb it.
 *
 * This changes nothing visible: while the section is on screen the animations run exactly as
 * authored. It simply sets `data-motion-paused` when it isn't, and globals.css flips
 * `animation-play-state` for the looping classes. Because it's `animation-play-state` and not a
 * class swap, animations resume mid-cycle rather than restarting, so scrolling back is seamless.
 *
 * No-ops when IntersectionObserver is unavailable (the animations then behave as before), and
 * carries no reduced-motion logic of its own — those animations are already killed outright.
 */
export function PauseOffscreen({
  children,
  className,
  /** Keep running slightly beyond the viewport so a fast scroll never reveals a paused frame. */
  rootMargin = "200px 0px 200px 0px",
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.removeAttribute("data-motion-paused");
        else el.setAttribute("data-motion-paused", "");
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
