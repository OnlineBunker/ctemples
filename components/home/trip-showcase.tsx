"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { TripIdeaCard, type TripIdea } from "./trip-idea-card";

/**
 * Trip-ideas showcase carousel (docs/04 §4, docs/08 §6 — Amendment A): a center-emphasis,
 * user-driven carousel. The track is native horizontal scroll with mandatory center
 * snapping — drag, swipe, trackpad, and wheel all work for free; arrows scroll one card.
 * A rAF-throttled scroll listener scales/fades cards by distance from center (the
 * "peeking neighbors" look). No autoplay, no timers — only the hero autoplays.
 *
 * Reduced motion: the scroll-linked emphasis is skipped (uniform cards) and arrow
 * scrolling is instant; snap and keyboard access are unaffected.
 */
export function TripShowcase({ ideas }: { ideas: TripIdea[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // All geometry is measured with bounding rects relative to the track's own rect —
  // offsetLeft would be measured from whichever ancestor happens to be the
  // offsetParent (the Reveal wrapper's transform, the centered shell…), which shifts
  // with viewport width. Rect centers are also invariant under the origin-centered
  // scale emphasis this component applies.
  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
      if (reduce) {
        el.style.transform = "";
        el.style.opacity = "";
      } else {
        // 0 at center → 1 at one card-width away; clamps beyond that.
        const t = Math.min(1, dist / el.offsetWidth);
        el.style.transform = `scale(${1 - t * 0.06})`;
        el.style.opacity = String(1 - t * 0.35);
      }
    });
    setActive(best);
  }, [reduce]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(ideas.length - 1, i));
      const el = itemRefs.current[clamped];
      const track = trackRef.current;
      if (!el || !track) return;
      const trackRect = track.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - (trackRect.left + trackRect.width / 2);
      track.scrollTo({
        left: track.scrollLeft + delta,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [ideas.length, reduce],
  );

  const arrow =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-canvas text-plum transition-colors hover:border-magenta hover:text-magenta disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-plum";

  return (
    <div>
      <ul
        ref={trackRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[10vw] pb-2 pt-1 sm:-mx-8 sm:px-[calc(50%-13rem)] lg:-mx-12 lg:gap-7 lg:px-[calc(50%-17.5rem)]"
        aria-label="Trip ideas"
      >
        {ideas.map((idea, i) => (
          <li
            key={idea.title}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="w-[80vw] shrink-0 snap-center transition-[transform,opacity] duration-150 ease-out sm:w-[26rem] lg:w-[35rem]"
          >
            <TripIdeaCard idea={idea} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          disabled={active <= 0}
          className={arrow}
          aria-label="Previous trip idea"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <span className="font-mono text-xs uppercase tracking-label text-ink-muted" aria-hidden>
          {active + 1} / {ideas.length}
        </span>
        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          disabled={active >= ideas.length - 1}
          className={arrow}
          aria-label="Next trip idea"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
