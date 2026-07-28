import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * A titled, anchor-linkable content section (docs/06 §5–7). `scroll-mt` offsets the jump
 * target below the sticky header + quick-facts bar. `index` is the visible-sequence number
 * from `lib/detail-sections.ts::visibleSections` — never a static string, so it always
 * matches what the section index nav shows for the same id.
 */
export function DetailSection({
  id,
  index,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  // Prototype kicker style (docs/15 §0a): "NN — EYEBROW" in bold, letter-spaced mono
  // magenta, then a big Bricolage title.
  return (
    <section id={id} className={cn("scroll-mt-36", className)}>
      <Reveal>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.26em] text-magenta">
          {String(index).padStart(2, "0")} — {eyebrow}
        </p>
        <h2
          className="mt-3 text-balance font-display font-bold tracking-[-.02em] text-ink"
          style={{ fontSize: "clamp(25px,3.2vw,42px)", lineHeight: 1.08 }}
        >
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-6">{children}</div>
      </Reveal>
    </section>
  );
}
