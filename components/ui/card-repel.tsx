"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Cursor-repel hover (owner directive 2026-07-30): as the pointer moves across a card, the
 * card drifts a few pixels the OPPOSITE way, as if gently pushed — a subtle physical response
 * that makes a grid feel alive without any of the banned tilt/parallax theatrics.
 *
 * Deliberate constraints:
 *  • **2D translate only.** A 3D transform on an ancestor of a `view-transition-name` element
 *    corrupts the morph snapshot (docs/03 §5) — the card image is exactly that element, so this
 *    stays a plain `translate`.
 *  • Movement is capped at `max` px and eased via a rAF lerp, so it reads as weight, not jitter.
 *  • Fine pointers only, and fully inert under `prefers-reduced-motion` (no listeners, no rAF,
 *    no transform) — the card then behaves exactly as it does at rest.
 *  • **It holds still over interactive controls.** Anything marked `data-repel-freeze` (the
 *    wishlist heart) parks the drift at rest while the pointer is on it. This is a usability
 *    fix, not a nicety: the card moves AWAY from the cursor, so without it, aiming at a button
 *    inside the card pushes that button away — the owner reported the save heart as genuinely
 *    hard to hit. Freezing makes it a stationary target the moment you reach for it.
 *  • Amplitude is deliberately small (owner directive: "make the temple card motion minimal").
 *    The point is a hint of weight, not a dodge; at the earlier 10px/0.06 the card visibly
 *    fled the pointer.
 */
export function CardRepel({
  children,
  strength = 0.028,
  max = 4,
  className,
}: {
  children: ReactNode;
  /** Fraction of the cursor's offset-from-centre applied as counter-movement. */
  strength?: number;
  /** Hard cap on the translation, px. */
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let running = false;

    const clamp = (v: number) => Math.max(-max, Math.min(max, v));

    const loop = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      // Settle and stop: once we're at rest and heading nowhere, drop the frame loop and the
      // compositor hint so an idle grid of cards costs nothing.
      if (Math.abs(targetX - x) < 0.05 && Math.abs(targetY - y) < 0.05 && targetX === 0 && targetY === 0) {
        el.style.transform = "";
        el.style.willChange = "";
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      el.style.willChange = "transform";
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      // Over an interactive control, settle to rest instead of following the pointer, so the
      // control stops retreating from the cursor that is aiming at it.
      const t = e.target as Element | null;
      if (t?.closest?.("[data-repel-freeze]")) {
        targetX = 0;
        targetY = 0;
        start();
        return;
      }
      const r = el.getBoundingClientRect();
      // Offset from the card's centre, inverted → the card moves away from the cursor.
      targetX = clamp(-(e.clientX - (r.left + r.width / 2)) * strength);
      targetY = clamp(-(e.clientY - (r.top + r.height / 2)) * strength);
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
      el.style.willChange = "";
    };
  }, [reduce, strength, max]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
