"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { TempleCard } from "@/components/temple/temple-card";
import { FilterChip } from "./filter-chip";
import { Stagger, RevealItem } from "@/components/motion/reveal";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { Button } from "@/components/ui/button";
import { REGION_ORDER, REGION_META } from "@/lib/regions";
import { filterTemples, collectTags, countActiveFilters, SORT_OPTIONS, type SortKey } from "@/lib/filter";
import { pluralize } from "@/lib/format";
import type { Region, Temple } from "@/lib/types";

const PAGE_SIZE = 9;

export function ExploreClient({
  temples,
  initial,
}: {
  temples: Temple[];
  initial: { query: string; regions: Region[]; tags: string[]; sort: SortKey };
}) {
  const [query, setQuery] = useState(initial.query);
  const [regions, setRegions] = useState<Region[]>(initial.regions);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [sort, setSort] = useState<SortKey>(initial.sort);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = useMemo(() => collectTags(temples), [temples]);
  const shownTags = showAllTags ? allTags : allTags.slice(0, 10);

  const filters = { query, regions, tags, sort };
  const filtered = useMemo(
    () => filterTemples(temples, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [temples, query, regions, tags, sort],
  );
  const activeCount = countActiveFilters(filters);

  // Reset pagination when the result set changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, regions, tags, sort]);

  // Mirror state to the URL (shareable/deep-linkable) without triggering a navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    regions.forEach((r) => params.append("region", r));
    tags.forEach((t) => params.append("tag", t));
    if (sort !== "featured") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/explore?${qs}` : "/explore");
  }, [query, regions, tags, sort]);

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }
  function clearAll() {
    setQuery("");
    setRegions([]);
    setTags([]);
    setSort("featured");
  }

  const paged = filtered.slice(0, visible);
  const filterSignature = `${query}|${regions.join(",")}|${tags.join(",")}|${sort}`;

  return (
    <div>
      {/* Controls */}
      <div className="rounded-card border border-brass/15 bg-nightstone-800/40 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-limewash/40"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search temples, cities, deities…"
              aria-label="Search temples"
              className="w-full rounded-full border border-limewash/15 bg-nightstone-900/60 py-3 pl-11 pr-4 text-sm text-limewash placeholder:text-limewash/35 focus:border-brass/50 focus-visible:outline-none"
            />
          </div>
          <label className="flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-label text-limewash/50">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="sr-only md:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort temples"
              className="rounded-full border border-limewash/15 bg-nightstone-900/60 px-4 py-2.5 text-limewash focus:border-brass/50 focus-visible:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key} className="bg-nightstone-800">
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Region chips */}
        <div className="mt-5">
          <p className="eyebrow mb-3 text-limewash/40">Region</p>
          <div className="flex flex-wrap gap-2">
            {REGION_ORDER.map((region) => (
              <FilterChip
                key={region}
                active={regions.includes(region)}
                onClick={() => setRegions((r) => toggle(r, region))}
                dotColor={REGION_META[region].pigment}
              >
                {REGION_META[region].label}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Tag chips */}
        <div className="mt-5">
          <p className="eyebrow mb-3 text-limewash/40">Tags</p>
          <div className="flex flex-wrap gap-2">
            {shownTags.map((t) => (
              <FilterChip
                key={t.value}
                active={tags.includes(t.value)}
                onClick={() => setTags((prev) => toggle(prev, t.value))}
                count={t.count}
              >
                {t.value}
              </FilterChip>
            ))}
            {allTags.length > 10 ? (
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                className="rounded-full px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-label text-brass underline-offset-4 hover:underline"
              >
                {showAllTags ? "Show fewer" : `+${allTags.length - 10} more`}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="font-mono text-[0.68rem] uppercase tracking-label text-limewash/50">
          {pluralize(filtered.length, "temple")}
          {activeCount > 0 ? ` · ${pluralize(activeCount, "filter")}` : ""}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-label text-limewash/60 transition-colors hover:text-vermilion"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear all
          </button>
        ) : null}
      </div>

      {/* Grid */}
      {paged.length > 0 ? (
        <Stagger key={filterSignature} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((temple) => (
            <RevealItem key={temple.id} className="h-full">
              <TempleCard temple={temple} />
            </RevealItem>
          ))}
        </Stagger>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-brass/20 py-20 text-center">
          <GopuramMark className="h-10 w-10 text-brass/40" />
          <p className="mt-5 font-display text-2xl text-limewash">No temples match those filters</p>
          <p className="mt-2 max-w-sm text-sm text-limewash/55">
            Try widening the region or clearing a tag — the full 2,000+ library will fill these
            gaps soon.
          </p>
          <Button variant="outline" size="sm" className="mt-6" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Load more */}
      {visible < filtered.length ? (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load more temples
          </Button>
        </div>
      ) : null}
    </div>
  );
}
