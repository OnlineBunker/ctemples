"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The hero's action row (docs/06 §2): Save (heart, UI-only local toggle — no backend in
 * this prototype), Share (copies the page URL, announces via a `role="status"` toast, not
 * a native share sheet — keeps behavior identical and testable across browsers), and the
 * caller-supplied primary "Get directions →" button (file 07 §7's Google Maps URL).
 */
export function ActionRow({ getDirectionsHref, className }: { getDirectionsHref: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable (permissions, insecure context) — silently a no-op;
      // there's nothing else to fall back to without a real share target in this prototype.
    }
  }

  return (
    <div className={cn("relative flex items-center gap-2.5", className)}>
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save this temple"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-plum/30 text-white backdrop-blur-sm transition-colors hover:bg-plum/50"
      >
        <Heart className={cn("h-4.5 w-4.5", saved && "fill-magenta text-magenta")} aria-hidden />
      </button>

      <button
        type="button"
        onClick={share}
        aria-label="Copy link to this temple"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-plum/30 text-white backdrop-blur-sm transition-colors hover:bg-plum/50"
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </button>

      <a
        href={getDirectionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-magenta to-coral-deep px-5 font-body text-sm font-semibold text-white shadow-md transition-[filter,box-shadow] hover:shadow-[0_8px_28px_-4px_rgba(255,122,0,0.45)] hover:brightness-95"
      >
        Get directions →
      </a>

      <span role="status" className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
      {copied ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-11 right-0 rounded-full bg-plum px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-label text-white shadow-md"
        >
          Link copied
        </span>
      ) : null}
    </div>
  );
}
