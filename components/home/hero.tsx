"use client";

import {
  useState,
  useCallback,
  useEffect,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { KolamMotif } from "@/components/brand/kolam-motif";
import { HeroSlide, type HeroSlideData } from "./hero-slide";
import { HeroControls } from "./hero-controls";
import { REGION_META } from "@/lib/regions";

/** Autoplay dwell per slide (docs/08 §2 `--hero-dwell`). Keep in sync with the
 *  `animate-kenburns` / `animate-dot-progress` durations in globals.css. */
const DWELL_MS = 7000;

/**
 * Homepage hero — an autoplaying photo carousel under docs/08 §6's autoplay law
 * (Amendment A): 7s dwell with wrap-around, a visible pause/play toggle, pauses while
 * hovered or focused, stops for the visit on any manual navigation, and never starts
 * under prefers-reduced-motion or Save-Data. The editorial block (H1 thesis + bilingual
 * flourish + CTAs) is persistent; the photo stage cross-fades between featured temples
 * with a Ken Burns drift on the visible slide. Keyboard: ←/→ move, Home/End jump, when
 * the stage is focused.
 *
 * The single <h1> is the page thesis ("Discover the sacred"); per-slide temple names are
 * <h2> inside the slide overlay — one H1 per page (docs/03 §3).
 */
export function Hero({ slides }: { slides: HeroSlideData[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [interacted, setInteracted] = useState(false);
  // Autoplay state: `stopped` = manual nav or the toggle; `restingPause` = hover/focus.
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const count = slides.length;

  useEffect(() => {
    // Save-Data users never get an autoplay timer (docs/08 §6 clause 5).
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) setSaveData(true);
  }, []);

  const autoplayEligible = !reduce && !saveData && count > 1;
  const playing = autoplayEligible && !stopped && !hovered && !focusWithin;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, DWELL_MS);
    return () => clearInterval(timer);
  }, [playing, count]);

  // Manual navigation: wraps, announces to SR, and stops autoplay for the visit
  // (docs/08 §6 clause 4 — only the toggle restarts it).
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setInteracted(true);
      setStopped(true);
    },
    [count],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          go(index + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          go(index - 1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(count - 1);
          break;
      }
    },
    [go, index, count],
  );

  const onBlurCapture = useCallback((e: ReactFocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
  }, []);

  if (count === 0) return null;
  const slide = slides[index];
  const eyebrow = `${slide.state} · ${REGION_META[slide.region].label} India`;

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured temples"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={onBlurCapture}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] text-magenta/10"
      >
        <KolamMotif className="h-full w-full" />
      </div>

      <div className="shell grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:gap-12 lg:py-20">
        {/* Editorial (persistent) */}
        <div className="order-2 lg:order-1">
          <p className="eyebrow" aria-live="off">
            {eyebrow}
          </p>
          <h1 className="mt-5 font-display text-display-lg font-semibold text-plum">
            Discover the sacred
          </h1>
          <p lang="te" className="telugu mt-2 text-2xl font-semibold text-magenta sm:text-3xl">
            పవిత్ర దేవాలయాలు
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            From the Jyotirlingas of the Himalayas to the shore temples of the south, explore
            India&apos;s living heritage — its legends, festivals, architecture, and darshan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/explore" variant="primary" size="lg">
              Plan your darshan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/explore?view=map" variant="secondary" size="lg">
              Explore by region
            </ButtonLink>
          </div>

          <div className="mt-10">
            <HeroControls
              index={index}
              count={count}
              playing={playing}
              intentPlaying={autoplayEligible && !stopped}
              showToggle={autoplayEligible}
              onPrev={() => go(index - 1)}
              onNext={() => go(index + 1)}
              onSelect={go}
              onToggle={() => setStopped((s) => !s)}
            />
          </div>
        </div>

        {/* Photo stage (carousel) */}
        <div className="order-1 lg:order-2">
          <div
            tabIndex={0}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${count}: ${slide.name}`}
            onKeyDown={onKeyDown}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-card outline-none ring-magenta/0 focus-visible:ring-2 focus-visible:ring-magenta lg:aspect-[16/12]"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <HeroSlide slide={slide} priority={index === 0} kenBurns={!reduce} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide announcement for assistive tech (only after the user interacts —
          autoplay advances stay silent, docs/08 §6 clause 5). */}
      <div className="sr-only" role="status" aria-live="polite">
        {interacted ? `Slide ${index + 1} of ${count}: ${slide.name}, ${slide.state}` : ""}
      </div>
    </section>
  );
}
