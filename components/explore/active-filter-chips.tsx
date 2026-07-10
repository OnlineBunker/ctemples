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
  if (current.sort !== "rating") {
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
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 text-sm text-ink transition-colors hover:border-magenta hover:text-magenta"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ))}
      <Link
        href={buildExploreHref(current, {
          view: "list",
          q: "",
          exact: false,
          state: undefined,
          deity: undefined,
          tags: [],
          sort: "rating",
          page: 1,
        })}
        className="inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm font-medium text-magenta-deep hover:bg-magenta-soft"
      >
        Reset all
      </Link>
    </div>
  );
}
