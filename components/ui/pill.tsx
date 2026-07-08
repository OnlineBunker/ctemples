import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { REGION_META } from "@/lib/regions";
import type { Region } from "@/lib/types";

/** A soft brand pill (deities, styles, features). Reference "Shakti Peetha" style. */
export function Tag({
  children,
  className,
  tone = "magenta",
}: {
  children: ReactNode;
  className?: string;
  tone?: "magenta" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-medium",
        tone === "magenta"
          ? "bg-magenta-soft text-magenta-deep"
          : "border border-line bg-canvas text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Region label with its pigment dot — colour reinforces the region (icon + label lead). */
export function RegionBadge({
  region,
  className,
  tone = "default",
}: {
  region: Region;
  className?: string;
  /** `overlay` keeps the label legible on a photo. */
  tone?: "default" | "overlay";
}) {
  const meta = REGION_META[region];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-label",
        tone === "overlay" ? "text-white/90" : "text-ink-muted",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: meta.pigment }}
      />
      {meta.label} India
    </span>
  );
}
