"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";

/**
 * Route-level error boundary. Without one, any runtime error in a page or its data path drops
 * the visitor on Next's unstyled default error screen — no chrome, no way forward, and in
 * production only the words "Application error". This keeps the header/footer (it renders
 * inside the root layout), matches the 404's treatment, and — crucially — offers a real
 * recovery path: `reset()` re-renders the segment without a full page reload, so a transient
 * failure costs the visitor nothing.
 *
 * Deliberately does NOT print `error.message`: a server-side message can leak internals, and
 * Next already redacts it in production. `digest` is shown instead, because it's the only
 * thing that lets a support conversation find the matching server log.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Real telemetry (Sentry et al.) hooks in here. Until then, keep it in the console rather
    // than swallowing it silently — a boundary that hides errors is worse than none.
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <section className="relative flex min-h-[80svh] w-full flex-col items-center justify-center overflow-hidden bg-surface-deep px-5 py-[70px] text-center text-porcelain">
      <div className="relative flex flex-col items-center">
        <GopuramMark className="h-[52px] w-[46px] text-magenta" strokeWidth={1.4} />
        <p className="mt-[26px] font-mono text-[10.5px] tracking-[.3em] text-turmeric">
          SOMETHING GAVE WAY
        </p>
        <h1
          className="mt-3.5 text-balance font-display font-bold text-porcelain"
          style={{ fontSize: "clamp(30px,5vw,54px)", letterSpacing: "-.03em" }}
        >
          This doorway jammed.
        </h1>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-porcelain/60">
          Not your fault — something on our side failed while building this page. Trying again
          usually clears it.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex rounded-full bg-magenta px-[26px] py-3.5 text-sm font-semibold text-porcelain transition-[background-color,transform] duration-[250ms] hover:-translate-y-0.5 hover:bg-coral motion-reduce:!transform-none"
          >
            Try again
          </button>
          <Link
            href="/explore"
            className="inline-flex rounded-full border-[1.5px] border-porcelain/35 px-[26px] py-3.5 text-sm font-semibold text-porcelain transition-colors duration-[250ms] hover:border-turmeric hover:text-turmeric"
          >
            Explore the atlas
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-[9.5px] uppercase tracking-[.2em] text-porcelain/35">
            Reference {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  );
}
