"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

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

/** Adopt the persisted set once, after mount, then tell every subscriber to re-render. */
function hydrate() {
  if (hydrated) return;
  hydrated = true;
  ids = read();
  // Nothing saved → nothing changed → skip the re-render entirely (the common case).
  if (ids.size > 0) emit();
}

export function useWishlist() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(hydrate, []);

  const has = useCallback((id: string) => {
    if (!hydrated || typeof window === "undefined") return false;
    return ensure().has(id);
  }, []);

  const toggle = useCallback((id: string) => {
    hydrate();
    const set = ensure();
    if (set.has(id)) set.delete(id);
    else set.add(id);
    persist();
    emit();
  }, []);

  const count = hydrated && typeof window !== "undefined" ? ensure().size : 0;

  return { has, toggle, count };
}
