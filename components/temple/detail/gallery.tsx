"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { TempleImage } from "@/components/media/temple-image";
import { getGallery } from "@/lib/media";
import type { MediaItem, Region } from "@/lib/types";

/**
 * Section 13 — Gallery (docs/06 §6, docs/03 §6.7). Grid of `getGallery(media)` (every
 * item after the hero); the lightbox is z-80, `plum/92` backdrop, focus-trapped,
 * arrow/Esc/Tab-cycle, backdrop-click closes, counter. Video items get poster + tap-to-play,
 * muted by default (docs/08 §6) — none ship in the current dataset, but the schema
 * (`MediaItem.kind`) already models it, so this renders correctly the day one lands.
 *
 * The lightbox is portaled to `document.body` rather than rendered inline: this section
 * sits inside `Reveal`-animated ancestors (docs/08 §4), and Framer Motion's `y`/opacity
 * reveal leaves a non-`none` `transform` on those ancestors even at rest — which, per the
 * CSS spec, makes them a containing block for descendants. A `position: fixed` lightbox
 * nested inside one doesn't cover the viewport at all; it renders offset by the ancestor's
 * position on the page instead. Portaling escapes that ancestor chain entirely.
 *
 * The backdrop stays permanently mounted (never conditionally removed) and is driven
 * purely by `animate`/`pointer-events`/`aria-hidden` for open vs. closed, rather than
 * `AnimatePresence` mount/unmount tracking — in this exact setup (portaled, closed via a
 * `document`-level keydown listener) the exit animation completes visually but Framer
 * Motion never fires the follow-up unmount, leaving an invisible `position: fixed;
 * inset: 0` node with `pointer-events: auto` sitting over the entire page, silently
 * blocking every click after the first close. Never removing the node sidesteps that
 * failure mode entirely instead of depending on an exit-completion callback that doesn't
 * fire reliably here.
 */
export function Gallery({
  media,
  templeName,
  region,
  seed,
}: {
  media: MediaItem[];
  templeName: string;
  region: Region;
  seed: string;
}) {
  const items = getGallery(media);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const count = items.length;
  const isOpen = open !== null;

  // The portal target (document.body) only exists client-side — SSR would throw
  // "document is not defined" if createPortal's second argument were evaluated during
  // the server render. Gating on a post-mount flag keeps the portal call out of the
  // server-rendered tree entirely, not just visually hidden.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The item to actually display — kept alive through the close animation (retains the
  // last-open item instead of going blank) since the backdrop no longer unmounts on close.
  const [displayItem, setDisplayItem] = useState<MediaItem | null>(null);
  const active = open !== null ? items[open] : null;
  useEffect(() => {
    if (active) setDisplayItem(active);
  }, [active]);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) => {
      setPlaying(false);
      setOpen((i) => (i === null ? i : (i + dir + count) % count));
    },
    [count],
  );

  useEffect(() => {
    if (isOpen) {
      lastFocused.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      lastFocused.current?.focus?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        // The dialog container itself holds focus on open (tabIndex -1, for the aria-label
        // announcement). Treat it as the leading boundary too, so the very first Shift+Tab
        // wraps to `last` instead of escaping backward out of the portal onto the page behind.
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
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
  }, [isOpen, close, go]);

  if (count === 0) return null;

  return (
    <>
      {/* "Through the doorway" (docs/15 §0a): an ink band with a horizontal snap rail of
          3:4 plates, alternating arch / rounded radii — the prototype's gallery band,
          rendered as a full-width panel inside the section column. */}
      <div className="rounded-[26px] bg-surface-deep py-6">
        <p className="px-6 pb-4 text-right font-mono text-[10px] tracking-[.2em] text-porcelain/45">
          {String(count).padStart(2, "0")} PHOTOGRAPHS
        </p>
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
          {items.map((item, i) => (
            <li key={item.url} className="w-[min(320px,72vw)] shrink-0 snap-start">
              <button
                type="button"
                onClick={() => {
                  setOpen(i);
                  setPlaying(false);
                }}
                className="group relative block w-full overflow-hidden transition-transform duration-500 ease-threshold hover:-translate-y-1.5 motion-reduce:!transform-none"
                style={{
                  aspectRatio: "3/4",
                  borderRadius: i % 2 === 0 ? "160px 160px 18px 18px" : "18px",
                }}
                aria-label={`Open ${item.kind === "video" ? "video" : "image"} ${i + 1} of ${count} — ${templeName}`}
              >
                <div className="absolute inset-0">
                  <TempleImage
                    src={item.kind === "video" ? (item.poster ?? "") : item.url}
                    alt={item.alt}
                    region={region}
                    seed={seed}
                    variant={i + 1}
                    sizes="(max-width: 640px) 72vw, 320px"
                  />
                </div>
                {item.kind === "video" ? (
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-plum/20">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-plum">
                      <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" />
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-plum/92 p-4 backdrop-blur-sm transition-opacity sm:p-8"
            style={{
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transitionDuration: reduce ? "0ms" : "200ms",
            }}
            onClick={close}
            role="dialog"
            aria-modal={isOpen}
            aria-hidden={!isOpen}
            aria-label={displayItem ? `${templeName} gallery, item ${(open ?? 0) + 1} of ${count}` : undefined}
            ref={dialogRef}
            tabIndex={-1}
          >
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous item"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>

            {displayItem ? (
              <motion.div
                key={open ?? "last"}
                className="relative aspect-[3/2] w-full max-w-4xl overflow-hidden rounded-card border border-white/20"
                onClick={(e) => e.stopPropagation()}
                initial={reduce ? false : { scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {displayItem.kind === "video" ? (
                  playing ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- no captioned
                    // source exists yet; muted-by-default per docs/08 §6.
                    <video
                      src={displayItem.url}
                      poster={displayItem.poster}
                      controls
                      autoPlay
                      muted
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <button
                      type="button"
                      tabIndex={isOpen ? 0 : -1}
                      onClick={() => setPlaying(true)}
                      className="group relative block h-full w-full"
                      aria-label={`Play video — ${displayItem.alt}`}
                    >
                      <TempleImage
                        src={displayItem.poster ?? ""}
                        alt={displayItem.alt}
                        region={region}
                        seed={seed}
                        variant={(open ?? 0) + 1}
                        sizes="90vw"
                      />
                      <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-plum/25">
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-plum transition-transform group-hover:scale-105">
                          <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                        </span>
                      </span>
                    </button>
                  )
                ) : (
                  <TempleImage
                    src={displayItem.url}
                    alt={displayItem.alt}
                    region={region}
                    seed={seed}
                    variant={(open ?? 0) + 1}
                    sizes="90vw"
                  />
                )}
              </motion.div>
            ) : null}

            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next item"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>

            {/* Interim attribution stopgap (docs/09 §8) — ships ahead of the per-image
                MediaAttribution field (Stage B) since uncredited CC-BY-SA images are a
                live violation today. */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.66rem] uppercase tracking-label text-white/70">
              {(open ?? 0) + 1} / {count} · Images: Wikimedia Commons
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}
