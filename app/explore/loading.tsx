import { GopuramMark } from "@/components/brand/gopuram-mark";

/**
 * Suspense boundary for `/explore` — the only route rendered on demand (every other page is
 * prerendered). Without it, clicking through to Explore leaves the previous page frozen with no
 * acknowledgement while the query runs, which reads as a broken link on a slow connection.
 *
 * Deliberately NOT a shimmering skeleton: docs/08 bans skeleton shimmer for server-rendered
 * content, because a fake layout that then reflows into a different real one is worse than an
 * honest wait. This mirrors the real page's padding and heading position exactly, so when the
 * results arrive nothing jumps — only the placeholder line is replaced.
 */
export default function ExploreLoading() {
  return (
    <div style={{ padding: "clamp(44px,7vh,80px) clamp(20px,6vw,110px) clamp(70px,10vh,110px)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="font-display font-bold leading-none tracking-[-.03em] text-ink"
          style={{ fontSize: "clamp(42px,6.6vw,92px)" }}
        >
          The atlas.
        </h1>
        <p className="font-mono text-[11px] tracking-[.24em] text-ink-muted" aria-hidden>
          LOADING
        </p>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="mt-24 flex flex-col items-center gap-4 pb-16 text-center"
      >
        <GopuramMark className="h-12 w-11 text-magenta/40" strokeWidth={1.2} />
        <p className="font-mono text-[10.5px] uppercase tracking-[.2em] text-ink-muted">
          Gathering the atlas…
        </p>
      </div>
    </div>
  );
}
