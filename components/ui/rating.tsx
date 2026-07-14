import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRating } from "@/lib/format";

/** Star rating. `tone="overlay"` keeps the number legible on a photo overlay. */
export function Rating({
  value,
  tone = "default",
  className,
}: {
  value: number;
  tone?: "default" | "overlay";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs",
        tone === "overlay" ? "text-canvas/90" : "text-ink-muted",
        className,
      )}
    >
      <Star className="h-3.5 w-3.5 fill-turmeric text-turmeric" aria-hidden />
      <span aria-label={`Rated ${formatRating(value)} out of 5`}>{formatRating(value)}</span>
    </span>
  );
}
