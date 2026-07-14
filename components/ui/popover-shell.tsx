"use client";

import * as Popover from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The shared Radix Popover wiring (docs/03 §6.4, D19) — Root/Trigger/Portal/Content with
 * the canonical panel styling (canvas, rounded-card, shadow-lg, border-line,
 * collision-aware). Radix owns focus-in-on-open, Tab-trap, Esc-close-and-restore, and
 * outside-pointer-dismiss, so no consumer hand-rolls any of that (docs/03 §6.4's behavior
 * contract). The trigger is fully caller-owned — passed as a real element via `asChild`,
 * not built from style props — so this one primitive serves visually distinct triggers
 * (Explore's filter pills, the header's nav dropdowns, a state tile's icon button)
 * without forcing one trigger style on all of them.
 */
export function PopoverShell({
  trigger,
  panelLabel,
  align = "start",
  className,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  panelLabel: string;
  align?: "start" | "center" | "end";
  className?: string;
  children: ReactNode;
  /** Omit for an uncontrolled popover (Explore filters, header dropdowns) — Radix owns
   *  its own open state. Pass both to let a parent enforce e.g. one-open-at-a-time across
   *  a group of siblings (the home state tiles). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label={panelLabel}
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "popover-content z-40 max-w-[calc(100vw-2.5rem)] rounded-card border border-line bg-canvas p-3 shadow-lg focus:outline-none",
            className,
          )}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
