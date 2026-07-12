"use client";

import {
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, Loader2 } from "lucide-react";
import { TempleImage } from "@/components/media/temple-image";
import { TransitionLink } from "@/components/motion/transition-link";
import { addTransitionType } from "@/components/motion/view-transition";
import { getSearchSuggestions, type SearchSuggestions } from "@/lib/search-actions";
import { POPULAR_SEARCH_CHIPS } from "@/components/home/popular-searches";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;
const EMPTY_SUGGESTIONS: SearchSuggestions = { items: [], matchedAliasLabel: null };

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

/** Mirrors TransitionLink's own navigation (view-transition-tagged push) for the
 *  keyboard/Enter path, which can't go through a real `<a>` click the way the mouse path
 *  does — kept in sync with components/motion/transition-link.tsx's handleClick. */
function navigate(router: ReturnType<typeof useRouter>, href: string) {
  startTransition(() => {
    try {
      addTransitionType?.("nav-forward");
    } catch {
      /* experimental API unavailable — plain navigation still works */
    }
    router.push(href);
  });
}

/**
 * Header search overlay + Cmd/Ctrl-K (docs/10 §6, D21). One Radix Dialog (the sanctioned
 * D19 dependency) with two triggers — desktop pill (with the ⌘K hint) and mobile icon
 * button — both opening the same instance. Deliberately has NO open/close animation: the
 * spec gives no duration for this component (unlike the gallery lightbox's explicit
 * 200ms), and Phase 5 spent three rounds debugging a hand-rolled exit-animation/unmount
 * interaction — for an un-specced transition, instant open/close via Radix's own default
 * mount lifecycle is the safer choice, not a corner cut.
 *
 * Typeahead calls the `getSearchSuggestions` server action (lib/search-actions.ts), which
 * wraps the same `queryTemples` engine every entry point uses (docs/10 §1) — never a
 * client-side corpus. A monotonic request-id guards against a stale response landing
 * after a newer keystroke's request — the practical equivalent of AbortController
 * cancellation for a Server Action (there's no fetch Request here to abort).
 */
