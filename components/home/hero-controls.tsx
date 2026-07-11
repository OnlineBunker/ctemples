"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/**
 * Hero carousel controls: prev/next arrows (wrap-around — autoplay wraps, so arrows
 * do too), dot indicators (the active dot doubles as the autoplay progress bar,
 * docs/08 §5#5), a pause/play toggle (the WCAG 2.2.2 mechanism, docs/08 §6 clause 2),
 * and a "n / N" counter. Keyboard (←/→/Home/End) is handled by the parent Hero when
 * the carousel region has focus; these are also real buttons.
 */
export function HeroControls({
  index,
  count,
  playing,
  intentPlaying,
  showToggle,
  onPrev,
  onNext,
  onSelect,
  onToggle,
}: {
  index: number;
  count: number;
  /** Autoplay is currently advancing (drives the active dot's progress fill). */
  playing: boolean;
  /** The user's play/pause intent — not suppressed by hover/focus pause. The toggle
   *  icon reflects THIS: clicking Play must flip the icon immediately even though the
   *  pointer/focus resting on the button keeps effective playback paused until it
   *  leaves (docs/08 §6 clause 3). */
  intentPlaying: boolean;
  /** Autoplay is eligible at all (hidden under reduced-motion/Save-Data). */
  showToggle: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
  onToggle: () => void;
}) {
  const roundButton =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-canvas text-plum transition-colors hover:border-magenta hover:text-magenta";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} className={roundButton} aria-label="Previous temple">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" onClick={onNext} className={roundButton} aria-label="Next temple">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
        {showToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={roundButton}
            aria-label={intentPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {intentPlaying ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <ul className="flex items-center gap-2" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            {i === index ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onSelect(i)}
                className="relative block h-2.5 w-6 overflow-hidden rounded-full bg-magenta/25 transition-all"
              >
                {/* Progress fill: animates over the dwell while autoplay runs; static
                    full bar when paused/stopped. Keyed so it restarts per slide/resume. */}
                <span
                  key={`${i}-${playing}`}
                  className={
                    playing
                      ? "animate-dot-progress absolute inset-y-0 left-0 rounded-full bg-magenta"
                      : "absolute inset-0 rounded-full bg-magenta"
                  }
                />
              </button>
            ) : (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onSelect(i)}
                className="block h-2.5 w-2.5 rounded-full bg-line-strong transition-all hover:bg-magenta/50"
              />
            )}
          </li>
        ))}
      </ul>

      <span className="font-mono text-xs uppercase tracking-label text-ink-muted">
        {index + 1} / {count}
      </span>
    </div>
  );
}
