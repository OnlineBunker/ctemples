import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";

export interface StatePopoverItem {
  id: string;
  name: string;
  city: string;
}

/**
 * A state tile's popover content: top temples + a "See all" link. Rendered inside the
 * shared Popover.Content in `StateStrip` (docs/03 §6.4, D19) — Radix owns positioning,
 * focus, Esc, and outside-click, so this component is pure content, no dialog/wrapper
 * markup of its own. `onNavigate` closes the panel on any link click — delegated onto
 * the wrapping element rather than `Popover.Close asChild` per link, since `TransitionLink`
 * doesn't forward the injected onClick (the same incompatibility search-overlay.tsx works
 * around the same way).
 */
export function StatePopover({
  stateName,
  count,
  seeAllHref,
  items,
  onNavigate,
}: {
  stateName: string;
  count: number;
  seeAllHref: string;
  items: StatePopoverItem[];
  onNavigate: () => void;
}) {
  return (
    <div onClick={onNavigate}>
      <p className="px-2 pb-2 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
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
