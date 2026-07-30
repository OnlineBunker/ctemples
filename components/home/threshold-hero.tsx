"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";

/**
 * The Threshold — the prototype homepage hero (docs/15 §0a), now with its cinematic
 * motion restored per docs/08 Amendment B (§5#6–8, owner directive 2026-07-28):
 *
 * At rest it is the same full-viewport nocturnal composition — plum sky gradient + warm
 * radial glow, faint gold/magenta light rays, two mountain ranges and four gopuram
 * silhouettes on the horizon, drifting mist — with a portrait ARCH PORTAL at center
 * showing the featured temple, the same image continuing above the frame as a masked
 * GHOST TOWER, a gold orbit ring behind, and the headline "Where the gods / still live."
 * overlapping the arch, exiting through a cream dome.
 *
 * Now in motion:
 *  • Scroll-parallax rig (§5#6): a decoupled scroll-listener + rAF lerp drives the arch
 *    portal to zoom + drop, the orbit ring to scale + fade, the sky/mountain/silhouette/
 *    mist layers to translate at differing rates, and the headline to split apart + fade.
 *    Pure 2D transform/opacity. The whole rig is JS-gated OFF under reduced motion.
 *  • Drifting birds (§5#7): two faint SVG gulls crossing the sky (killed under reduced motion).
 *  • Per-slide sky shift (§5#8): a subtle warm glow crossfades to a new hue on each slide.
 *  • Living-hero drift: a slow breathing zoom on the arch photo (killed under reduced motion).
 *
 * The slideshow remains the sanctioned crossfade autoplay: 7s dwell, visible pause/play
 * control, never starts under reduced motion or Save-Data.
 */
export interface ThresholdSlide {
  id: string;
  name: string;
  city: string;
  image: string;
}

const DWELL_MS = 7000;
const FADE_MS = 1500;

const pad = (n: number) => String(n).padStart(2, "0");

/** Subtle, on-brand warm glows that crossfade with each slide (docs/08 §5#8). Kept low-alpha
 *  and screen-blended so the plum identity holds — a shift in light, not a repaint. */
const SKY_GLOWS = [
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(255,195,0,.11),transparent 62%)",
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(229,0,109,.12),transparent 62%)",
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(255,120,60,.10),transparent 62%)",
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(150,70,150,.15),transparent 62%)",
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(255,160,40,.10),transparent 62%)",
  "radial-gradient(ellipse 72% 56% at 62% 40%,rgba(230,70,130,.11),transparent 62%)",
];

