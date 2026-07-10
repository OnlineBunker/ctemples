import type { Metadata } from "next";
import { queryTemples, getStateCounts } from "@/lib/temples";
import { parseExploreParams, type ParsedExploreParams } from "@/lib/explore-url";
import { DEITY_META } from "@/lib/deities";
import { pluralize } from "@/lib/format";
import { SearchBar } from "@/components/explore/search-bar";
import { StateFilter } from "@/components/explore/state-filter";
import { DeityFilter } from "@/components/explore/deity-filter";
import { TagFilter } from "@/components/explore/tag-filter";
import { SortFilter } from "@/components/explore/sort-filter";
import { ActiveFilterChips } from "@/components/explore/active-filter-chips";
import { SmartMatchBanner } from "@/components/explore/smart-match-banner";
import { ResultGrid } from "@/components/explore/result-grid";
import { Pagination } from "@/components/explore/pagination";
import { ModeToggle } from "@/components/explore/mode-toggle";
import { MapModeNotice } from "@/components/explore/map-mode-notice";
import { YourStatePill } from "@/components/explore/your-state-pill";
import { EmptyState } from "@/components/explore/empty-state";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

function summaryLabel(parsed: ParsedExploreParams, stateLabel: string | null): string | null {
  if (parsed.q) return `'${parsed.q}'`;
  if (parsed.state) return stateLabel ?? parsed.state;
  if (parsed.deity) return DEITY_META[parsed.deity].label;
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}): Promise<Metadata> {
  const sp = await searchParams;
  const parsed = parseExploreParams(sp);
  const allStates = await getStateCounts();
  const stateLabel = parsed.state ? allStates.find((s) => s.slug === parsed.state)?.state ?? null : null;
  const summary = summaryLabel(parsed, stateLabel);
  return {
    title: summary ? `Explore · ${summary}` : "Explore",
    description:
      "Search and filter India's temples by state, deity, and tag — then step through into each one's full story.",
  };
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParamsInput }) {
  const sp = await searchParams;
  const parsed = parseExploreParams(sp);

  // getStateCounts() is `cache()`-wrapped (lib/temples.ts), so calling it here and again
  // in generateMetadata costs one array scan per request, not two. queryTemples is the
  // only call that computes the RESULT set — everything else here is a global,
  // filter-independent list the Your-State picker needs regardless of current filters
  // (docs/05 §9's "queryTemples is the page's only data import" is about the result set
  // and its own facets, which are now selected-safe inside runExploreQuery itself).
  const [result, allStates] = await Promise.all([
    queryTemples({
      q: parsed.q,
      exact: parsed.exact,
      state: parsed.state,
      deity: parsed.deity,
      tags: parsed.tags,
      sort: parsed.sort,
      page: parsed.page,
    }),
    getStateCounts(),
  ]);

  const stateLabel = parsed.state
    ? result.facets.states.find((s) => s.slug === parsed.state)?.state ?? null
    : null;
  const tagLabels = new Map(result.facets.tags.map((t) => [t.slug, t.tag]));
  const summary = summaryLabel(parsed, stateLabel);

  const from = result.total === 0 ? 0 : (result.page - 1) * result.perPage + 1;
  const to = Math.min(result.page * result.perPage, result.total);
  const countLine =
    result.total === 0
      ? `0 temples${stateLabel ? ` in ${stateLabel}` : ""}`
      : `${pluralize(result.total, "temple")}${stateLabel ? ` in ${stateLabel}` : ""} · showing ${from}–${to}`;

  return (
    <div className="shell py-16 md:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-lg text-plum">
          {summary ? `Explore · ${summary}` : "Explore"}
        </h1>
        <ModeToggle current={parsed} />
      </div>

      <YourStatePill
        current={parsed}
        stateOptions={allStates.map((s) => ({ state: s.state, slug: s.slug }))}
      />

      <div className="mt-8">
        <SearchBar current={parsed} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <StateFilter current={parsed} options={result.facets.states} selectedLabel={stateLabel} />
        <DeityFilter current={parsed} counts={result.facets.deities} />
        <TagFilter current={parsed} options={result.facets.tags} />
        <SortFilter current={parsed} />
      </div>

      <ActiveFilterChips current={parsed} stateLabel={stateLabel} tagLabels={tagLabels} />

      {result.matchedAliases.length > 0 && !parsed.exact ? (
        <SmartMatchBanner current={parsed} matchedAliases={result.matchedAliases} />
      ) : null}

      <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-label text-ink-muted" aria-live="polite">
        {countLine}
      </p>

      {parsed.view === "map" ? <MapModeNotice /> : null}

      {result.items.length > 0 ? (
        <>
          <ResultGrid items={result.items} />
          <Pagination current={parsed} page={result.page} totalPages={result.totalPages} />
        </>
      ) : (
        <EmptyState current={parsed} />
      )}
    </div>
  );
}
