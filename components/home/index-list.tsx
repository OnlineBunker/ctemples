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
  const [visible, setVisible] = useState(false);
  // The preview's SOURCE is written straight to the DOM, like its transform already is. Holding
  // it in React state meant every row's `onMouseEnter` committed a state change, re-rendering
  // all 15 rows (each a TransitionLink with an image) just to swap one decorative <img src>.
  // Sweeping the cursor down the list re-rendered the whole section repeatedly. `visible` stays
  // in state because it only flips on entering/leaving the section, not per row.
  const imgRef = useRef<HTMLImageElement>(null);
  const shownSrc = useRef<string | null>(null);
  const showPreview = (src: string) => {
    if (!enabled || !src) return;
    if (shownSrc.current !== src) {
      shownSrc.current = src;
      if (imgRef.current) imgRef.current.src = src;
    }
    setVisible(true);
  };

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
          {/* A plain <img>, not next/image: the src is assigned imperatively (above), the image
              is purely decorative, and it was already `unoptimized`, so next/image added a
              client component and a re-render for no benefit here. */}
          {/* Starts on a 1x1 transparent GIF rather than no `src` at all: an <img> with no
              source is a broken-image state (naturalWidth 0) for as long as nobody has hovered
              a row. The real source is swapped in imperatively by showPreview(). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <Reveal>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="font-mono text-[11px] font-bold tracking-[.28em] text-magenta-deep">01 — THE INDEX</p>
          <p className="hidden font-mono text-[10.5px] tracking-[.2em] text-ink-muted sm:block">
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
                showPreview(t.img);
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
                <span className="shrink-0 font-mono text-xs text-magenta-deep" style={{ width: "clamp(30px,4vw,58px)" }}>
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
                    {/* Optimized, and that matters more here than anywhere: these render at
                        52x66 CSS px but Wikimedia only serves one fixed width, so unoptimized
                        they pulled a 1280x1109 / ~438 KB JPEG *each* — 15 of them, the bulk of
                        the homepage's measured 4.33 MB. At `sizes="52px"` the optimizer returns
                        roughly 1 KB of AVIF per row. */}
                    <Image
                      src={t.img}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="52px"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[.14em] text-ink-muted sm:block">
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
