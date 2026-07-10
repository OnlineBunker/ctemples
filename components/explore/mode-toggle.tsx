import Link from "next/link";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/** List | Map segmented pill (docs/05 §2). Plain links — every filter round-trips. */
export function ModeToggle({ current }: { current: ParsedExploreParams }) {
  const segClass = (active: boolean) =>
    `flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors ${
      active ? "bg-magenta-soft text-magenta-deep" : "text-ink-muted hover:text-plum"
    }`;
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-canvas p-1"
    >
      <Link
        href={buildExploreHref(current, { view: "list" })}
        aria-current={current.view === "list" ? "true" : undefined}
        className={segClass(current.view === "list")}
      >
        List
      </Link>
      <Link
        href={buildExploreHref(current, { view: "map" })}
        aria-current={current.view === "map" ? "true" : undefined}
        className={segClass(current.view === "map")}
      >
        Map
      </Link>
    </div>
  );
}
