import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
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
  return (
    <section id={id} className={cn("scroll-mt-36", className)}>
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-muted">{String(index).padStart(2, "0")}</span>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 font-display text-display-md text-plum">{title}</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-7">{children}</div>
      </Reveal>
    </section>
  );
}