/** One crossfading image pair (background-size:cover divs, like the prototype). */
function FadeLayers({
  slides,
  index,
  prev,
  className,
  offset = false,
  drift = false,
}: {
  slides: ThresholdSlide[];
  index: number;
  prev: number | null;
  className?: string;
  /** Arch-frame variant: image spans the FULL arch-container height (the frame starts at
   *  26% from the top, so the layer is offset -35.14%/135.14% to stay pixel-aligned with
   *  the ghost tower above it — the prototype's exact numbers). */
  offset?: boolean;
  /** Apply the slow living-hero drift (killed under reduced motion via the global rule). */
  drift?: boolean;
}) {
  const pos = offset
    ? { top: "-35.14%", height: "135.14%", left: 0, right: 0 }
    : { inset: 0 };
  return (
    <>
      {slides.map((s, i) => {
        const isCurrent = i === index;
        const isPrev = i === prev;
        if (!isCurrent && !isPrev) return null;
        return (
          <div
            key={s.id}
            aria-hidden
            className={`${className ?? ""}${drift ? " animate-hero-drift" : ""}`}
            style={{
              position: "absolute",
              ...pos,
              backgroundImage: s.image ? `url("${s.image}")` : undefined,
              backgroundColor: s.image ? undefined : "#3D0A40",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: isCurrent ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease`,
              zIndex: isCurrent ? 2 : 1,
            }}
          />
        );
      })}
    </>
  );
}

export function ThresholdHero({ slides, templeCount }: { slides: ThresholdSlide[]; templeCount: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [stopped, setStopped] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  // Parallax targets (imperative — the rAF loop writes their styles directly, no re-render).
  const archRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mtnRef = useRef<SVGSVGElement>(null);
  const silRef = useRef<SVGSVGElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const fmistRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const vertRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLSpanElement>(null);
  const l2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) setSaveData(true);
  }, []);

  // `mounted` guard keeps SSR and the first client render identical (both render no pause
  // control): framer's useReducedMotion resolves synchronously on the client, so gating the
  // control on `reduce` alone mismatches the server HTML (hydration error). The control —
  // and autoplay itself — only ever work with JS, so appearing post-mount is correct.
  const autoplayEligible = mounted && !reduce && !saveData && count > 1;
  const playing = autoplayEligible && !stopped;

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => {
        const ni = (i + 1) % count;
        // Preload before swapping so the crossfade never reveals a half-loaded image.
        const next = slides[ni];
        if (next?.image) {
          const img = new Image();
          img.src = next.image;
        }
        setPrev(i);
        return ni;
      });
    }, DWELL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, count, slides]);

  // Scroll-parallax rig (docs/08 §5#6). Decoupled scroll-listener writes a target; a rAF
  // loop lerps a smoothed p toward it and drives every layer. Never runs under reduced
  // motion — every element then sits at its p=0 rest transform (the static Threshold).
  useEffect(() => {
    if (reduce) return;
    let p = 0;
    let target = 0;
    let raf = 0;
    const read = () => {
      target = Math.min(1.15, Math.max(0, window.scrollY / (window.innerHeight || 800)));
    };
    const setT = (el: HTMLElement | SVGElement | null, transform?: string, opacity?: number) => {
      if (!el) return;
      if (transform !== undefined) el.style.transform = transform;
      if (opacity !== undefined) el.style.opacity = String(opacity);
    };
    const clamp0 = (v: number) => (v < 0 ? 0 : v);
    const tick = () => {
      p += (target - p) * 0.14;
      if (Math.abs(target - p) < 0.0004) p = target;
      if (p < 0) p = 0;
      const ease = p * p * (3 - 2 * p);
      const vw = window.innerWidth || 1200;
      setT(archRef.current, `translate(-32%, calc(-52% + ${(p * 300).toFixed(1)}px)) scale(${(1 + p * 0.16).toFixed(4)})`);
      setT(ringRef.current, `scale(${(1 + p * 0.55).toFixed(4)})`, clamp0(1 - p * 1.6));
      setT(mtnRef.current, `translateY(${(p * 46).toFixed(1)}px)`);
      setT(silRef.current, `translateY(${(p * 92).toFixed(1)}px)`);
      setT(mistRef.current, `translateY(${(p * 130).toFixed(1)}px)`, clamp0(1 - p * 1.1));
      setT(fmistRef.current, `translateY(${(p * 180).toFixed(1)}px)`, clamp0(1 - p * 1.4));
      setT(raysRef.current, undefined, clamp0(1 - p * 1.8));
      setT(kickerRef.current, `translateY(${(-p * 130).toFixed(1)}px)`, clamp0(1 - p * 2.2));
      setT(vertRef.current, `translateY(calc(-50% + ${(p * 180).toFixed(1)}px))`, clamp0(0.9 - p * 2));
      setT(cueRef.current, undefined, clamp0(1 - p * 3));
      setT(capRef.current, undefined, clamp0(1 - p * 2.2));
      setT(
        l1Ref.current,
        `translate(${(-p * vw * 0.22).toFixed(1)}px,${(-p * 90).toFixed(1)}px) skewX(${(-p * 4).toFixed(2)}deg)`,
        clamp0(1 - ease * 1.5),
      );
      setT(
        l2Ref.current,
        `translate(${(p * vw * 0.3).toFixed(1)}px,${(-p * 40).toFixed(1)}px) skewX(${(p * 4).toFixed(2)}deg)`,
        clamp0(1 - ease * 1.3),
      );
      raf = requestAnimationFrame(tick);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [reduce]);

  if (count === 0) return null;
  const slide = slides[index];

  return (
    <section
      className="relative overflow-hidden bg-ink text-porcelain"
      style={{ height: "100svh", minHeight: 620 }}
      aria-label="Featured temples"
    >
      {/* Sky: plum gradient + warm radial glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 62% 42%,#43132F 0%,rgba(67,19,47,0) 60%),linear-gradient(180deg,#1C0C1A 0%,#241021 34%,#2B1127 72%,#241021 100%)",
        }}
      />
      {/* Per-slide sky shift (§5#8) — one warm glow per slide, only the current is visible;
          opacity crossfades on slide change. Static under reduced motion (index never moves). */}
      {SKY_GLOWS.map((g, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: g,
            mixBlendMode: "screen",
            opacity: i === index % SKY_GLOWS.length ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        />
      ))}
      {/* Light rays (static conic gradient, screen blend) */}
      <div
        ref={raysRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "conic-gradient(from 168deg at 62% 6%,transparent 0deg,rgba(255,195,0,.075) 7deg,transparent 14deg,transparent 21deg,rgba(255,195,0,.05) 27deg,transparent 34deg,transparent 44deg,rgba(229,0,109,.045) 50deg,transparent 57deg)",
          mixBlendMode: "screen",
        }}
      />
      {/* Mountain ranges */}
      <svg
        ref={mtnRef}
        aria-hidden
        viewBox="0 0 1440 240"
        preserveAspectRatio="xMidYMax slice"
        className="absolute left-0 right-0 w-full"
        style={{ bottom: "clamp(46px,8vh,100px)", height: "32%", willChange: "transform" }}
      >
        <path
          d="M0 240 L0 170 L160 96 L300 168 L430 120 L560 186 L720 108 L880 178 L1010 132 L1160 188 L1300 140 L1440 182 L1440 240 Z"
          fill="#2A0E2D"
          opacity=".55"
        />
        <path
          d="M0 240 L0 200 L120 156 L260 204 L420 158 L600 212 L760 168 L940 214 L1100 176 L1260 216 L1440 184 L1440 240 Z"
          fill="#1D0C1F"
          opacity=".85"
        />
      </svg>
      {/* Gopuram silhouettes on the horizon */}
      <svg
        ref={silRef}
        aria-hidden
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        className="absolute left-0 right-0 w-full"
        style={{ bottom: "clamp(46px,8vh,100px)", height: "24%", willChange: "transform" }}
      >
        <g fill="#150818">
          <path
            d="M80 200 L80 128 L96 128 L100 96 L116 96 L120 66 L134 66 L138 88 L127 88 L127 42 L131 30 L135 42 L135 88 L152 96 L156 96 L160 128 L176 128 L176 200 Z"
            opacity=".9"
          />
          <path
            d="M1180 200 L1180 140 L1200 140 L1206 104 L1226 104 L1232 72 L1246 72 L1240 50 L1243 36 L1246 50 L1252 72 L1266 72 L1272 104 L1292 104 L1298 140 L1318 140 L1318 200 Z"
            opacity=".85"
          />
          <path
            d="M340 200 L340 152 L352 152 L356 122 L370 122 L374 98 L381 84 L388 98 L392 122 L406 122 L410 152 L422 152 L422 200 Z"
            opacity=".7"
          />
          <path
            d="M1000 200 L1000 160 L1012 160 L1016 134 L1028 134 L1032 112 L1038 100 L1044 112 L1048 134 L1060 134 L1064 160 L1076 160 L1076 200 Z"
            opacity=".6"
          />
        </g>
      </svg>
      {/* Horizon mist */}
      <div
        ref={mistRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-10%",
          right: "-10%",
          bottom: "clamp(30px,6vh,90px)",
          height: "26%",
          background:
            "radial-gradient(ellipse 55% 90% at 30% 100%,rgba(61,10,64,.55),transparent 70%),radial-gradient(ellipse 60% 80% at 75% 100%,rgba(43,17,39,.65),transparent 70%)",
          filter: "blur(26px)",
        }}
      />
      {/* Drifting birds (§5#7) — a faint flock of gulls crossing the sky behind the arch.
          Each is a wrapper that drifts on an undulating path (bird-drift, fading in/out at
          the edges) around an inner gull that flaps its wings (bird-flap). Both layers carry
          `animate-bird` so the reduced-motion rule (globals.css) kills them with !important. */}
      {[
        { top: "17%", left: "8%", w: 25, o: 0.5, drift: 44, flap: 0.62, delay: 0 },
        { top: "24%", left: "2%", w: 17, o: 0.4, drift: 57, flap: 0.74, delay: 5 },
        { top: "13%", left: "16%", w: 13, o: 0.32, drift: 50, flap: 0.56, delay: 12 },
      ].map((b, i) => (
        <div
          key={i}
          aria-hidden
          className="animate-bird pointer-events-none absolute z-[1]"
          style={{ top: b.top, left: b.left, animation: `bird-drift ${b.drift}s linear ${b.delay}s infinite` }}
        >
          <svg
            viewBox="0 0 40 16"
            className="animate-bird block"
            style={{
              width: b.w,
              opacity: b.o,
              fill: "none",
              stroke: "rgba(251,246,240,.62)",
              strokeWidth: 1.6,
              strokeLinecap: "round",
              transformOrigin: "center",
              animation: `bird-flap ${b.flap}s ease-in-out infinite`,
            }}
          >
            <path d="M2 12 Q10 4 19 11 Q28 4 38 12" />
          </svg>
        </div>
      ))}

      {/* Kicker */}
      <div
        ref={kickerRef}
        className="absolute z-[6]"
        style={{ top: "clamp(84px,12vh,130px)", left: "clamp(20px,7vw,120px)" }}
      >
        <p className="font-mono text-[11px] tracking-[.3em] text-porcelain/55">
          A FIELD GUIDE TO SACRED INDIA
        </p>
        {/* The bilingual accent — part of the locked identity (Noto Sans Telugu, hero only).
            It lived solely in the retired split hero, so replacing that composition silently
            dropped it from the live site while the font kept shipping on every route. */}
        <p
          lang="te"
          className="telugu mt-2.5 text-turmeric/85"
          style={{ fontSize: "clamp(17px,2vw,24px)", fontWeight: 600, letterSpacing: "0" }}
        >
          పవిత్ర దేవాలయాలు
        </p>
      </div>
      {/* Vertical side line (data-derived count — never hardcoded) */}
      <p
        ref={vertRef}
        className="absolute z-[6] hidden font-mono text-[10px] tracking-[.32em] text-porcelain/40 md:block"
        style={{
          right: "clamp(16px,4vw,60px)",
          top: "50%",
          transform: "translateY(-50%)",
          writingMode: "vertical-rl",
        }}
      >
        {templeCount} TEMPLES · FOURTEEN CENTURIES · ONE SUBCONTINENT
      </p>

      {/* The arch portal (center) */}
      <div
        ref={archRef}
        role="img"
        aria-label={`${slide.name}, ${slide.city}`}
        className="absolute z-[2]"
        style={{
          left: "50%",
          top: "47%",
          transform: "translate(-32%,-52%)",
          width: "clamp(290px,36vw,560px)",
          height: "clamp(430px,76vh,800px)",
          willChange: "transform",
        }}
      >
        {/* Gold orbit ring */}
        <div
          ref={ringRef}
          aria-hidden
          className="absolute rounded-full border border-turmeric/40"
          style={{ top: "4%", left: "-16%", width: "116%", aspectRatio: "1/1", willChange: "transform, opacity" }}
        />
        {/* Crown glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: "14%",
            right: "14%",
            top: "-2%",
            height: "40%",
            background: "radial-gradient(ellipse at 50% 40%,rgba(255,195,0,.14),transparent 65%)",
            filter: "blur(18px)",
          }}
        />
        {/* Ghost tower — the same image continuing above the arch, faded by a mask */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: 0.55,
            maskImage:
              "radial-gradient(ellipse 60% 56% at 50% 34%,#000 32%,rgba(0,0,0,.65) 54%,transparent 74%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 56% at 50% 34%,#000 32%,rgba(0,0,0,.65) 54%,transparent 74%)",
          }}
        >
          <FadeLayers slides={slides} index={index} prev={prev} />
        </div>
        {/* The sharp arch frame */}
        <div
          aria-hidden
          className="absolute overflow-hidden"
          style={{
            left: 0,
            right: 0,
            top: "26%",
            bottom: 0,
            borderRadius: "999px 999px 26px 26px",
            background: "rgba(61,10,64,.4)",
            boxShadow: "0 40px 120px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,195,0,.55)",
          }}
        >
          <FadeLayers slides={slides} index={index} prev={prev} offset drift />
          <div
            className="absolute bottom-0 left-0 right-0 z-[3]"
            style={{ height: "26%", background: "linear-gradient(180deg,transparent,rgba(36,16,33,.7))" }}
          />
        </div>
      </div>

      {/* Headline — overlaps the arch, in front of the ghost tower. Each line splits apart
          + fades on scroll (§5#6); l1/l2 refs carry those transforms. */}
      <h1
        className="pointer-events-none absolute z-[4] font-display font-extrabold text-porcelain"
        style={{
          left: "clamp(18px,7vw,120px)",
          right: "clamp(64px,8vw,140px)",
          bottom: "clamp(120px,19vh,200px)",
          fontSize: "min(clamp(50px,9.5vw,148px),13vh)",
          lineHeight: 0.98,
          letterSpacing: "-.03em",
        }}
      >
        <span ref={l1Ref} className="block" style={{ textShadow: "0 4px 40px rgba(28,12,26,.7)", willChange: "transform, opacity" }}>
          Where the gods
        </span>
        <span
          ref={l2Ref}
          className="block text-turmeric"
          style={{ marginLeft: "clamp(34px,12vw,220px)", textShadow: "0 4px 44px rgba(36,16,33,.75)", willChange: "transform, opacity" }}
        >
          still live.
        </span>
      </h1>

      {/* Foreground mist */}
      <div
        ref={fmistRef}
        aria-hidden
        className="pointer-events-none absolute z-[5]"
        style={{
          left: "-8%",
          right: "-8%",
          bottom: "clamp(20px,4vh,60px)",
          height: "18%",
          background:
            "radial-gradient(ellipse 50% 100% at 42% 100%,rgba(251,246,240,.075),transparent 70%),radial-gradient(ellipse 45% 90% at 70% 100%,rgba(61,10,64,.5),transparent 72%)",
          filter: "blur(20px)",
        }}
      />

      {/* Caption + counter + pause control */}
      <div
        ref={capRef}
        className="absolute z-[6] flex flex-col items-end gap-1 text-right"
        style={{ right: "clamp(20px,7vw,120px)", bottom: "clamp(104px,17vh,190px)" }}
      >
        <span className="max-w-[38vw] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] tracking-[.12em] text-turmeric">
          {`${slide.name} — ${slide.city}`.toUpperCase()}
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[.14em] text-porcelain/60">
          {pad(index + 1)} / {pad(count)}
          {autoplayEligible ? (
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-porcelain/25 text-porcelain/70 transition-colors hover:border-turmeric hover:text-turmeric"
            >
              {stopped ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />}
            </button>
          ) : null}
        </span>
      </div>

      {/* Scroll cue */}
      <div
        ref={cueRef}
        aria-hidden
        className="absolute z-[6] flex items-center gap-[11px]"
        style={{ right: "clamp(20px,7vw,120px)", bottom: "clamp(66px,11vh,124px)" }}
      >
        <span className="font-mono text-[9px] tracking-[.34em] text-porcelain/50">SCROLL</span>
        <span className="relative block w-px overflow-hidden" style={{ height: "clamp(30px,6vh,52px)" }}>
          <span className="animate-cue absolute left-0 top-0 h-full w-px bg-porcelain" />
        </span>
      </div>

      {/* The cream dome — scrolling passes through the arch into the index */}
      <div
        aria-hidden
        className="absolute z-[7] bg-porcelain"
        style={{
          left: "-10%",
          right: "-10%",
          bottom: -2,
          height: "clamp(48px,8vh,104px)",
          borderRadius: "100% 100% 0 0",
        }}
      />

      {/* SR slide announcement (only meaningful state change) */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Slide ${index + 1} of ${count}: ${slide.name}, ${slide.city}`}
      </div>
    </section>
  );
}
