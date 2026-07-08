import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";

// Transitional inline CTAs; the shared Button primitive is rebuilt in Phase 2.
const ctaPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-temple-red px-6 py-3 font-mono text-[0.72rem] uppercase tracking-label text-canvas transition-colors hover:bg-temple-red-deep";
const ctaSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas px-6 py-3 font-mono text-[0.72rem] uppercase tracking-label text-ink transition-colors hover:bg-canvas-soft";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
      <GopuramMark className="h-14 w-14 text-temple-red/50" />
      <p className="eyebrow mt-8">404 · off the path</p>
      <h1 className="mt-4 font-display text-display-md text-ink">We couldn&apos;t find that page.</h1>
      <p className="mt-4 max-w-md text-ink-muted">
        The temple or page you&apos;re looking for might have moved or never existed. Let&apos;s head
        back to somewhere solid.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className={ctaPrimary}>
          Back to home
        </Link>
        <Link href="/explore" className={ctaSecondary}>
          Explore the map
        </Link>
      </div>
    </div>
  );
}
