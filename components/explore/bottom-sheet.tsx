"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export type SheetSnap = "peek" | "half" | "full";

const PEEK_PX = 56;
const HALF_VH = 50;
// Matches the sticky header's height so "full" never runs under it (docs/03 §6.8).
const HEADER_OFFSET_PX = 64;

/**
 * Map mode's mobile results sheet (docs/03 §6.8, docs/05 §6). Framer Motion drag
 * between three snaps — peek (handle + title only), half (50vh), full
 * (100dvh − header). Focus is trapped at half/full and the background is made inert
 * (aria-modal contract); Esc returns to peek. Reduced motion drops the drag gesture and
 * the positional slide in favor of an instant reposition + a content fade, with buttons
 * to switch snap.
 *
 * Position is a `useMotionValue` driven imperatively via `animate()`, not the declarative
 * `animate` prop — once `drag` is enabled on an axis, Framer Motion treats that axis's
 * value as manually owned from mount and silently stops reacting to `animate` prop
 * changes. The drag-enabled sheet also only mounts once a real viewport is measured (see
 * the outer `BottomSheet` gate) — Framer resolves `dragConstraints` once at mount and
 * won't re-derive them, so a guessed-then-corrected height would leave the sheet stuck.
 */
function Sheet({
  peekLabel,
  children,
  snap,
  setSnap,
  viewportHeight,
  onModalChange,
}: {
  peekLabel: string;
  children: ReactNode;
  snap: SheetSnap;
  setSnap: (s: SheetSnap) => void;
  viewportHeight: number;
  onModalChange?: (isModal: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const sheetHeight = viewportHeight - HEADER_OFFSET_PX;
  const yFor = (s: SheetSnap): number => {
    if (s === "full") return 0;
    if (s === "half") return sheetHeight - (HALF_VH / 100) * viewportHeight;
    return sheetHeight - PEEK_PX;
  };

  const y = useMotionValue(yFor(snap));
  const mountedSnap = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Re-targets the motion value whenever `snap` changes (manual nav, drag, Esc) — instant
  // on the first commit (the motion value already starts there). Under reduced motion the
  // reposition is instant (no positional slide); the content fade below stands in for the
  // transition (docs/03 §6.8). Otherwise it springs.
  useEffect(() => {
    if (!mountedSnap.current) {
      mountedSnap.current = true;
      return;
    }
    if (reduce) {
      y.set(yFor(snap));
      return;
    }
    const controls = animate(y, yFor(snap), { type: "spring", damping: 30, stiffness: 300 });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, reduce]);

  const isModal = snap !== "peek";

  // Tell the parent when the sheet becomes modal so it can make the background inert — the
  // aria-modal contract (docs/03 §6.8): a hand-rolled Tab trap alone leaves the map/pills
  // reachable by pointer and by SR virtual-cursor. Reset to non-modal on unmount.
  useEffect(() => {
    onModalChange?.(isModal);
  }, [isModal, onModalChange]);
  useEffect(() => () => onModalChange?.(false), [onModalChange]);

  useEffect(() => {
    if (!isModal) return;
    lastFocused.current = document.activeElement as HTMLElement;
    const sheet = sheetRef.current;
    requestAnimationFrame(() => {
      sheet?.querySelector<HTMLElement>('[data-sheet-autofocus]')?.focus();
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setSnap("peek");
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    // This cleanup only ever runs when `isModal` flips from true (transitioning back to
    // "peek", or unmounting) — both are exactly the moments focus should return to
    // whatever opened the sheet.
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModal]);

  function onDragEnd() {
    // Read the motion value's LIVE position rather than reconstructing it as
    // yFor(snap) + offset — a drag that begins before an in-flight snap spring settles
    // starts partway between snaps, so the assumed origin would be wrong.
    const targets: { snap: SheetSnap; y: number }[] = [
      { snap: "full", y: yFor("full") },
      { snap: "half", y: yFor("half") },
      { snap: "peek", y: yFor("peek") },
    ];
    const currentY = y.get();
    const nearest = targets.reduce((a, b) =>
      Math.abs(b.y - currentY) < Math.abs(a.y - currentY) ? b : a,
    );
    setSnap(nearest.snap);
  }

  const cycleUp = () => setSnap(snap === "peek" ? "half" : "full");
  const cycleDown = () => setSnap(snap === "full" ? "half" : "peek");
  // Drag reaches every snap for pointer/touch users; the handle button is the only
  // affordance for keyboard users, so it must reach "full" too, not just peek<->half.
  const cycleHandle = () => setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek");

  return (
    <motion.div
      ref={sheetRef}
      role="dialog"
      aria-modal={isModal}
      aria-label="Temple results"
      drag={reduce ? false : "y"}
      dragConstraints={{ top: 0, bottom: yFor("peek") }}
      dragElastic={0.05}
      onDragEnd={onDragEnd}
      style={{ y, top: HEADER_OFFSET_PX, height: sheetHeight }}
      className="fixed inset-x-0 bottom-0 z-[60] flex flex-col rounded-t-card border-t border-line bg-canvas shadow-xl"
    >
      <button
        type="button"
        data-sheet-autofocus={isModal ? true : undefined}
        onClick={cycleHandle}
        className="flex shrink-0 flex-col items-center gap-2 py-2.5"
        aria-label={`${peekLabel} — ${snap === "full" ? "collapse" : "expand"} results`}
      >
        <span className="h-1 w-8 rounded-full bg-line-strong" aria-hidden />
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-label text-plum" aria-hidden>
          {peekLabel}
          {snap === "full" ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          )}
        </span>
      </button>

      {snap !== "peek" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6"
        >
          {children}
        </motion.div>
      ) : null}

      {reduce && snap !== "peek" ? (
        <div className="flex shrink-0 justify-center gap-2 border-t border-line py-2">
          <button type="button" onClick={cycleDown} className="text-xs text-ink-muted hover:text-magenta">
            Collapse
          </button>
          <button type="button" onClick={cycleUp} className="text-xs text-ink-muted hover:text-magenta">
            Expand
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}

export function BottomSheet({
  peekLabel,
  children,
  onModalChange,
}: {
  peekLabel: string;
  children: ReactNode;
  onModalChange?: (isModal: boolean) => void;
}) {
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Nothing to render until the real viewport is measured — see the note on `Sheet` above
  // for why a guessed-then-corrected height doesn't work with Framer's drag constraints.
  if (viewport === null) return null;

  return (
    <Sheet
      // Re-key only on WIDTH (orientation), not height. On mobile the URL bar hides/shows
      // during ordinary scrolling, changing window.innerHeight constantly — keying on
      // height would remount the sheet mid-scroll, resetting the results list's scroll
      // position and interrupting a drag. Height changes still flow through to yFor/animate
      // via the prop; only a genuine orientation change (width flip) needs the fresh mount
      // that re-derives Framer's drag constraints.
      key={viewport.w}
      peekLabel={peekLabel}
      snap={snap}
      setSnap={setSnap}
      viewportHeight={viewport.h}
      onModalChange={onModalChange}
    >
      {children}
    </Sheet>
  );
}
