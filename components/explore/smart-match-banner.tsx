import Link from "next/link";
import { X } from "lucide-react";
import { DEITY_META } from "@/lib/deities";
import { SEARCH_ALIASES } from "@/lib/search-aliases";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * Alias-hit banner (docs/05 §3.4). Dismissing navigates to the same URL + `exact=1`
 * (docs/02 §3.1) — a plain link, so it works without client JS and keeps the state in
 * the URL rather than hidden component state.
 */
export function SmartMatchBanner({
  current,
  matchedAliases,
}: {
  current: ParsedExploreParams;
  matchedAliases: string[];
}) {
  const alias = matchedAliases[0];
  if (!alias) return null;

  // matchedAliases carries the alias KEY that fired (e.g. "mahadev"), not the canonical
  // deity — resolve it back through the same alias map that produced the match.
  const canonicalKey = SEARCH_ALIASES[alias];
  const label = canonicalKey ? DEITY_META[canonicalKey].label : alias;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 flex items-center justify-between gap-3 rounded-card bg-magenta-soft px-4 py-3 text-sm text-magenta-deep"
    >
      <span>
        Showing {label} results for &lsquo;{current.q}&rsquo;
      </span>
      <Link
        href={buildExploreHref(current, { exact: true })}
        aria-label="Dismiss smart match and search exactly what I typed"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-magenta/15"
      >
        <X className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
