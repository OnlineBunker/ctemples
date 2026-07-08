import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { REGION_META } from "@/lib/regions";
import type { Region } from "@/lib/types";

/** A neutral tag pill (deities, styles, features). */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-limewash/15 bg-limewash/[0.04] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-limewash/70",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Region label with its pigment dot — the color codes the region. */
export function RegionBadge({ region, className }: { region: Region; className?: string }) {
  const meta = REGION_META[region];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-label text-limewash/75",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full ring-2 ring-inset ring-black/20"
        style={{ backgroundColor: meta.pigment }}
      />
      {meta.label} India
    </span>
  );
}
