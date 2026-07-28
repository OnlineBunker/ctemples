import Image from "next/image";
import { TransitionLink } from "@/components/motion/transition-link";
import { Reveal } from "@/components/motion/reveal";

/**
 * 03 — IN FOCUS (docs/15 §0a): a beige editorial split featuring one temple — tagline as
 * the heading, why-visit prose, DEITY/BUILT/STYLE fact row, "Behold →" — beside a ringed
 * 3:4 arch portrait with a centered mono caption.
 */
export interface FocusData {
  id: string;
  name: string;
  img: string;
  tagline: string;
  why: string;
  deity: string;
  built: string;
  style: string;
  caption: string;
}

export function InFocus({ feat }: { feat: FocusData }) {
  return (
    <section
      className="bg-surface-recess text-ink"
      style={{ padding: "clamp(88px,13vh,150px) clamp(20px,6vw,110px)" }}
    >
      <div
        className="mx-auto grid max-w-[1360px] items-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
          gap: "clamp(40px,6vw,100px)",
        }}
      >
        <div className="flex flex-col" style={{ gap: "clamp(18px,3vh,28px)" }}>
          <Reveal>
            <p className="font-mono text-[11px] font-bold tracking-[.28em] text-magenta">03 — IN FOCUS</p>
          </Reveal>
          <Reveal>
            <h2
              className="text-balance font-display text-ink"
              style={{ fontWeight: 650, fontSize: "clamp(27px,3.5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.12 }}
            >
              {feat.tagline}
            </h2>
          </Reveal>
          <Reveal>
            <p className="max-w-[54ch] text-[15px] leading-[1.7] text-ink/75">{feat.why}</p>
          </Reveal>
          <Reveal>
            <div
              className="grid gap-[18px] border-t border-ink/15 pt-5"
              style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}
            >
              {[
                ["DEITY", feat.deity],
                ["BUILT", feat.built],
                ["STYLE", feat.style],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-[9.5px] tracking-[.2em] text-ink/50">{k}</p>
                  <p className="mt-[5px] text-[13.5px] font-medium">{v}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <TransitionLink
              href={`/temples/${feat.id}`}
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-[26px] py-3.5 text-sm font-semibold text-porcelain transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-magenta motion-reduce:!transform-none"
            >
              Behold →
            </TransitionLink>
          </Reveal>
        </div>

        <Reveal className="relative w-full max-w-[430px] justify-self-center">
          <div
            aria-hidden
            className="absolute rounded-full border border-magenta/40"
            style={{ top: "-6%", right: "-9%", width: "64%", aspectRatio: "1/1" }}
          />
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "3/4",
              borderRadius: "999px 999px 26px 26px",
              boxShadow: "0 34px 90px rgba(36,16,33,.28)",
            }}
          >
            {feat.img ? (
              <Image src={feat.img} alt={feat.name} fill unoptimized sizes="(max-width: 860px) 100vw, 430px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-plum/20" />
            )}
          </div>
          <p className="mt-3.5 text-center font-mono text-[10.5px] uppercase tracking-[.2em] text-ink/50">
            {feat.caption}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
