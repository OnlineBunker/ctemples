"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

const STORAGE_KEY = "ctemples:your-state";

/**
 * "Your state" affordance (docs/02 §3.5, docs/05 §2). Personalizes a *default only* — it
 * offers the state filter via a real link, never auto-navigates, so a shared URL always
 * renders identically for everyone. Hidden once a state filter is already active (a
 * second "near you" suggestion would be redundant/confusing).
 */
export function YourStatePill({
  current,
  stateOptions,
}: {
  current: ParsedExploreParams;
  stateOptions: { state: string; slug: string }[];
}) {
  const [storedSlug, setStoredSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setStoredSlug(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage unavailable (private mode, disabled) — falls through to the picker.
    }
    setReady(true);
  }, []);

  if (!ready || current.state) return null;

  if (storedSlug) {
    const label = stateOptions.find((s) => s.slug === storedSlug)?.state;
    if (!label) return null;
    return (
      <p className="mt-4 text-sm text-ink-muted">
        Showing near you:{" "}
        <Link
          href={buildExploreHref(current, { state: storedSlug, page: 1 })}
          className="font-medium text-magenta-deep hover:underline"
        >
          {label}
        </Link>{" "}
        ·{" "}
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.removeItem(STORAGE_KEY);
            } catch {
              // no-op
            }
            setStoredSlug(null);
          }}
          className="text-ink-muted underline-offset-2 hover:underline"
        >
          Change
        </button>
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
      <label htmlFor="your-state-picker">Pick your state for local results →</label>
      <select
        id="your-state-picker"
        defaultValue=""
        onChange={(e) => {
          const slug = e.target.value;
          if (!slug) return;
          try {
            window.localStorage.setItem(STORAGE_KEY, slug);
          } catch {
            // no-op — the suggestion just won't persist across visits
          }
          setStoredSlug(slug);
        }}
        className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:border-magenta"
      >
        <option value="" disabled>
          Choose a state
        </option>
        {stateOptions.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.state}
          </option>
        ))}
      </select>
    </div>
  );
}
