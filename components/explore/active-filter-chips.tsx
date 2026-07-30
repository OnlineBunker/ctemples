import Link from "next/link";
import { X } from "lucide-react";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";
import { DEITY_META } from "@/lib/deities";
import { PUBLIC_SORT_OPTIONS } from "@/lib/filter";

/**
 * Removable chips for every non-default filter, plus "Reset all" (docs/05 §3.3). Plain
 * links — no client JS needed, since removing a filter is just a navigation.
 */
export function ActiveFilterChips({
  current,
  stateLabel,
  tagLabels,
}: {
  current: ParsedExploreParams;
  stateLabel: string | null;
  tagLabels: Map<string, string>;
}) {
  const chips: { key: string; label: string; href: string }[] = [];

  if (current.state) {
    chips.push({
      key: "state",
      label: stateLabel ?? current.state,
      href: buildExploreHref(current, { state: undefined, page: 1 }),
    });
  }
  if (current.deity) {
    chips.push({
      key: "deity",
      label: DEITY_META[current.deity].label,
      href: buildExploreHref(current, { deity: undefined, page: 1 }),
    });
  }
  for (const slug of current.tags) {
    chips.push({
      key: `tag-${slug}`,
      label: tagLabels.get(slug) ?? slug,
      href: buildExploreHref(current, { tags: current.tags.filter((t) => t !== slug), page: 1 }),
    });
  }
  // `nearest` is deliberately NOT a chip: distance ordering belongs to the visitor's own
  // location, which the "Nearest you · Turn off" control already owns. A second, removable
  // copy of the same state would be redundant and could contradict it.
  if (current.sort !== "rating" && current.sort !== "nearest") {
    chips.push({
      key: "sort",
      label: `Sort: ${PUBLIC_SORT_OPTIONS.find((o) => o.key === current.sort)?.label ?? current.sort}`,
      href: buildExploreHref(current, { sort: "rating", page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/[.18] bg-white/70 px-[15px] font-mono text-[10.5px] uppercase tracking-[.14em] text-ink transition-colors hover:border-magenta hover:text-magenta"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ))}
      <Link
        // Clears every filter but keeps the visitor's own location ordering, matching the
        // mode-switch rule (location is a personalisation, not a filter).
        href={buildExploreHref(current, {
          view: "list",
          q: "",
          exact: false,
          state: undefined,
          deity: undefined,
          tags: [],
          sort: current.near ? "nearest" : "rating",
          page: 1,
        })}
        className="inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[10.5px] uppercase tracking-[.14em] text-magenta-deep transition-colors hover:text-magenta"
      >
        Reset all
      </Link>
    </div>
  );
}
