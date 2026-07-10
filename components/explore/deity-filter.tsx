"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { FilterPopover } from "./filter-popover";
import { DeityIcon } from "@/components/brand/deity-icons";
import { DEITY_ORDER, DEITY_META, type DeityKey } from "@/lib/deities";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

export function DeityFilter({
  current,
  counts,
}: {
  current: ParsedExploreParams;
  counts: Record<DeityKey, number>;
}) {
  const router = useRouter();

  function select(key: DeityKey | undefined) {
    router.push(buildExploreHref(current, { deity: key, page: 1 }));
  }

  return (
    <FilterPopover
      label={current.deity ? `Deity: ${DEITY_META[current.deity].label}` : "Deity"}
      active={!!current.deity}
      panelLabel="Filter by deity"
    >
      {/* Plain semantic list — see state-filter.tsx for why this isn't role="listbox". */}
      <ul className="space-y-0.5">
        {current.deity ? (
          <li>
            <button
              type="button"
              onClick={() => select(undefined)}
              className="flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-magenta-deep hover:bg-magenta-soft"
            >
              Clear deity filter
            </button>
          </li>
        ) : null}
        {DEITY_ORDER.map((key) => {
          const meta = DEITY_META[key];
          const count = counts[key];
          const selected = current.deity === key;
          if (count === 0 && !selected) return null;
          return (
            <li key={key}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => select(selected ? undefined : key)}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-magenta-soft"
              >
                <span className="shrink-0" style={{ color: meta.accent }}>
                  <DeityIcon icon={meta.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  {meta.label} <span className="text-ink-muted">({count})</span>
                </span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-magenta" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </FilterPopover>
  );
}
