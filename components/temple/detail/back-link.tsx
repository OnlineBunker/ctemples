import { ArrowLeft } from "lucide-react";
import { TransitionLink } from "@/components/motion/transition-link";
import { slugify } from "@/lib/utils";

/**
 * "Above the hero" back link (docs/06 §3, D8) — a normal link in the content flow, not
 * overlaid on the photo, so it never competes with the hero's own action row for contrast.
 */
export function BackLink({ state }: { state: string }) {
  return (
    <TransitionLink
      href={`/explore?state=${slugify(state)}`}
      type="nav-back"
      className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-label text-ink-muted transition-colors hover:text-magenta"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      Back to {state} temples
    </TransitionLink>
  );
}
