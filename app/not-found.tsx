import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";

/**
 * 404 — the prototype's "off the path" screen (docs/15 §0a; the single sanctioned outlined
 * mega-numeral per §3). A dark ink band with a giant transparent-stroke "404" behind a
 * centered column: gopuram mark, gold kicker, "This doorway doesn't exist." headline, prose,
 * and two pills (magenta home / outline explore). Header + footer come from the root layout.
 */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] w-full flex-col items-center justify-center overflow-hidden bg-surface-deep px-5 py-[70px] text-center text-porcelain">
      {/* Giant outlined 404 behind the content — the sanctioned 404 mega-numeral (docs/15 §3). */}
      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display font-extrabold"
        style={{
          fontSize: "clamp(200px,42vw,560px)",
          lineHeight: 1,
          letterSpacing: "-.04em",
          WebkitTextStroke: "2px rgba(251,246,240,.28)",
          color: "transparent",
        }}
      >
        404
      </p>

      <div className="relative flex flex-col items-center">
        <GopuramMark className="h-[52px] w-[46px] text-magenta" strokeWidth={1.4} />
        <p className="mt-[26px] font-mono text-[10.5px] tracking-[.3em] text-turmeric">404 · OFF THE PATH</p>
        <h1
          className="mt-3.5 text-balance font-display font-bold text-porcelain"
          style={{ fontSize: "clamp(30px,5vw,54px)", letterSpacing: "-.03em" }}
        >
          This doorway doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.6] text-porcelain/60">
          The temple or page you&apos;re looking for might have moved or never existed. Let&apos;s head
          back to somewhere solid.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full bg-magenta px-[26px] py-3.5 text-sm font-semibold text-porcelain transition-[background-color,transform] duration-[250ms] hover:-translate-y-0.5 hover:bg-coral motion-reduce:!transform-none"
          >
            Back to home
          </Link>
          <Link
            href="/explore"
            className="inline-flex rounded-full border-[1.5px] border-porcelain/35 px-[26px] py-3.5 text-sm font-semibold text-porcelain transition-colors duration-[250ms] hover:border-turmeric hover:text-turmeric"
          >
            Explore the atlas
          </Link>
        </div>
      </div>
    </section>
  );
}
