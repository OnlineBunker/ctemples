"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TempleImage } from "@/components/media/temple-image";
import type { Region } from "@/lib/types";

export function Gallery({
  images,
  templeName,
  region,
  seed,
}: {
  images: string[];
  templeName: string;
  region: Region;
  seed: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const count = images.length;

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) => setOpen((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  // Remember trigger, move focus into the dialog, restore on close.
  useEffect(() => {
    if (open !== null) {
      lastFocused.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      lastFocused.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // simple focus trap within the dialog's controls
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
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
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-brass/15"
              aria-label={`Open image ${i + 1} of ${count} — ${templeName}`}
            >
              <div className="absolute inset-0 transition-transform duration-700 ease-threshold group-hover:scale-105">
                <TempleImage
                  src={src}
                  alt={`${templeName} — view ${i + 1}`}
                  region={region}
                  seed={seed}
                  variant={i + 1}
                  sizes="(max-width: 640px) 45vw, 30vw"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-nightstone-900/92 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${templeName} gallery, image ${open + 1} of ${count}`}
            ref={dialogRef}
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-brass/25 text-limewash hover:bg-brass/10"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brass/25 text-limewash hover:bg-brass/10 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>

            <motion.div
              key={open}
              className="relative aspect-[3/2] w-full max-w-4xl overflow-hidden rounded-card border border-brass/20"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <TempleImage
                src={images[open]}
                alt={`${templeName} — view ${open + 1}`}
                region={region}
                seed={seed}
                variant={open + 1}
                sizes="90vw"
              />
            </motion.div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brass/25 text-limewash hover:bg-brass/10 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>

            {/* Interim attribution stopgap (docs/09 §8) — ships ahead of the per-image
                MediaAttribution field (Stage B) since uncredited CC-BY-SA images are a
                live violation today. */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.66rem] uppercase tracking-label text-limewash/60">
              {open + 1} / {count} · Images: Wikimedia Commons
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
