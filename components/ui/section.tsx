import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section-band surfaces (docs/15 §2B) — "the walk through a temple." Every value is a
 * LOCKED palette color; no new hues. A band picks its chamber via `surface`; dark
 * chambers (sanctum/deep) auto-recolor their headings to porcelain so callers don't
 * fight the global `h1–h4 { color: plum }` base rule.
 */
export const SURFACE = {
  canvas: "#FBF6F0", // porcelain — the nave
  recess: "#F4EADF", // porcelain-deep — a side chamber (reconciles proto #EFE6DA)
  sanctum: "#3D0A40", // plum — the inner sanctum
  deep: "#241021", // ink — the garbhagriha (rarest)
} as const;

export type SurfaceKey = keyof typeof SURFACE;

const SURFACE_CLASS: Record<SurfaceKey, string> = {
  canvas: "bg-surface-canvas text-ink",
  recess: "bg-surface-recess text-ink",
  sanctum:
    "bg-surface-sanctum text-porcelain [&_h1]:text-porcelain [&_h2]:text-porcelain [&_h3]:text-porcelain [&_h4]:text-porcelain",
  deep: "bg-surface-deep text-porcelain [&_h1]:text-porcelain [&_h2]:text-porcelain [&_h3]:text-porcelain [&_h4]:text-porcelain",
};

/** A page band: one chamber surface + the systemic section rhythm + the 1440px shell. */
export function Section({
  surface = "canvas",
  tight = false,
  bleed = false,
  id,
  ariaLabelledby,
  className,
  innerClassName,
  children,
}: {
  surface?: SurfaceKey;
  /** Denser vertical rhythm for compact bands. */
  tight?: boolean;
  /** Skip the shell wrapper when the child manages its own full-bleed layout. */
  bleed?: boolean;
  id?: string;
  ariaLabelledby?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(SURFACE_CLASS[surface], tight ? "section-y-tight" : "section-y", className)}
    >
      {bleed ? children : <div className={cn("shell", innerClassName)}>{children}</div>}
    </section>
  );
}
