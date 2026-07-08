import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";
import { cn } from "@/lib/utils";

export interface StatePopoverItem {
  id: string;
  name: string;
  city: string;
}

/**
 * Presentational popover for a state tile: top temples + a "See all" link. Behaviour
 * (focus, Esc, outside-click, Tab-trap) lives in StateTile, which also measures the
 * tile's actual on-screen position to pick `align` — so the popover stays on-screen at
 * every breakpoint (200%-zoom floor), not just the ones where index parity happens to
 * match the grid's column count.
 */
export function StatePopover({
  id,
  labelId,
  stateName,
  count,
  seeAllHref,
  items,
  align,
}: {
  id: string;
  labelId: string;
  stateName: string;
  count: number;
  seeAllHref: string;
  items: StatePopoverItem[];
  align: "left" | "right";
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-labelledby={labelId}
      className={cn(
        "absolute top-full z-40 mt-3 w-64 max-w-[calc(100vw-2.5rem)] rounded-card border border-line bg-canvas p-3 text-left shadow-lg",
        align === "left" ? "left-0" : "right-0",
      )}
    >
      <p
        id={labelId}
        className="px-2 pb-2 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted"
      >
        {stateName} · {count === 1 ? "1 temple" : `${count} temples`}
      </p>
      <ul className="space-y-0.5">
        {items.length > 0 ? (
          items.map((t) => (
            <li key={t.id}>
              <TransitionLink
                href={`/temples/${t.id}`}
                className="block rounded-lg px-2 py-2 text-sm text-plum transition-colors hover:bg-magenta-soft focus:bg-magenta-soft focus:outline-none"
              >
                <span className="font-medium">{t.name}</span>
                <span className="block text-xs text-ink-muted">{t.city}</span>
              </TransitionLink>
            </li>
          ))
        ) : (
          <li className="px-2 py-2 text-sm text-ink-muted">No temples yet.</li>
        )}
      </ul>
      <Link
        href={seeAllHref}
        className="mt-1 flex items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-magenta transition-colors hover:bg-magenta-soft focus:bg-magenta-soft focus:outline-none"
      >
        See all in {stateName}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
