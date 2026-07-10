"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { FilterPopover } from "./filter-popover";
import { PUBLIC_SORT_OPTIONS, type SortKey } from "@/lib/filter";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

export function SortFilter({ current }: { current: ParsedExploreParams }) {
  const router = useRouter();
  const currentLabel = PUBLIC_SORT_OPTIONS.find((o) => o.key === current.sort)?.label ?? "Top rated";
  const suppressedBySearch = current.q.length > 0;

  function select(sort: SortKey) {
    router.push(buildExploreHref(current, { sort, page: 1 }));
  }

  return (
    <FilterPopover label={`Sort: ${currentLabel}`} active={current.sort !== "rating"} panelLabel="Sort results">
      {suppressedBySearch ? (
        <p className="mb-2 rounded-lg bg-turmeric-soft px-3 py-2 text-xs text-plum">
          Search results are ordered by relevance — sort applies once you clear the search.
        </p>
      ) : null}
      {/* Plain semantic list — see state-filter.tsx for why this isn't role="listbox". */}
      <ul className="space-y-0.5">
        {PUBLIC_SORT_OPTIONS.map((o) => (
          <li key={o.key}>
            <button
              type="button"
              aria-pressed={current.sort === o.key}
              onClick={() => select(o.key)}
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-magenta-soft"
            >
              {o.label}
              {current.sort === o.key ? <Check className="h-4 w-4 shrink-0 text-magenta" aria-hidden /> : null}
            </button>
          </li>
        ))}
      </ul>
    </FilterPopover>
  );
}