export function SearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions>(EMPTY_SUGGESTIONS);
  const [isPending, setIsPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputId = useId();
  const listId = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // D21: Cmd/Ctrl-K toggles the overlay, no-op when focus is already in an editable
  // element (including this overlay's own input — Escape is the close path there).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      setOpen((o) => !o);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset to a clean slate every time the overlay closes, so reopening never shows a
  // stale query/result set from the last session.
  useEffect(() => {
    if (open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setSuggestions(EMPTY_SUGGESTIONS);
    setActiveIndex(-1);
    setIsPending(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function onQueryChange(next: string) {
    setQuery(next);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Bumped on EVERY keystroke (not just when a debounce timer actually fires) and
    // captured now, before the timer even starts — otherwise an in-flight request
    // dispatched by an earlier keystroke stays "current" until the next debounce fires,
    // so a fast edit-then-revert (e.g. "shiv" -> "shiva" -> "shi") could still apply a
    // stale response for "shiv" over the "shi" that's actually on screen. This is what
    // makes cancellation track every keystroke, not just every dispatched request
    // (docs/10 §9: "in-flight cancelled on keystroke").
    const requestId = ++requestIdRef.current;

    const trimmed = next.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions(EMPTY_SUGGESTIONS);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    debounceRef.current = setTimeout(() => {
      getSearchSuggestions(trimmed).then((result) => {
        if (requestId !== requestIdRef.current) return; // a newer keystroke superseded this
        setSuggestions(result);
        setIsPending(false);
      });
    }, DEBOUNCE_MS);
  }

  function goToTemple(id: string) {
    navigate(router, `/temples/${id}`);
    setOpen(false);
  }

  function goToExplore(q: string) {
    navigate(router, `/explore?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    const items = suggestions.items;
    if (e.key === "ArrowDown") {
      if (items.length === 0) return;
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      if (items.length === 0) return;
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      const trimmed = query.trim();
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        goToTemple(items[activeIndex].id);
      } else if (trimmed.length >= MIN_QUERY_LENGTH) {
        e.preventDefault();
        goToExplore(trimmed);
      }
    }
  }

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= MIN_QUERY_LENGTH;
  // The exact condition under which the `<ul id={listId} role="listbox">` below actually
  // mounts (items present, or still pending so it's about to be) — aria-controls/
  // aria-expanded MUST derive from this same boolean, or they can reference a listbox id
  // that doesn't exist in the DOM (popular-chips/no-results branches) or report
  // aria-expanded=false while an empty listbox is genuinely mounted (the pending-empty
  // transitional state right after crossing MIN_QUERY_LENGTH).
  const listboxRendered = showResults && (suggestions.items.length > 0 || isPending);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* One responsive trigger, not two DOM-separate buttons — the label/⌘K hint fade
          in at md: via inner spans, rather than swapping between a desktop pill and a
          mobile icon button, which would need two Dialog.Triggers living in two
          different parts of the header's flex layout for one Dialog.Root. */}
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Search temples"
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 font-mono text-[0.7rem] uppercase tracking-label text-ink-muted transition-colors hover:bg-canvas-soft hover:text-ink md:border md:border-line md:px-3 md:hover:border-line-strong md:hover:bg-transparent"
        >
          <Search className="h-5 w-5 md:h-4 md:w-4" aria-hidden />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.62rem] normal-case text-ink-subtle md:inline">
            ⌘K
          </kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-plum/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-[70] flex h-[50vh] flex-col overflow-hidden rounded-t-card border-t border-line bg-canvas shadow-xl focus:outline-none md:inset-x-auto md:bottom-auto md:left-1/2 md:top-24 md:h-auto md:max-h-[70vh] md:w-[480px] md:-translate-x-1/2 md:rounded-card md:border"
        >
          <Dialog.Title className="sr-only">Search temples</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search by temple name, deity, city, or state. Type at least two characters.
          </Dialog.Description>

          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <label htmlFor={inputId} className="sr-only">
              Search temples, deities, places
            </label>
            <input
              id={inputId}
              type="text"
              autoComplete="off"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search temples, deities, places…"
              role="combobox"
              aria-expanded={listboxRendered}
              aria-controls={listboxRendered ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
              className="h-14 w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
            />
            {isPending ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-magenta" role="status" aria-label="Loading" />
            ) : null}
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close search"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-canvas-soft hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!showResults ? (
              <div className="p-3">
                <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
                  Popular searches
                </p>
                <ul className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_CHIPS.map((chip) => (
                    <li key={chip.label}>
                      <TransitionLink
                        href={chip.href}
                        className="inline-flex items-center rounded-full border border-line px-3 py-1.5 text-sm text-plum transition-colors hover:border-magenta hover:bg-magenta-soft hover:text-magenta-deep"
                      >
                        {chip.label}
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : suggestions.items.length === 0 && !isPending ? (
              <p className="p-6 text-center text-sm text-ink-muted">
                No temples found for &lsquo;{trimmedQuery}&rsquo;
              </p>
            ) : (
              <>
                {suggestions.matchedAliasLabel ? (
                  <p className="px-3 pb-2 pt-1 text-xs text-magenta-deep">
                    Matched: &lsquo;{trimmedQuery}&rsquo; → {suggestions.matchedAliasLabel}
                  </p>
                ) : null}
                {/* Clicking any result (a real TransitionLink underneath) always closes the
                    overlay — one delegated handler instead of one per row. */}
                <ul id={listId} role="listbox" aria-label="Search results" onClick={() => setOpen(false)}>
                  {suggestions.items.map((item, i) => (
                    <li
                      key={item.id}
                      id={`${listId}-option-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                    >
                      <TransitionLink
                        href={`/temples/${item.id}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-2",
                          i === activeIndex ? "bg-magenta-soft" : "hover:bg-canvas-soft",
                        )}
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                          <TempleImage
                            src={item.hero?.url ?? ""}
                            alt=""
                            region={item.region}
                            seed={item.id}
                            sizes="32px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-plum">{item.name}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {item.city}, {item.state}
                          </p>
                        </div>
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {showResults ? (
            <div className="border-t border-line" onClick={() => setOpen(false)}>
              <TransitionLink
                href={`/explore?q=${encodeURIComponent(trimmedQuery)}`}
                className="block p-3 text-center text-sm font-medium text-magenta-deep hover:bg-magenta-soft"
              >
                See all results for &lsquo;{trimmedQuery}&rsquo; →
              </TransitionLink>
            </div>
          ) : null}

          <div aria-live="polite" className="sr-only">
            {showResults && !isPending
              ? `${suggestions.items.length} result${suggestions.items.length === 1 ? "" : "s"}`
              : ""}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
