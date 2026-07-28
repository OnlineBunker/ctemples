import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/** Atlas empty state (docs/15 §0a): gopuram glyph + "No doorways match." Never a hardcoded number. */
export function EmptyState({ current }: { current: ParsedExploreParams }) {
  const hasQuery = current.q.length > 0;
  // "Clear search" only clears q/exact (its label's promise, keeping any state/deity/tag
  // filters intact); "Clear filters" (the no-query case) clears everything.
  const resetHref = hasQuery
    ? buildExploreHref(current, { q: "", exact: false, page: 1 })
    : buildExploreHref(current, {
        view: "list",
        q: "",
        exact: false,
        state: undefined,
        deity: undefined,
        tags: [],
        sort: "rating",
        page: 1,
      });

  return (
    <div role="status" className="px-5 pb-16 pt-24 text-center">
      <GopuramMark className="mx-auto h-12 w-11 text-ink/30" strokeWidth={1.2} />
      <p className="mt-5 font-display text-[26px] font-semibold text-ink">No doorways match.</p>
      <p className="mt-2 text-[14.5px] text-ink/60">
        {hasQuery
          ? `Nothing here for '${current.q}' — try a deity, a state, or a city.`
          : "Try a different filter — or clear everything."}
      </p>
      <Link
        href={resetHref}
        className="mt-[22px] inline-flex items-center rounded-full bg-ink px-[22px] py-3 font-mono text-[11px] tracking-[.18em] text-porcelain transition-colors hover:bg-magenta"
      >
        {hasQuery ? "CLEAR SEARCH" : "CLEAR FILTERS"}
      </Link>
    </div>
  );
}
