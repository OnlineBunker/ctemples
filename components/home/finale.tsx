import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

/**
 * Finale (docs/15 §0a): ink band with the outlined-type strip of temple names, the
 * closing line "Every temple is a door.", and a CTA back to the index.
 *
 * The outlined frieze is a seamless marquee (docs/08 §5#10, Amendment B): the name list is
 * rendered twice and the track translates 0 → −50%, so the loop is seamless. Duration scales
 * with the name count to keep a steady pace. Killed under reduced motion — it then reads as
 * the identical static outlined frieze.
 */
export function Finale({ names }: { names: string[] }) {
  // Seamless-loop pace: proportional to how many names are in one copy.
  const durationS = Math.max(40, Math.round(names.length * 4.5));
  return (
    <section className="overflow-hidden bg-surface-deep text-porcelain" style={{ paddingTop: "clamp(76px,11vh,130px)" }}>
      <div aria-hidden className="overflow-hidden">
        <div
          className="animate-marquee flex w-max items-center whitespace-nowrap"
          style={{ gap: "clamp(30px,4vw,60px)", animationDuration: `${durationS}s` }}
        >
          {names.concat(names).map((m, i) => (
            <span
              key={`${m}-${i}`}
              className="inline-flex items-center whitespace-nowrap font-display font-extrabold"
              style={{ gap: "clamp(30px,4vw,60px)", fontSize: "clamp(44px,7vw,110px)", letterSpacing: "-.02em" }}
            >
              <span className="otl">{m}</span>
              <span className="text-turmeric" style={{ fontSize: ".5em" }}>
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 text-center" style={{ padding: "clamp(64px,10vh,120px) 20px" }}>
        <Reveal>
          <p className="mb-[18px] font-mono text-[10.5px] tracking-[.3em] text-porcelain/50">THE REST IS PILGRIMAGE</p>
          <h2
            className="text-balance font-display font-bold text-porcelain"
            style={{ fontSize: "clamp(30px,4.6vw,64px)", letterSpacing: "-.03em" }}
          >
            Every temple is a door.
          </h2>
          <div className="mt-[30px]">
            <Link
              href="#index"
              className="inline-flex items-center gap-2.5 rounded-full bg-magenta px-7 py-[15px] text-[14.5px] font-semibold text-porcelain transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-coral motion-reduce:!transform-none"
            >
              Choose your doorway ↑
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
