"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TransitionLink } from "@/components/motion/transition-link";
import { Reveal } from "@/components/motion/reveal";

/**
 * 01 — THE INDEX (docs/15 §0a): every temple as an oversized type list. Rows pad left
 * and turn magenta on hover; mobile rows carry a small arch thumbnail.
 *
 * Cursor-follow preview (docs/08 §5#9, Amendment B): on a fine pointer, hovering a row
 * floats a 288×368 arch thumbnail of that temple which trails the cursor (lerp 0.13,
 * offset +30/−250px, tilt ±6° by follow-lag). Gated OFF under reduced motion and on
 * touch/coarse pointers — those keep the inline mobile thumbnail and plain hover feedback.
 */
export interface IndexRow {
  id: string;
  num: string;
  name: string;
  loc: string;
  img: string;
}

export function IndexList({ rows }: { rows: IndexRow[] }) {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Attach only on a fine pointer, and never under reduced motion. Recomputed if the
  // reduced-motion preference flips (framer resolves it post-hydration).
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(!reduce && fine);
  }, [reduce]);

  // Drive the follow loop only while the card is actually shown (enabled + visible). Gating on
  // `visible` means an idle desktop session — loaded `/`, never hovered the index — runs zero
  // per-frame work and holds no compositor layer. Its own effect (not folded into the enable
  // check) so it re-runs when either flips: the card ref is null during the pass that sets
  // `enabled`. On show we snap to the cursor's last point so the card appears in place.
  useEffect(() => {
    if (!enabled || !visible) return;
    const card = cardRef.current;
    if (!card) return;
    let x = targetRef.current.x;
    let y = targetRef.current.y;
    let raf = 0;
    const loop = () => {
      const t = targetRef.current;
      x += (t.x - x) * 0.13;
      y += (t.y - y) * 0.13;
      const rot = Math.max(-6, Math.min(6, (t.x - x) * 0.07));
      card.style.transform = `translate(${(x + 30).toFixed(1)}px,${(y - 250).toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, visible]);

  return (
    <section
      id="index"
      className="relative bg-porcelain text-ink"
      style={{
        padding: "clamp(88px,13vh,150px) clamp(20px,6vw,110px) clamp(70px,10vh,120px)",
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {/* The cursor-follow preview card — fixed, decorative, above the list. Position is
          written imperatively by the rAF loop; opacity crossfades on show/hide. */}
      {enabled ? (
        <div
          ref={cardRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[90] overflow-hidden"
          style={{
            width: 288,
            height: 368,
            borderRadius: "999px 999px 22px 22px",
            boxShadow: "0 34px 90px rgba(36,16,33,.42)",
            background: "#3D0A40",
            opacity: visible ? 1 : 0,
            transition: "opacity .35s ease",
            willChange: visible ? "transform" : undefined,
          }}
        >
          {previewImg ? (
            <Image src={previewImg} alt="" fill unoptimized sizes="288px" className="object-cover" />
          ) : null}
        </div>
      ) : null}

      <Reveal>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="font-mono text-[11px] font-bold tracking-[.28em] text-magenta">01 — THE INDEX</p>
          <p className="hidden font-mono text-[10.5px] tracking-[.2em] text-ink/45 sm:block">
            HOVER TO BEHOLD · CLICK TO ENTER
          </p>
        </div>
        <h2
          className="font-display font-bold text-ink"
          style={{
            fontSize: "clamp(38px,6.4vw,88px)",
            letterSpacing: "-.03em",
            lineHeight: 1.02,
            marginBottom: "clamp(30px,6vh,68px)",
          }}
        >
          Choose a doorway.
        </h2>
      </Reveal>
      <Reveal>
        <ul className="border-b border-ink/15">
          {rows.map((t) => (
            <li
              key={t.id}
              className="border-t border-ink/15"
              onMouseEnter={(e) => {
                if (!enabled) return;
                targetRef.current = { x: e.clientX, y: e.clientY };
                if (t.img) setPreviewImg(t.img);
                setVisible(Boolean(t.img));
              }}
              onMouseMove={(e) => {
                if (enabled) targetRef.current = { x: e.clientX, y: e.clientY };
              }}
            >
              <TransitionLink
                href={`/temples/${t.id}`}
                className="group flex items-center text-ink transition-[padding-left] duration-500 ease-threshold hover:pl-5 focus-visible:pl-5 motion-reduce:!pl-0"
                style={{ gap: "clamp(14px,3vw,34px)", paddingBlock: "clamp(17px,2.8vh,28px)" }}
              >
                <span className="shrink-0 font-mono text-xs text-magenta" style={{ width: "clamp(30px,4vw,58px)" }}>
                  {t.num}
                </span>
                <span
                  className="min-w-0 flex-1 text-balance font-display font-semibold transition-colors duration-300 group-hover:text-magenta"
                  style={{ fontSize: "clamp(23px,4.2vw,52px)", letterSpacing: "-.02em", lineHeight: 1.06 }}
                >
                  {t.name}
                </span>
                {t.img ? (
                  <span className="relative block h-[66px] w-[52px] shrink-0 overflow-hidden rounded-[26px_26px_9px_9px] sm:hidden">
                    <Image src={t.img} alt="" fill sizes="52px" unoptimized className="object-cover" />
                  </span>
                ) : null}
                <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[.14em] text-ink/50 sm:block">
                  {t.loc}
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
