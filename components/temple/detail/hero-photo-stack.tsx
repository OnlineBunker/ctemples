"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ViewTransition } from "@/components/motion/view-transition";
import { TempleImage } from "@/components/media/temple-image";
import type { Region } from "@/lib/types";

/**
 * The temple hero as a STACK of three photographs (owner directive 2026-07-30) instead of a
 * single plate.
 *
 * At rest the two supporting photos sit behind the main one, rotated and offset so roughly
 * half of each peeks out — a pile of prints on a table. On hover (or keyboard focus anywhere
 * in the hero) they fan outward and come forward, so all three read clearly. A scroll-linked
 * drift gives the group a little life as the page moves.
 *
 * Constraints honoured:
 *  • The front photo is the View-Transition morph target (`temple-{id}`) and is never
 *    rotated or scaled — only the two behind it move, so the card→hero morph stays clean.
 *    All transforms are 2D (a 3D one on an ancestor corrupts the morph snapshot, docs/03 §5).
 *  • The fan is sized to stay inside the column: the front plate is 78% of the container, so
 *    the outward travel has room and nothing spills into the page's clipped overflow.
 *  • The back photos are decorative (`aria-hidden`) — the front one carries the real alt, so
 *    screen readers describe the temple exactly once.
 *  • Under `prefers-reduced-motion` the scroll drift never attaches and the fan is a plain
 *    opacity/position hold — the resting composition is what everyone sees.
 */
export interface StackPhoto {
  url: string;
  alt: string;
}

export function HeroPhotoStack({
  photos,
  templeId,
  region,
  name,
  city,
}: {
  photos: StackPhoto[];
  templeId: string;
  region: Region;
  name: string;
  city: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const backRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Explicit fanned state, not hover alone. Hover/`:focus-within` could never fire for keyboard
  // or touch users — every plate is a `pointer-events-none`, `aria-hidden` div, so nothing in
  // the stack was focusable — which meant photos 2 and 3 were unreachable without a mouse while
  // the caption still instructed "Hover to fan out" (WCAG 2.1.1 + 3.3.2).
  const [fanned, setFanned] = useState(false);

  const front = photos[0];
  const backs = photos.slice(1, 3);

  // Scroll-linked drift: the supporting photos ease apart as the hero scrolls, then settle.
  // rAF-throttled, transform-only, and never attached under reduced motion.
  useEffect(() => {
    if (reduce) return;
    const wrap = wrapRef.current;
    if (!wrap || backs.length === 0) return;
    let raf = 0;
    let queued = false;
    const apply = () => {
      queued = false;
      const rect = wrap.getBoundingClientRect();
      // 0 while the hero fills the view → 1 once it has scrolled a viewport away.
      const p = Math.min(1, Math.max(0, -rect.top / (window.innerHeight || 800)));
      backRefs.current.forEach((el, i) => {
        if (!el) return;
        const dir = i === 0 ? -1 : 1;
        el.style.setProperty("--drift-x", `${(dir * p * 7).toFixed(2)}%`);
        el.style.setProperty("--drift-y", `${(p * -10).toFixed(2)}px`);
        el.style.setProperty("--drift-r", `${(dir * p * 2.5).toFixed(2)}deg`);
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduce, backs.length]);

  if (!front) return null;

  const ARCH = "999px 999px 26px 26px";

  return (
    <div
      ref={wrapRef}
      className="group/stack relative mx-auto w-full max-w-[460px]"
      // Reserve the fan's travel so a hovered plate never spills outside the column.
      style={{ paddingInline: "6%" }}
    >
      {/* Gold orbit ring, anchored to the front plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0 rounded-full border border-turmeric/50"
        style={{ top: "-5%", left: "0%", width: "62%", aspectRatio: "1/1" }}
      />

      {/* Supporting photos — behind, rotated, roughly half-hidden at rest; they fan out and
          come forward on hover/focus-within. */}
      {backs.map((photo, i) => {
        const dir = i === 0 ? -1 : 1;
        return (
          <div
            key={photo.url}
            ref={(el) => {
              backRefs.current[i] = el;
            }}
            aria-hidden
            data-fanned={fanned || undefined}
            className={[
              "pointer-events-none absolute inset-y-[6%] w-[78%] overflow-hidden bg-surface-recess",
              "transition-transform duration-[700ms] ease-threshold motion-reduce:!transition-none",
              i === 0 ? "left-0 z-[1]" : "right-0 z-[2]",
              // Rest: peeking out by ~45%. Fanned (hover OR the explicit toggle): wider + forward.
              i === 0
                ? "[transform:translate(calc(-22%+var(--drift-x,0%)),var(--drift-y,0px))_rotate(calc(-7deg+var(--drift-r,0deg)))_scale(.9)] group-hover/stack:[transform:translate(-40%,-2%)_rotate(-11deg)_scale(.93)] data-[fanned]:[transform:translate(-40%,-2%)_rotate(-11deg)_scale(.93)]"
                : "[transform:translate(calc(22%+var(--drift-x,0%)),var(--drift-y,0px))_rotate(calc(7deg+var(--drift-r,0deg)))_scale(.9)] group-hover/stack:[transform:translate(40%,-2%)_rotate(11deg)_scale(.93)] data-[fanned]:[transform:translate(40%,-2%)_rotate(11deg)_scale(.93)]",
            ].join(" ")}
            style={{ borderRadius: ARCH, boxShadow: "0 18px 50px rgba(36,16,33,.22)" }}
          >
            <TempleImage
              src={photo.url}
              alt=""
              region={region}
              seed={`${templeId}-stack-${i}`}
              variant={i + 1}
              sizes="(max-width: 860px) 60vw, 340px"
            />
            {/* Veil the supporting plates so the main one stays dominant; lifts when fanned. */}
            <span
              data-fanned={fanned || undefined}
              className="absolute inset-0 bg-porcelain/45 transition-opacity duration-500 group-hover/stack:opacity-0 data-[fanned]:opacity-0"
              style={{ borderRadius: ARCH }}
            />
          </div>
        );
      })}

      {/* The main photograph — the morph target. Never transformed. */}
      <div
        className="relative z-[3] mx-auto w-[78%] overflow-hidden bg-surface-recess"
        style={{ borderRadius: ARCH, boxShadow: "0 34px 90px rgba(36,16,33,.26)", aspectRatio: "3/4" }}
      >
        <ViewTransition name={`temple-${templeId}`} share="morph">
          <div className="absolute inset-0">
            <TempleImage
              src={front.url}
              alt={front.alt || `${name}, ${city}`}
              region={region}
              seed={templeId}
              priority
              sizes="(max-width: 860px) 78vw, 340px"
            />
          </div>
        </ViewTransition>
      </div>

      {/* A real control, so the fan is reachable by keyboard, switch, and touch — not just by a
          mouse. Hover still works as an additional, unannounced affordance. The copy is
          mode-neutral because "Hover" is an instruction half the audience cannot follow. */}
      {backs.length > 0 ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setFanned((f) => !f)}
            aria-expanded={fanned}
            className="inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[9.5px] uppercase tracking-[.2em] text-ink-muted transition-colors hover:text-magenta focus-visible:text-magenta"
          >
            {fanned ? "Stack photographs" : `Show all ${photos.length} photographs`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
