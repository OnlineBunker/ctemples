"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/**
 * Header wishlist link — took the retired PARTNER pill's slot (owner directive 2026-07-30).
 * Carries a live saved count so the page is discoverable the moment anything is saved.
 *
 * The count is `0` until the store hydrates after mount, so the server HTML and the first
 * client render agree (no hydration mismatch); the badge then appears.
 */
export function WishlistLink({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { count } = useWishlist();
  const saved = count > 0;

  return (
    <Link
      href="/wishlist"
      aria-label={saved ? `Your wishlist, ${count} saved` : "Your wishlist"}
      className={cn(
        "inline-flex h-[38px] items-center gap-2 rounded-full border px-[15px] font-mono text-[10.5px] tracking-[.18em] transition-colors",
        tone === "dark"
          ? "border-porcelain/30 text-porcelain hover:border-turmeric hover:text-turmeric"
          : "border-ink/20 text-ink hover:border-magenta hover:text-magenta",
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", saved && "fill-magenta text-magenta")} aria-hidden />
      <span className="hidden sm:inline">SAVED</span>
      {saved ? (
        <span
          className={cn(
            "inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[9.5px] leading-[16px]",
            tone === "dark" ? "bg-porcelain/15 text-porcelain" : "bg-magenta text-porcelain",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
