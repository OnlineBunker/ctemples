"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { PopoverShell } from "@/components/ui/popover-shell";
import { cn } from "@/lib/utils";

/**
 * The Explore filter-pill trigger (docs/05 §3.2), wrapping the shared PopoverShell
 * (docs/03 §6.4) — the one sanctioned new dependency (D19). All four filter triggers
 * (State/Deity/Tag/Sort) share this exact pill styling; only the panel content differs.
 */
export function FilterPopover({
  label,
  active,
  panelLabel,
  children,
}: {
  label: ReactNode;
  active: boolean;
  panelLabel: string;
  children: ReactNode;
}) {
  return (
    <PopoverShell
      className="w-72"
      panelLabel={panelLabel}
      trigger={
        <button
          type="button"
          className={cn(
            // Prototype atlas chip (docs/15 §0a): mono, letter-spaced, pill; active = ink fill.
            "inline-flex h-11 items-center gap-2 rounded-full border px-[15px] font-mono text-[10.5px] uppercase tracking-[.14em] transition-colors",
            active
              ? "border-ink bg-ink text-porcelain"
              : "border-ink/[.18] bg-white/70 text-ink hover:border-ink",
          )}
        >
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </button>
      }
    >
      {children}
    </PopoverShell>
  );
}
