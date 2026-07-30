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
   * Placeholder photos are hotlinked from Wikimedia's CDN, which serves pre-sized thumbnails and
   * is built for direct browser traffic. Serving them unoptimized (browser -> Wikimedia) avoids
   * rate-limiting the Next image optimizer's proxy. Real, self-hosted images will flow through
   * the optimizer normally.
   *
   * DO NOT REMOVE THIS WITHOUT REPLACING THE SOURCE URLS FIRST. An audit pass deleted this line
   * on the strength of a *warm-cache* measurement (homepage 4.33MB -> 0.28MB, LCP 19.4s -> 1.5s)
   * and it made the live site unusable — first paint went from seconds to minutes. The warm number
   * was real but it measured the wrong thing:
   *   - Routing a remote image through the optimizer means Next must fetch the full-size original
   *     from Wikimedia and AVIF-encode it, per width, on demand. AVIF encoding is CPU-seconds per
   *     image; a page with a dozen photos serializes into minutes of first-request latency.
   *   - That cost is NOT paid once. The optimizer cache lives under `.next`, so every rebuild and
   *     every fresh deploy discards it and the next visitor pays the whole bill again.
   *   - Wikimedia throttles server-side hotlinking far more aggressively than browser traffic,
   *     which is the *original* reason this bypass exists.
   * It is also a decision already recorded in PROJECT_CONTEXT.md ("the deliberate
   * rate-limit-avoidance decision") — reversing it was a product call, not a perf fix.
   *
   * The bandwidth win is genuine and still worth having, but the correct route is to size the
   * SOURCE urls (Wikimedia's /thumb/<file>/<N>px- path serves arbitrary widths) so the browser
   * fetches a small file directly, with no proxy in the path. Until that lands, unoptimized wins.
   */
  const unoptimized = src.startsWith("https://upload.wikimedia.org");
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
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
