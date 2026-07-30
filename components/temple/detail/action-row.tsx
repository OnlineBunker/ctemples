"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Check } from "lucide-react";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { cn } from "@/lib/utils";

/**
 * The hero's action row (docs/06 §2): Save, Share, and the primary "Get directions".
 *
 * Two corrections (owner report 2026-07-30):
 *  • **Share now confirms itself.** It used to copy silently apart from an `sr-only` message
 *    and a small toast tucked inside this row, which was easy to miss entirely. The
 *    confirmation is now a portalled, viewport-fixed pill — it cannot be clipped by an
 *    ancestor and appears in the same place every time.
 *  • **Save is real.** The heart was local `useState`, so it forgot the temple immediately
 *    and never reached the wishlist. It now uses the shared wishlist store, so saving here
 *    shows up on `/wishlist` and on the temple's own Explore card.
 *
 * Styling targets the light hero (the split layout sits on porcelain, not over a photo).
 */
const TOAST_MS = 2400;

export function ActionRow({
  templeId,
  templeName,
  getDirectionsHref,
  className,
}: {
  templeId: string;
  templeName: string;
  getDirectionsHref: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), TOAST_MS);
    } catch {
      // Clipboard unavailable (insecure context / denied) — nothing to fall back to without
      // a real share target, so stay silent rather than claim a copy that didn't happen.
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <a
        href={getDirectionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-magenta to-coral-deep px-5 font-body text-sm font-semibold text-white shadow-md transition-[filter,box-shadow] hover:shadow-[0_8px_28px_-4px_rgba(255,122,0,0.45)] hover:brightness-95"
      >
        Get directions →
      </a>

      <WishlistButton
        id={templeId}
        name={templeName}
        variant="icon"
        className="h-11 w-11 border-ink/20"
      />

      <button
        type="button"
        onClick={share}
        aria-label="Copy link to this temple"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink/60 transition-colors hover:border-magenta hover:text-magenta"
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </button>

      {/* Portalled so no ancestor's transform/overflow can clip or offset it. */}
      {mounted
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none fixed inset-x-0 bottom-8 z-[90] flex justify-center px-4 print:hidden"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full bg-plum px-5 py-3 font-mono text-[11px] uppercase tracking-[.16em] text-porcelain shadow-xl transition-all duration-300 ease-threshold",
                  copied ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <Check className="h-3.5 w-3.5 text-turmeric" aria-hidden />
                {copied ? "Link copied to clipboard" : ""}
              </span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
