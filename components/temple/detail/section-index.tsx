"use client";

import { useEffect, useRef, useState } from "react";
import { padCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VisibleSection } from "@/lib/detail-sections";

const CARET_HEIGHT = 16;

/**
 * Desktop section index (docs/06 §4, D20) — a sticky right-rail `<nav>` (top: header+16px)
 * with scroll-spy (IntersectionObserver, not scroll-position math) driving `aria-current`
 * and a magenta caret that translates to the active item over 200ms (docs/08 §5#3).
 */
export function SectionIndex({ sections }: { sections: VisibleSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const [caretTop, setCaretTop] = useState(0);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      // Treats a section as "current" once it's within the top 30% of the viewport (below
      // the sticky header) — matches the scroll-spy behavior a reader actually perceives.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!activeId) return;
    const item = itemRefs.current[activeId];
    if (item) setCaretTop(item.offsetTop + (item.offsetHeight - CARET_HEIGHT) / 2);
  }, [activeId]);

  if (sections.length === 0) return null;

  return (
    // No `self-start`/`align-self` override here on purpose: as a CSS Grid item, this
    // `<nav>` stretches (the grid default) to match the left column's full height, so its
    // OWN `sticky` positioning has room to stick through the entire content column instead
    // of unsticking immediately after its own short, natural content height.
    <nav aria-label="On this page" className="sticky top-20 hidden print:hidden lg:block">
      <div className="relative border-l border-line pl-4">
        <span
          aria-hidden
          className="absolute -left-px w-px bg-magenta transition-transform duration-200 ease-threshold"
          style={{ height: CARET_HEIGHT, transform: `translateY(${caretTop}px)` }}
        />
        <ul className="space-y-1.5">
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <li
                key={s.id}
                ref={(el) => {
                  itemRefs.current[s.id] = el;
                }}
              >
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "block py-1 font-mono text-xs leading-snug transition-colors",
                    isActive ? "text-magenta-deep" : "text-ink-muted hover:text-plum",
                  )}
                >
                  {padCount(s.index)} — {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
