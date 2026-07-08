import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

/** A titled, anchor-linkable section with a scroll-reveal header. */
export function DetailSection({
  id,
  index,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-brass/55">{index}</span>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 font-display text-display-md text-limewash">{title}</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-7">{children}</div>
      </Reveal>
    </section>
  );
}
