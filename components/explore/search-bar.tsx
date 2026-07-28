"use client";

import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { buildExploreHref, withQuery, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * The persistent Explore search bar (docs/05 §3.1). Debounced typing navigates via
 * `router.replace` (App Router — re-runs the server component, docs/02 §3.1); Enter
 * commits immediately via `router.push`. Never client-side filtering (docs/10 §1).
 */
export function SearchBar({
  current,
  placeholder = "Search temples, deities, places…",
}: {
  current: ParsedExploreParams;
  /** Map mode scopes the copy to the selected state (docs/05 §6). */
  placeholder?: string;
}) {
  const router = useRouter();
  // Map mode mounts two SearchBars at once (desktop pane + mobile sheet, toggled by CSS),
  // so a hardcoded id would collide — useId() keeps input/label association unique per
  // instance and valid.
  const inputId = useId();
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

  // The prototype's quiet UNDERLINE search (docs/15 §0a): a large Bricolage input over a
  // hairline rule, magenta caret — not a boxed pill.
  return (
    <div className="flex max-w-[620px] items-center gap-3.5 border-b-[1.5px] border-ink/[.22] px-0.5 pb-3.5 pt-2 focus-within:border-magenta">
      <Search className="h-[19px] w-[19px] shrink-0 text-ink/45" aria-hidden />
      <label htmlFor={inputId} className="sr-only">
        Search temples, deities, places
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-display font-semibold tracking-[-.01em] text-ink caret-magenta placeholder:text-ink/40 focus:outline-none"
        style={{ fontSize: "clamp(19px,2.2vw,24px)" }}
      />
      {isPending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-magenta" role="status" aria-label="Loading" />
      ) : value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/45 hover:text-magenta"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
