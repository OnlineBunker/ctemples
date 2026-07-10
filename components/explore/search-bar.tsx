"use client";

import { useEffect, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { buildExploreHref, withQuery, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * The persistent Explore search bar (docs/05 §3.1). Debounced typing navigates via
 * `router.replace` (App Router — re-runs the server component, docs/02 §3.1); Enter
 * commits immediately via `router.push`. Never client-side filtering (docs/10 §1).
 */
export function SearchBar({ current }: { current: ParsedExploreParams }) {
  const router = useRouter();
  const [value, setValue] = useState(current.q);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always read the LATEST params inside the debounced callback — without this, a filter
  // picked in the 300ms window between a keystroke and the debounce firing would be
  // silently clobbered by the timer's closure over the `current` prop from render time.
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Keep the input in sync with back/forward navigation and external URL changes.
  useEffect(() => {
    setValue(current.q);
  }, [current.q]);

  // Cancel any pending debounce on unmount so a stale timer can't navigate the user back
  // to Explore after they've already clicked through to a result.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function commit(q: string, immediate: boolean) {
    const href = buildExploreHref(withQuery(currentRef.current, q));
    if (immediate) router.push(href);
    else startTransition(() => router.replace(href));
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commit(next, false), 300);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      commit(value, true);
    }
  }

  function clear() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue("");
    commit("", true);
  }

  return (
    <div className="relative max-w-[640px]">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <label htmlFor="explore-search" className="sr-only">
        Search temples, deities, places
      </label>
      <input
        id="explore-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search temples, deities, places…"
        className="h-12 w-full rounded-full border border-line-strong bg-canvas pl-11 pr-11 text-base text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:border-magenta"
      />
      {isPending ? (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-magenta"
          role="status"
          aria-label="Loading"
        />
      ) : value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:text-magenta"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
