"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterPopover } from "./filter-popover";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";
import type { TagCount } from "@/lib/temple-queries";

const MAX_TAGS = 3;

export function TagFilter({
  current,
  options,
}: {
  current: ParsedExploreParams;
  /** Contextual counts (docs/05 §3.2), pre-merged so every currently-selected slug is
   *  present even at 0 (docs/05 §3.3 — a selected value must stay deselectable). */
  options: TagCount[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [blocked, setBlocked] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withCount = options.filter((o) => o.count > 0 || current.tags.includes(o.slug));
    const matched = q ? withCount.filter((o) => o.tag.toLowerCase().includes(q)) : withCount;
    if (q) return matched;
    // Selected tags are pinned ahead of the top-12 cap so a selected tag ranking below
    // #12 by count still renders (and stays deselectable) even without typing a search —
    // slicing the raw list could otherwise cut it off entirely.
    const selected = matched.filter((o) => current.tags.includes(o.slug));
    const unselected = matched.filter((o) => !current.tags.includes(o.slug));
    return [...selected, ...unselected].slice(0, Math.max(12, selected.length));
  }, [options, query, current.tags]);

  function toggle(slug: string) {
    const selected = current.tags.includes(slug);
    if (!selected && current.tags.length >= MAX_TAGS) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    const nextTags = selected ? current.tags.filter((t) => t !== slug) : [...current.tags, slug];
    router.push(buildExploreHref(current, { tags: nextTags, page: 1 }));
  }

  return (
    <FilterPopover
      label={current.tags.length ? `Tags: ${current.tags.length}` : "Tags"}
      active={current.tags.length > 0}
      panelLabel="Filter by tag"
    >
      <label className="sr-only" htmlFor="tag-filter-search">
        Search tags
      </label>
      <input
        id="tag-filter-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tags…"
        className="mb-2 h-11 w-full rounded-xl border border-line-strong px-3.5 text-base text-ink focus-visible:outline-none focus-visible:border-magenta"
      />
      {blocked ? (
        <p role="status" className="mb-2 rounded-lg bg-turmeric-soft px-3 py-2 text-xs text-plum">
          Up to 3 tags at a time.
        </p>
      ) : null}
      <ul className="max-h-64 space-y-0.5 overflow-y-auto">
        {visible.map((o) => {
          const checked = current.tags.includes(o.slug);
          return (
            <li key={o.slug}>
              <label className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-magenta-soft">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.slug)}
                  className="h-4 w-4 shrink-0 rounded border-line-strong text-magenta accent-magenta focus-visible:outline-magenta"
                />
                <span>
                  {o.tag} <span className="text-ink-muted">({o.count})</span>
                </span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="px-3 py-2 text-sm text-ink-muted">No tags match.</li>
        ) : null}
      </ul>
    </FilterPopover>
  );
}
