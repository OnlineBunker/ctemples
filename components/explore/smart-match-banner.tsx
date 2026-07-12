import Link from "next/link";
import { X } from "lucide-react";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * Alias-hit banner (docs/05 §3.4). Dismissing navigates to the same URL + `exact=1`
 * (docs/02 §3.1) — a plain link, so it works without client JS and keeps the state in
 * the URL rather than hidden component state. `label` is pre-resolved server-side by
 * the seam (`resolveAliasLabel`, docs/10 §4) — this component has no alias/deity lookup
 * of its own, since a temple/place-type alias target needs the full temple list to
 * resolve a real name, which only the seam holds (D25).
 */
export function SmartMatchBanner({
  current,
  label,
}: {
  current: ParsedExploreParams;
  label: string | null;
}) {
  if (!label) return null;

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
