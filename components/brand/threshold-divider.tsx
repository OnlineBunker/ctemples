import { SURFACE, type SurfaceKey } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * The threshold divider (docs/15 §2B) — a static arched crest of the *next* band's color
 * rising into the current one, so scrolling reads as passing "through the arch" into the
 * next chamber. Pure CSS, zero motion (nothing to reduce), decorative (`aria-hidden`).
 * Place it between two <Section> bands: `from` = the band above, `to` = the band below.
 */
export function ThresholdDivider({
  from = "canvas",
  to,
  className,
}: {
  from?: SurfaceKey;
  to: SurfaceKey;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative h-[clamp(32px,5vh,72px)] w-full overflow-hidden", className)}
      style={{ backgroundColor: SURFACE[from] }}
    >
      {/* The dome of the next chamber's color rises through the current band. */}
      <div
        className="absolute inset-0 rounded-t-[100%]"
        style={{ backgroundColor: SURFACE[to] }}
      />
    </div>
  );
}
