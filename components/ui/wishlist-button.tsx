"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/**
 * Save-to-wishlist heart. A real `<button>` rendered as a SIBLING of the card's link, never
 * inside it — a button nested in an anchor is invalid HTML and would make the whole card
 * un-clickable for keyboard and screen-reader users.
 *
 * `variant="card"` is the Explore-card affordance (a labelled row beneath the card);
 * `variant="icon"` is the bare heart for tight surfaces.
 */
export function WishlistButton({
  id,
  name,
  variant = "card",
  className,
}: {
  id: string;
  name: string;
  variant?: "card" | "icon";
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const saved = has(id);

  const label = saved ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={saved}
        aria-label={label}
        // Holds the CardRepel drift still while the pointer is on this control (see
        // components/ui/card-repel.tsx). Without it the heart is a retreating target:
        // the card moves AWAY from the cursor, so aiming at the heart pushes it away.
        data-repel-freeze
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          saved
            ? "border-magenta/40 bg-magenta-soft text-magenta"
            : "border-ink/15 text-ink-muted hover:border-magenta/40 hover:text-magenta",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-magenta")} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={saved}
      aria-label={label}
      // Holds the CardRepel drift still while the pointer is on this control (see
      // components/ui/card-repel.tsx). This is the variant the Explore cards use, and it is
      // where the owner hit the problem: the card drifts AWAY from the cursor, so aiming at
      // the heart pushed it away. Freezing makes it a stationary target.
      data-repel-freeze
      // The hit area was also genuinely small for a primary action. `py-1 pr-2` gave roughly
      // 13x13 of icon plus a sliver of padding; this brings it to the 44px WCAG 2.5.8 floor
      // without changing the visual, via a negative-margin bleed that keeps the layout intact.
      className={cn(
        "group/save -my-2 -ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full py-1 pl-2 pr-2 font-mono text-[9.5px] uppercase tracking-[.16em] transition-colors",
        saved ? "text-magenta" : "text-ink-muted hover:text-magenta",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-[13px] w-[13px] transition-transform duration-300 ease-threshold group-hover/save:scale-110 motion-reduce:!transform-none",
          saved && "fill-magenta",
        )}
        aria-hidden
      />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
