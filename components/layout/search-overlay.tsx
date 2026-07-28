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
import { Search, Loader2 } from "lucide-react";
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
export function SearchOverlay({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions>(EMPTY_SUGGESTIONS);
  const [isPending, setIsPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
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

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* SEARCH pill trigger — cream-outline over the dark home hero, ink-outline on
          light chrome (prototype site-header). */}
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Search the atlas"
          className={cn(
            "inline-flex h-[38px] items-center gap-2 rounded-full border px-[15px] font-mono text-[10.5px] tracking-[.18em] transition-colors",
            tone === "dark"
              ? "border-porcelain/30 text-porcelain hover:border-turmeric hover:text-turmeric"
              : "border-ink/20 text-ink hover:border-magenta hover:text-magenta",
          )}
        >
          <Search className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden md:inline">SEARCH</span>
          <kbd
            className={cn(
              "hidden rounded-md border px-1.5 py-0.5 font-mono text-[0.62rem] normal-case md:inline",
              tone === "dark" ? "border-porcelain/25 text-porcelain/60" : "border-ink/15 text-ink/50",
            )}
          >
            ⌘K
          </kbd>
        </button>
      </Dialog.Trigger>

      {/* Full-screen plum takeover — "SEARCH THE ATLAS" (prototype, docs/15 §0a). */}
      <Dialog.Portal>
        <Dialog.Content
          className="fixed inset-0 z-[500] flex flex-col bg-[rgba(36,16,33,.96)] text-porcelain backdrop-blur-[14px] focus:outline-none"
          onOpenAutoFocus={(e) => {
            // Radix would otherwise focus the first focusable child — the Close (✕) button,
            // which precedes the input in DOM order — leaving the caret out of the search
            // field. Send focus straight to the input so typing works the instant it opens.
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search temples</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search by temple name, deity, city, or state. Type at least two characters.
          </Dialog.Description>

          <div className="flex items-center justify-between px-5 py-[15px] sm:px-8 lg:px-12 xl:px-[clamp(20px,6vw,110px)]">
            <span className="font-mono text-[11px] tracking-[.28em] text-porcelain/50">SEARCH THE ATLAS</span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-porcelain/25 text-porcelain transition-colors hover:border-magenta hover:bg-magenta"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div className="px-5 sm:px-8 lg:px-12 xl:px-[clamp(20px,8vw,110px)]" style={{ paddingTop: "clamp(10px,4vh,36px)" }}>
            <label htmlFor={inputId} className="sr-only">
              Search temples, deities, places
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Temple, deity, city, state…"
                role="combobox"
                aria-expanded={listboxRendered}
                aria-controls={listboxRendered ? listId : undefined}
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
                className="w-full border-b-2 border-porcelain/25 bg-transparent pb-4 pt-1.5 font-display font-semibold tracking-[-.02em] text-porcelain caret-turmeric placeholder:text-porcelain/40 focus:border-magenta focus:outline-none"
                style={{ fontSize: "clamp(26px,4.5vw,52px)" }}
              />
              {isPending ? (
                <Loader2
                  className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-turmeric"
                  role="status"
                  aria-label="Loading"
                />
              ) : null}
            </div>

            {!showResults ? (
              <div className="mt-[22px] flex flex-wrap items-center gap-[9px]">
                <span className="font-mono text-[10px] tracking-[.24em] text-porcelain/40">POPULAR</span>
                {POPULAR_SEARCH_CHIPS.map((chip) => (
                  <TransitionLink
                    key={chip.label}
                    href={chip.href}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-porcelain/25 px-[15px] py-2 text-[12.5px] text-porcelain transition-colors hover:border-turmeric hover:text-turmeric"
                  >
                    {chip.label}
                  </TransitionLink>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex-1 overflow-y-auto px-5 pb-16 pt-6 sm:px-8 lg:px-12 xl:px-[clamp(20px,8vw,110px)]">
            {showResults && suggestions.items.length === 0 && !isPending ? (
              <p className="mt-4 font-mono text-[11px] tracking-[.2em] text-porcelain/50">
                NO DOORWAYS MATCH — TRY &ldquo;SHIVA&rdquo;, &ldquo;MADURAI&rdquo;, &ldquo;HIMALAYAN&rdquo;
              </p>
            ) : null}
            {showResults && suggestions.items.length > 0 ? (
              <>
                {suggestions.matchedAliasLabel ? (
                  <p className="pb-2 font-mono text-[10px] tracking-[.2em] text-turmeric">
                    MATCHED: &lsquo;{trimmedQuery.toUpperCase()}&rsquo; → {suggestions.matchedAliasLabel.toUpperCase()}
                  </p>
                ) : null}
                {/* Clicking any result (a real TransitionLink underneath) always closes the
                    overlay — one delegated handler instead of one per row. */}
                <ul id={listId} role="listbox" aria-label="Search results" onClick={() => setOpen(false)}>
                  {suggestions.items.map((item, i) => (
                    <li key={item.id} id={`${listId}-option-${i}`} role="option" aria-selected={i === activeIndex}>
                      <TransitionLink
                        href={`/temples/${item.id}`}
                        className={cn(
                          "flex items-center gap-[clamp(14px,3vw,28px)] border-b border-porcelain/10 py-[15px] transition-[padding-left] duration-300 ease-threshold",
                          i === activeIndex ? "pl-3.5 text-turmeric" : "text-porcelain hover:pl-3.5",
                        )}
                      >
                        <span className="w-[26px] shrink-0 font-mono text-[11px] text-magenta">{pad(i + 1)}</span>
                        <span className="relative block h-14 w-11 shrink-0 overflow-hidden rounded-[22px_22px_7px_7px]">
                          <TempleImage src={item.hero?.url ?? ""} alt="" region={item.region} seed={item.id} sizes="44px" />
                        </span>
                        <span
                          className="min-w-0 flex-1 truncate font-display font-semibold tracking-[-.01em]"
                          style={{ fontSize: "clamp(18px,2.6vw,26px)" }}
                        >
                          {item.name}
                        </span>
                        <span className="hidden shrink-0 font-mono text-[10.5px] uppercase tracking-[.14em] text-porcelain/50 sm:block">
                          {item.city} · {item.state}
                        </span>
                        <span className="text-turmeric" aria-hidden>
                          →
                        </span>
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {showResults ? (
              <div className="pt-5" onClick={() => setOpen(false)}>
                <TransitionLink
                  href={`/explore?q=${encodeURIComponent(trimmedQuery)}`}
                  className="font-mono text-[11px] tracking-[.2em] text-porcelain/60 transition-colors hover:text-turmeric"
                >
                  SEE ALL RESULTS FOR &lsquo;{trimmedQuery.toUpperCase()}&rsquo; →
                </TransitionLink>
              </div>
            ) : null}
          </div>

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
