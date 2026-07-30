"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { TempleCard, summaryToCard } from "@/components/ui/temple-card";
import { getWishlistTemples } from "@/lib/wishlist-actions";
import { useWishlist } from "@/lib/wishlist";
import type { TempleSummary } from "@/lib/temples";

/**
 * The saved-temples grid. Saved ids live in the visitor's `localStorage`, so this must be a
 * client component — but it fetches only those ids' card data through a server action
 * (`getWishlistTemples`) rather than shipping the dataset down to filter locally.
 *
 * Records are cached in a local map keyed by id, so un-saving a temple (its heart is right
 * there on the card) removes it from view with no server round-trip; only genuinely unknown
 * ids are ever fetched.
 */
export function WishlistGrid() {
  const { ids, key, ready, clear, count, toggle } = useWishlist();
  const [cache, setCache] = useState<Record<string, TempleSummary>>({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  // Carry focus across the confirm swap in both directions, so the keyboard path never lands on
  // <body>. `first` skips the initial mount, where nothing should steal focus.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (confirmClear) confirmRef.current?.focus();
    else clearRef.current?.focus();
  }, [confirmClear]);

  useEffect(() => {
    if (!ready) return;
    const missing = ids.filter((id) => !cache[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getWishlistTemples(missing)
      .then((items) => {
        if (cancelled) return;
        setCache((prev) => {
          const next = { ...prev };
          for (const item of items) next[item.id] = item;
          return next;
        });
        // Prune phantoms. A saved id whose record no longer exists (a retired slug) is
        // correctly omitted by the server, so it could never enter the cache, never render a
        // card, and never be un-saved — while still inflating the header badge and the
        // "NN SAVED" readout forever. Anything we asked for and didn't get back is gone.
        const returned = new Set(items.map((i) => i.id));
        for (const id of missing) {
          if (!returned.has(id)) toggle(id);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `key` is the stable stand-in for `ids`; `cache` is read but must not retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  const temples = ids.map((id) => cache[id]).filter((t): t is TempleSummary => Boolean(t));

  // Before hydration we can't know what's saved — stay quiet rather than flash an empty state.
  if (!ready) {
    return (
      <p role="status" className="mt-14 font-mono text-[10.5px] uppercase tracking-[.2em] text-ink-muted">
        Opening your doorways…
      </p>
    );
  }

  if (count === 0) {
    return (
      <div className="px-5 pb-16 pt-24 text-center">
        <GopuramMark className="mx-auto h-14 w-12 text-ink/25" strokeWidth={1.2} />
        <p className="mt-6 font-display text-[26px] font-semibold text-ink">No doorways saved yet.</p>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-ink/60">
          Tap the heart beneath any temple and it will wait for you here — your own shortlist for
          the next journey.
        </p>
        <Link
          href="/explore"
          className="mt-[26px] inline-flex items-center rounded-full bg-ink px-[22px] py-3 font-mono text-[11px] tracking-[.18em] text-porcelain transition-colors hover:bg-magenta"
        >
          BROWSE THE ATLAS
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* A saved id whose record has since gone (or a failed fetch) shouldn't read as an
          empty wishlist — say what happened instead. */}
      {failed ? (
        <p role="status" className="mt-8 font-mono text-[10.5px] uppercase tracking-[.18em] text-magenta-deep">
          Couldn&apos;t load your saved temples — please refresh.
        </p>
      ) : null}

      <div
        className="mt-[clamp(30px,5vh,50px)] grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,264px),1fr))",
          gap: "clamp(18px,2.6vw,30px) clamp(16px,2vw,24px)",
        }}
      >
        {temples.map((t, i) => (
          <TempleCard key={t.id} temple={summaryToCard(t)} priority={i === 0} />
        ))}
      </div>

      {loading ? (
        <p role="status" className="mt-8 font-mono text-[10.5px] uppercase tracking-[.2em] text-ink-muted">
          Opening your doorways…
        </p>
      ) : null}

      {/* The confirm step swaps the focused button out for two new ones. Without moving focus,
          the focused element simply disappears — a keyboard user is dumped back to <body> at the
          top of the document and a screen-reader user is told nothing (WCAG 3.2.2 / 4.1.3). The
          group is a live region so the question is announced, and focus is driven to the
          destructive action deliberately (see the effect above). All three controls are min-h-11:
          they were ~14px-tall text, well under WCAG 2.5.8's target size. */}
      <div
        className="mt-12 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6"
        role={confirmClear ? "group" : undefined}
        aria-label={confirmClear ? "Confirm clearing your wishlist" : undefined}
      >
        {confirmClear ? (
          <>
            <span role="status" className="font-mono text-[10.5px] uppercase tracking-[.16em] text-ink/60">
              Remove all {count}?
            </span>
            <button
              ref={confirmRef}
              type="button"
              onClick={() => {
                clear();
                setConfirmClear(false);
              }}
              className="inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[10.5px] uppercase tracking-[.16em] text-magenta-deep underline-offset-4 hover:underline"
            >
              Yes, clear
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[10.5px] uppercase tracking-[.16em] text-ink-muted underline-offset-4 hover:underline"
            >
              Keep them
            </button>
          </>
        ) : (
          <button
            ref={clearRef}
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[10.5px] uppercase tracking-[.16em] text-ink-muted underline-offset-4 transition-colors hover:text-magenta hover:underline"
          >
            Clear wishlist
          </button>
        )}
      </div>
    </>
  );
}
