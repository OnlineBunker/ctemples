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
            "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
            active
              ? "border-magenta bg-magenta-soft text-magenta-deep"
              : "border-line-strong bg-canvas text-plum hover:border-magenta hover:text-magenta",
          )}
        >
          {active ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta-deep" /> : null}
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      }
    >
      {children}
    </PopoverShell>
  );
}
