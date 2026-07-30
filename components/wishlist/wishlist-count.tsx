"use client";

import { useWishlist } from "@/lib/wishlist";

/** The mono readout beside the wishlist H1 — mirrors Explore's "NN / NN DOORWAYS" cadence. */
export function WishlistCount() {
  const { count, ready } = useWishlist();
  if (!ready) return null;
  return (
    <p className="font-mono text-[11px] tracking-[.24em] text-ink/50" aria-hidden>
      {String(count).padStart(2, "0")} SAVED
    </p>
  );
}
