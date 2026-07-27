import Link from "next/link";
import { MapPin } from "lucide-react";
import { SearchBar } from "./search-bar";
import { SortFilter } from "./sort-filter";
import { TempleCard, summaryToCard } from "@/components/ui/temple-card";
import { Pagination } from "./pagination";
import { MapStateSelect } from "./map-state-select";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";
import { pluralize } from "@/lib/format";
import type { PagedTemples } from "@/lib/temples";

/**
 * Map mode's results column (docs/05 §6) — also the mobile bottom sheet's content.
 * Owns the two map-specific empty states (docs/05 §5): no state picked yet, and a
 * selected state with zero temples. Always leads with the state selector (docs/07 §5#3)
 * so touch/zoom/pointer users have a guaranteed path to switch state without the map.
 */
export function MapResultsColumn({
  current,
  stateLabel,
  result,
  counts,
}: {
  current: ParsedExploreParams;
  stateLabel: string | null;
  result: PagedTemples;
  /** slug -> temple count, for the always-present state selector (docs/07 §5#3). */
  counts: Record<string, number>;
}) {
  const selector = (
    <div className="mb-6">
      <MapStateSelect current={current} counts={counts} />
    </div>
  );

  if (!current.state) {
    return (
      <div>
        {selector}
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center"
        >
          <MapPin className="h-8 w-8 text-magenta" aria-hidden />
          <p className="font-display text-lg font-semibold text-plum">
            Pick a state on the map to see its temples.
          </p>
        </div>
      </div>
    );
  }

  const label = stateLabel ?? current.state;

  if (result.total === 0) {
    return (
      <div>
        {selector}
        <h2 className="font-display text-2xl font-semibold text-plum">{label}</h2>
        <div
          role="status"
          className="mt-8 flex flex-col items-center rounded-card bg-magenta-soft px-6 py-14 text-center"
        >
          <p className="font-display text-xl font-semibold text-plum">No temples in {label} yet.</p>
          <p className="mt-2 text-sm text-ink-muted">We&apos;re always adding more.</p>
          <Link
            href={buildExploreHref(current, { view: "list", state: undefined, page: 1 })}
            className="mt-6 inline-flex h-11 items-center rounded-full border border-line-strong bg-canvas px-6 text-sm font-semibold text-plum transition-colors hover:border-magenta hover:text-magenta"
          >
            Browse all temples
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {selector}
      <h2 className="font-display text-2xl font-semibold text-plum">{label}</h2>
      <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-label text-ink-muted" aria-live="polite">
        {pluralize(result.total, "temple")}
      </p>

      <div className="mt-5">
        <SearchBar current={current} placeholder={`Search temples in ${label}…`} />
      </div>
      <div className="mt-3">
        <SortFilter current={current} />
      </div>

      <ul className="mt-5 divide-y divide-line">
        {result.items.map((temple) => (
          <li key={temple.id} className="py-1.5">
            <TempleCard temple={summaryToCard(temple)} variant="compact" />
          </li>
        ))}
      </ul>

      <Pagination current={current} page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
