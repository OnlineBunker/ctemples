"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared Radix Popover shell for the four Explore filter triggers (docs/03 §6.4,
 * docs/05 §3.2). Radix owns focus trap, Esc, outside-click, and collision-aware
 * positioning — the one sanctioned new dependency (D19).
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
    <Popover.Root>
      <Popover.Trigger asChild>
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
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label={panelLabel}
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="popover-content z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-card border border-line bg-canvas p-3 shadow-lg focus:outline-none"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
