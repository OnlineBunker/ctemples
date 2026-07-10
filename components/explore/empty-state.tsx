import Link from "next/link";
import { Search } from "lucide-react";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/** Empty-state copy templates (docs/05 §5, docs/03 §6.10) — never a hardcoded number. */
export function EmptyState({ current }: { current: ParsedExploreParams }) {
  const hasQuery = current.q.length > 0;
  const title = hasQuery ? `No temples match '${current.q}'.` : "No temples match your filters.";
  const body = hasQuery
    ? "Try a deity (Shiva, Vishnu, Devi), a state, or a city."
    : "Try removing a filter or broadening your search.";
  // "Clear search" only clears q/exact (its label's promise, keeping any state/deity/tag
  // filters intact); "Reset all filters" (the no-query case) clears everything.
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
    <div
      role="status"
      className="mt-10 flex flex-col items-center rounded-card bg-magenta-soft px-6 py-16 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas">
        <Search className="h-6 w-6 text-magenta" aria-hidden />
      </span>
      <p className="mt-5 font-display text-2xl font-semibold text-plum">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{body}</p>
      <Link
        href={resetHref}
        className="mt-6 inline-flex h-11 items-center rounded-full border border-line-strong bg-canvas px-6 text-sm font-semibold text-plum transition-colors hover:border-magenta hover:text-magenta"
      >
        {hasQuery ? "Clear search" : "Reset all filters"}
      </Link>
    </div>
  );
}
