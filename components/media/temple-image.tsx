import { TempleScene } from "./temple-scene";
import { PhotoWithFallback } from "./photo-with-fallback";
import { cn } from "@/lib/utils";
import type { Region } from "@/lib/types";

/**
 * The one image primitive. Renders `next/image` when a real URL is present (with blur-up
 * and error fallback), otherwise the on-brand procedural scene. Always fills a parent
 * that is `relative overflow-hidden` with a fixed aspect ratio — so there is never any
 * layout shift as media loads. Pass `priority` on the LCP hero image only.
 */
export function TempleImage({
  src,
  alt,
  region,
  seed,
  variant = 0,
  priority = false,
  sizes = "100vw",
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
  if (!src) {
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
    <PhotoWithFallback
      src={src}
      alt={alt}
      region={region}
      seed={seed}
      variant={variant}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
