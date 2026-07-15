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
  // Placeholder photos are hotlinked from Wikimedia's CDN, which serves pre-sized
  // thumbnails and is built for direct browser traffic. Serving them unoptimized
  // (browser -> Wikimedia) avoids rate-limiting the Next image optimizer's proxy.
  // Real, self-hosted images will flow through the optimizer normally.
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
