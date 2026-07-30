import type { Metadata } from "next";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { WishlistCount } from "@/components/wishlist/wishlist-count";

export const metadata: Metadata = {
  title: "Your wishlist",
  description:
    "The temples you've saved — your own shortlist of doorways to visit, kept on this device.",
};

/**
 * /wishlist — where saved temples live (owner directive 2026-07-30, replacing the retired
 * partner page). A thin server shell so the route keeps real metadata; the grid itself must be
 * a client component because saves are held in the visitor's own `localStorage`.
 *
 * Voice and layout follow Explore's atlas page: the same page padding, a Bricolage display H1
 * with a Space Mono readout opposite it, and the same card grid — so it reads as another room
 * in the same building rather than a bolt-on.
 */
export default function WishlistPage() {
  return (
    <div style={{ padding: "clamp(44px,7vh,80px) clamp(20px,6vw,110px) clamp(70px,10vh,110px)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="font-display font-bold leading-none tracking-[-.03em] text-ink"
          style={{ fontSize: "clamp(42px,6.6vw,92px)" }}
        >
          Your doorways.
        </h1>
        <WishlistCount />
      </div>
      <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink/70">
        Every temple you save waits here. Kept on this device — no account, nothing shared.
      </p>

      <WishlistGrid />
    </div>
  );
}
