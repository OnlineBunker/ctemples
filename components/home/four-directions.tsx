import Image from "next/image";
import { TransitionLink } from "@/components/motion/transition-link";
import { Reveal } from "@/components/motion/reveal";

/**
 * 02 — FOUR DIRECTIONS (docs/15 §0a): four expanding arch columns on deep plum, one per
 * cardinal region, each fronted by that region's most-photographed temple. Hovering (or
 * keyboard-focusing) a column grows it; the image zooms. Pure CSS flex transition.
 */
export interface DirectionItem {
  name: string;
  id: string;
  img: string;
  sub: string;
}

export function FourDirections({ items }: { items: DirectionItem[] }) {
  if (items.length === 0) return null;
  return (
    <section
      className="bg-surface-sanctum text-porcelain"
      style={{ padding: "clamp(88px,13vh,150px) clamp(20px,6vw,110px)" }}
    >
      <Reveal>
        <p className="mb-4 font-mono text-[11px] font-bold tracking-[.28em] text-turmeric">02 — FOUR DIRECTIONS</p>
        <h2
          className="max-w-[16ch] text-balance font-display font-bold text-porcelain"
          style={{
            fontSize: "clamp(34px,5.4vw,76px)",
            letterSpacing: "-.03em",
            lineHeight: 1.04,
            marginBottom: "clamp(30px,6vh,64px)",
          }}
        >
          Devotion has a geography.
        </h2>
      </Reveal>
      <Reveal>
        <div className="flex flex-wrap gap-3.5">
          {items.map((r) => (
            <TransitionLink
              key={r.name}
              href={`/temples/${r.id}`}
              aria-label={`${r.name} India — ${r.sub}`}
              className="group relative flex-[1_1_220px] overflow-hidden bg-ink outline-none transition-all duration-[850ms] ease-threshold hover:flex-[2.3_1_220px] focus-visible:flex-[2.3_1_220px] focus-visible:ring-2 focus-visible:ring-turmeric motion-reduce:!transition-none"
              style={{ height: "clamp(320px,54vh,560px)", borderRadius: "999px 999px 26px 26px" }}
            >
              {r.img ? (
                <Image
                  src={r.img}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 40vw"
                  // `unoptimized`: hotlinked Wikimedia source — see photo-with-fallback.tsx.
                  unoptimized
                  className="object-cover transition-transform duration-[1100ms] ease-threshold group-hover:scale-[1.06] motion-reduce:!transform-none"
                />
              ) : null}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg,rgba(61,10,64,.24),transparent 34%,transparent 58%,rgba(36,16,33,.85))",
                }}
              />
              <div className="pointer-events-none absolute bottom-[18px] left-5 right-5">
                <p className="font-display font-bold" style={{ fontSize: "clamp(20px,2vw,27px)", letterSpacing: "-.01em" }}>
                  {r.name}
                </p>
                <p className="mt-[5px] font-mono text-[10px] tracking-[.18em] text-turmeric">{r.sub}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
