"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterChip({
  active,
  onClick,
  children,
  dotColor,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  dotColor?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-label transition-colors duration-200",
        active
          ? "border-brass bg-brass/15 text-limewash"
          : "border-limewash/15 text-limewash/60 hover:border-limewash/40 hover:text-limewash",
      )}
    >
      {dotColor ? (
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      ) : null}
      {children}
      {typeof count === "number" ? <span className="text-limewash/40">{count}</span> : null}
    </button>
  );
}
