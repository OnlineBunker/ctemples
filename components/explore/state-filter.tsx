"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { FilterPopover } from "./filter-popover";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";
import type { StateCount } from "@/lib/temple-queries";

export function StateFilter({
  current,
  options,
  selectedLabel,
}: {
  current: ParsedExploreParams;
  /** Contextual counts (respects deity/tag/q, not the state filter itself — docs/05 §3.2/§10 §4). */
  options: StateCount[];
  /** Resolved even if the selected state has 0 matches under the other active filters. */
  selectedLabel: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withCount = options.filter((o) => o.count > 0 || o.slug === current.state);
    const matched = q ? withCount.filter((o) => o.state.toLowerCase().includes(q)) : withCount;
    // docs/05 §3.2: the State list is alphabetical (unlike Tag, which is count-ordered).
    return [...matched].sort((a, b) => a.state.localeCompare(b.state));
  }, [options, query, current.state]);

  function select(slug: string | undefined) {
    router.push(buildExploreHref(current, { state: slug, page: 1 }));
  }

  return (
    <FilterPopover
      label={current.state ? `State: ${selectedLabel ?? current.state}` : "State"}
      active={!!current.state}
      panelLabel="Filter by state"
    >
      <label className="sr-only" htmlFor="state-filter-search">
        Search states
      </label>
      <input
        id="state-filter-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search states…"
        className="mb-2 h-11 w-full rounded-xl border border-line-strong px-3.5 text-base text-ink focus-visible:outline-none focus-visible:border-magenta"
      />
      {/* Plain semantic list, not role="listbox"/"option" — every item is already a real,
          independently focusable <button>, and mixing a non-option "Clear" action into a
          listbox violates ARIA's required-owned-elements rule. aria-pressed conveys state. */}
      <ul className="max-h-64 space-y-0.5 overflow-y-auto">
        {current.state ? (
          <li>
            <button
              type="button"
              onClick={() => select(undefined)}
              className="flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-magenta-deep hover:bg-magenta-soft"
            >
              Clear state filter
            </button>
          </li>
        ) : null}
        {visible.map((o) => (
          <li key={o.slug}>
            <button
              type="button"
              aria-pressed={current.state === o.slug}
              onClick={() => select(current.state === o.slug ? undefined : o.slug)}
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-magenta-soft"
            >
              <span>
                {o.state} <span className="text-ink-muted">({o.count})</span>
              </span>
              {current.state === o.slug ? <Check className="h-4 w-4 shrink-0 text-magenta" aria-hidden /> : null}
            </button>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-3 py-2 text-sm text-ink-muted">No states match.</li>
        ) : null}
      </ul>
    </FilterPopover>
  );
}
