"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * The wishlist ("saved temples") — a client-only store backed by `localStorage`, since this
 * prototype has no accounts or backend (docs/11). One module-level store shared by every
 * mounted heart, so toggling a temple on an Explore card and on its detail page always agree,
 * and a second tab picks the change up via the `storage` event.
 *
 * Exposed through `useSyncExternalStore` rather than per-component `useState`: the snapshot is
 * a version counter (a stable primitive — returning the Set itself would be a new reference
 * every render and loop forever), and the server snapshot is 0 so SSR and the first client
 * render always agree (no hydration mismatch — saves only exist client-side).
 */
const STORAGE_KEY = "ctemples:saves";

let ids: Set<string> | null = null;
let version = 0;
const listeners = new Set<() => void>();
/**
 * Saves live only in the browser, so the server renders every temple as un-saved. Reading
 * `localStorage` during the FIRST client render would therefore contradict the server HTML
 * and trip a hydration mismatch (React #418) for anyone with something already saved. Stay
 * un-saved until the first post-mount effect flips this, then re-render with the real set.
 */
let hydrated = false;

function read(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    // Unavailable (private mode / disabled) or corrupt — start empty rather than throw.
    return new Set();
  }
}

function ensure(): Set<string> {
  if (!ids) ids = read();
  return ids;
}

function emit() {
  version += 1;
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ensure()]));
  } catch {
    // Saves stay in memory for this session only.
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Cross-tab: another tab wrote the key, so drop the cache and re-read.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    ids = null;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => version;
const getServerSnapshot = () => 0;

/**
 * Adopt the persisted set once, after mount, then tell every subscriber to re-render.
 *
 * This ALWAYS emits, even when nothing is saved: consumers derive `ready` from `hydrated`,
 * so skipping the notification for an empty set left them stuck on their pre-hydration
 * branch — the wishlist page sat on "Opening your doorways…" forever instead of showing its
 * empty state.
 */
function hydrate() {
  if (hydrated) return;
  hydrated = true;
  ids = read();
  emit();
}

export function useWishlist() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /**
   * Per-component mount gate, NOT the shared `hydrated` flag alone.
   *
   * The module flag is flipped by whichever consumer mounts first — in practice the header's
   * wishlist link, which lives in the root layout. On a streamed route (`/explore` is the one
   * dynamic page) that happens *before* the temple cards further down finish hydrating, so those
   * cards' first client render saw `hydrated === true`, read localStorage, and rendered "Saved"
   * against server HTML that said "Save" — React #418, reproducible only on /explore and only
   * with something already saved.
   *
   * Gating on this component's own mount makes every consumer's first render match the server
   * regardless of the order others hydrate in.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    hydrate();
  }, []);

  const ready = mounted && hydrated;

  const has = useCallback(
    (id: string) => {
      if (!ready || typeof window === "undefined") return false;
      return ensure().has(id);
    },
    [ready],
  );

  const toggle = useCallback((id: string) => {
    hydrate();
    const set = ensure();
    if (set.has(id)) set.delete(id);
    else set.add(id);
    persist();
    emit();
  }, []);

  const clear = useCallback(() => {
    hydrate();
    ensure().clear();
    persist();
    emit();
  }, []);

  // Newest first: the persisted array is oldest→newest (insertion order, preserved by both
  // `read()` and `Set`), so reversing puts the most recently saved temple at the top.
  const ids = ready && typeof window !== "undefined" ? [...ensure()].reverse() : [];
  // A stable primitive for effect dependencies — `ids` is a fresh array every render, so
  // depending on it directly would re-run an effect forever.
  const key = ids.join(",");

  return { has, toggle, clear, count: ids.length, ids, key, ready };
}
