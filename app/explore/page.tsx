import type { Metadata } from "next";
import { queryTemples, getStateCounts, getTempleCount } from "@/lib/temples";
import { parseExploreParams, type ParsedExploreParams } from "@/lib/explore-url";
import { DEITY_META } from "@/lib/deities";
import { pluralize, padCount } from "@/lib/format";
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
import { NearbyLocator } from "@/components/explore/nearby-locator";
import { EmptyState } from "@/components/explore/empty-state";
// The map bundle (IndiaMap geometry + region pills + Framer Motion sheet) loads only under
// ?view=map (docs/05 §6's last bullet) — list mode never pays for it. The client-side
// lazy boundary (ssr:false) is what actually keeps it out of the /explore page chunk; a
// server-side next/dynamic here did not.
import { ExploreMapViewLazy as ExploreMapView } from "@/components/explore/explore-map-view.lazy";

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
    // Every facet combination (`?state=…&deity=…&tag=…&page=…&near=…`) is the same collection
    // viewed differently, so all of them canonicalise to the bare route. Without this, faceted
    // navigation generates effectively unlimited duplicate URLs for crawlers to burn budget on.
    alternates: { canonical: "/explore" },
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
  const [result, allStates, totalTemples] = await Promise.all([
    queryTemples({
      q: parsed.q,
      exact: parsed.exact,
      state: parsed.state,
      deity: parsed.deity,
      tags: parsed.tags,
      sort: parsed.sort,
      page: parsed.page,
      near: parsed.near,
    }),
    getStateCounts(),
    getTempleCount(),
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

  // The prototype's atlas readout: "NN / NN DOORWAYS" — both numbers data-derived.
  const doorways = `${padCount(result.total)} / ${padCount(totalTemples)} DOORWAYS`;

  return (
    <div style={{ padding: "clamp(44px,7vh,80px) clamp(20px,6vw,110px) clamp(70px,10vh,110px)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="font-display font-bold leading-none tracking-[-.03em] text-ink"
          style={{ fontSize: "clamp(42px,6.6vw,92px)" }}
        >
          The atlas.
          {summary ? <span className="sr-only"> — {summary}</span> : null}
        </h1>
        <p className="font-mono text-[11px] tracking-[.24em] text-ink-muted" aria-hidden>
          {doorways}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ModeToggle current={parsed} />
        {/* Location is a list-mode ordering; map mode is driven by the state you pick. */}
        {parsed.view === "list" ? <NearbyLocator current={parsed} /> : null}
      </div>

      {parsed.view === "map" ? (
        <>
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-label text-ink-muted" aria-live="polite">
            {countLine}
          </p>
          <ExploreMapView current={parsed} result={result} allStates={allStates} stateLabel={stateLabel} />
        </>
      ) : (
        <>
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

          {result.matchedAliasLabel && !parsed.exact ? (
            <SmartMatchBanner current={parsed} label={result.matchedAliasLabel} />
          ) : null}

          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-label text-ink-muted" aria-live="polite">
            {countLine}
          </p>

          {result.items.length > 0 ? (
            <>
              {/* Visually-hidden — each card's name is an h3, and this page has no
                  other h2, which without this would skip a level (h1 -> h3). */}
              <h2 className="sr-only">Search results</h2>
              <ResultGrid items={result.items} />
              <Pagination current={parsed} page={result.page} totalPages={result.totalPages} />
            </>
          ) : (
            <EmptyState current={parsed} />
          )}
        </>
      )}
    </div>
  );
}
