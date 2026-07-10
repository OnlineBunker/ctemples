"use client";

import { useEffect, useRef, useState } from "react";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { REGION_META } from "@/lib/regions";
import type { Region } from "@/lib/types";
import { StatePopover, type StatePopoverItem } from "./state-popover";

export interface StateStripItem {
  state: string;
  slug: string;
  region: Region;
  count: number;
  top: StatePopoverItem[];
}

/**
 * A state tile: a button that opens a popover of the state's top temples. Owns the
 * popover's focus management — focuses the first item on open, traps Tab, closes on Esc
 * (restoring focus to the button) and on outside pointer. Single-open is enforced by the
 * parent (StateStrip). State silhouettes (Phase 4 GeoJSON) aren't ready, so a small
 * region-tinted gopuram mark stands in — the Phase 2 fallback.
 *
 * Popover alignment is measured at click time (not derived from the tile's index): the
 * grid's column count changes per breakpoint (2/3/4/6-up), so index parity doesn't
 * reliably predict which half of the viewport a tile sits in. Measuring the tile's
 * actual position is breakpoint-agnostic and keeps the popover on-screen.
 */
export function StateTile({
  item,
  isOpen,
  onOpen,
  onClose,
}: {
  item: StateStripItem;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [align, setAlign] = useState<"left" | "right">("left");
  const popId = `state-pop-${item.slug}`;
  const labelId = `state-pop-label-${item.slug}`;
  const pigment = REGION_META[item.region].pigment;

  function handleToggle() {
    if (isOpen) {
      onClose();
      return;
    }
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      const tileCenter = rect.left + rect.width / 2;
      setAlign(tileCenter < window.innerWidth / 2 ? "left" : "right");
    }
    onOpen();
  }

  useEffect(() => {
    if (!isOpen) return;
    const wrapper = wrapperRef.current;
    wrapper?.querySelector<HTMLElement>('[role="dialog"] a')?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        buttonRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const dialog = wrapper?.querySelector<HTMLElement>('[role="dialog"]');
        if (!dialog) return;
        const f = Array.from(
          dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function onPointer(e: PointerEvent) {
      if (!wrapper?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popId}
        onClick={handleToggle}
        className="flex h-full w-full flex-col items-start gap-3 rounded-card border border-line bg-canvas p-4 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-magenta/40 hover:shadow-md aria-expanded:border-magenta"
      >
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full"
          style={{ color: pigment, backgroundColor: `${pigment}14` }}
        >
          <GopuramMark className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-display text-base font-semibold leading-tight text-plum">
            {item.state}
          </span>
          <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            {item.count === 1 ? "1 temple" : `${item.count} temples`}
          </span>
        </span>
      </button>

      {isOpen ? (
        <StatePopover
          id={popId}
          labelId={labelId}
          stateName={item.state}
          count={item.count}
          seeAllHref={`/explore?state=${item.slug}`}
          items={item.top}
          align={align}
        />
      ) : null}
    </div>
  );
}
