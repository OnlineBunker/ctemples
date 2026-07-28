import { TransitionLink } from "@/components/motion/transition-link";

/**
 * Prev / next temple bar (docs/15 §0a — the prototype's closing element): an ink band
 * split in two, wrapping around the temple list. Mono direction labels over Bricolage
 * names; hovering a side deepens it to plum.
 */
export function TempleFooterNav({
  prev,
  next,
}: {
  prev: { id: string; name: string };
  next: { id: string; name: string };
}) {
  const side =
    "flex flex-col gap-1.5 py-[clamp(24px,4vh,40px)] text-porcelain transition-colors duration-300 hover:bg-surface-sanctum";
  return (
    <nav aria-label="More temples" className="grid grid-cols-1 bg-surface-deep sm:grid-cols-2 print:hidden">
      <TransitionLink
        href={`/temples/${prev.id}`}
        type="nav-back"
        className={`${side} border-b border-porcelain/10 pl-[clamp(20px,6vw,110px)] pr-6 sm:border-b-0 sm:border-r`}
      >
        <span className="font-mono text-[9.5px] tracking-[.24em] text-porcelain/50">← PREVIOUS</span>
        <span className="font-display font-semibold tracking-[-.01em]" style={{ fontSize: "clamp(15px,1.8vw,21px)" }}>
          {prev.name}
        </span>
      </TransitionLink>
      <TransitionLink
        href={`/temples/${next.id}`}
        className={`${side} items-start pl-6 pr-[clamp(20px,6vw,110px)] text-left sm:items-end sm:text-right`}
      >
        <span className="font-mono text-[9.5px] tracking-[.24em] text-porcelain/50">NEXT →</span>
        <span className="font-display font-semibold tracking-[-.01em]" style={{ fontSize: "clamp(15px,1.8vw,21px)" }}>
          {next.name}
        </span>
      </TransitionLink>
    </nav>
  );
}
