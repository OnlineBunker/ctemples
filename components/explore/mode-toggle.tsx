import Link from "next/link";
import { buildViewHref, type ParsedExploreParams } from "@/lib/explore-url";

/**
 * List | Map segmented pill (docs/05 §2). Plain links — every filter round-trips.
 *
 * Switching view starts a FRESH browse (`buildViewHref`, owner directive 2026-07-30): the
 * two modes no longer inherit each other's filters, so selecting a state on the map can't
 * silently pre-filter the list. Only the visitor's own location carries over.
 */
export function ModeToggle({ current }: { current: ParsedExploreParams }) {
  const segClass = (active: boolean) =>
    `flex h-9 items-center rounded-full px-4 font-mono text-[10.5px] uppercase tracking-[.14em] transition-colors ${
      active ? "bg-ink text-porcelain" : "text-ink/60 hover:text-magenta"
    }`;
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex items-center gap-1 rounded-full border border-ink/[.18] bg-white/70 p-1"
    >
      <Link
        href={buildViewHref(current, "list")}
        aria-current={current.view === "list" ? "true" : undefined}
        className={segClass(current.view === "list")}
      >
        List
      </Link>
      <Link
        href={buildViewHref(current, "map")}
        aria-current={current.view === "map" ? "true" : undefined}
        className={segClass(current.view === "map")}
      >
        Map
      </Link>
    </div>
  );
}
