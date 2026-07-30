"use client";

import Image from "next/image";
import { useState } from "react";
import { TempleScene } from "./temple-scene";
import { shimmer } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Region } from "@/lib/types";

/** Real-photo path: next/image with blur-up, falling back to the on-brand scene on error. */
export function PhotoWithFallback({
  src,
  alt,
  region,
  seed,
  variant = 0,
  priority = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  region: Region;
  seed: string;
  variant?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  /**
   * Wikimedia images used to bypass the optimizer ("avoids rate-limiting the proxy"). Measured,
   * that was the single worst performance decision in the app: Wikimedia serves ONE fixed width
   * and returns HTTP 400 for any other (verified at 400/640/828/1080px), so every surface got the
   * full 1280px file — index rows downloaded 1280x1109 JPEGs to render 52x66px thumbnails, and
   * the homepage shipped **4.33 MB of images**, giving a 19.4 s LCP on a 4x-CPU / 1.6 Mbps
   * profile.
   *
   * Through the optimizer the same source becomes 1,155 bytes of AVIF at w=64 and 72 KB at
   * w=640 — 377x and 6x smaller. `next.config.mjs` already allowlists the host and prefers
   * AVIF/WebP, and optimized results are cached, so the proxy concern is a cold-start cost paid
   * once per size rather than on every visit by every visitor.
   */
  if (failed) {
    return (
      <TempleScene
        seed={seed}
        region={region}
        variant={variant}
        label={alt}
        className={cn("absolute inset-0 h-full w-full", className)}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // next/image's `priority` alone only removes lazy-loading + emits a preload
      // link — it does NOT set the `fetchpriority` attribute browsers use to jump
      // the network queue (a real, separate opt-in Next.js requires). Without it,
      // the LCP hero image competed for bandwidth with fonts/scripts on an equal
      // footing despite being flagged as the page's single most important image.
      fetchPriority={priority ? "high" : undefined}
      placeholder="blur"
      blurDataURL={shimmer(24, 16)}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
