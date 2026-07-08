"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Hero carousel controls: prev/next arrows, dot indicators, and a "n / N" counter.
 * No autoplay anywhere (a locked decision). Keyboard (←/→/Home/End) is handled by the
 * parent Hero when the carousel region has focus; these are also real buttons.
 */
export function HeroControls({
  index,
  count,
  onPrev,
  onNext,
  onSelect,
}: {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
}) {
  const arrow =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-canvas text-plum transition-colors hover:border-magenta hover:text-magenta disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-plum";

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={index <= 0} className={arrow} aria-label="Previous temple">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" onClick={onNext} disabled={index >= count - 1} className={arrow} aria-label="Next temple">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <ul className="flex items-center gap-2" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onSelect(i)}
              className={
                i === index
                  ? "h-2.5 w-6 rounded-full bg-magenta transition-all"
                  : "h-2.5 w-2.5 rounded-full bg-line-strong transition-all hover:bg-magenta/50"
              }
            />
          </li>
        ))}
      </ul>

      <span className="font-mono text-xs uppercase tracking-label text-ink-muted">
        {index + 1} / {count}
      </span>
    </div>
  );
}
