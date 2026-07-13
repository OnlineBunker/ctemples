import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Divider } from "@/components/brand/divider";
import { Stat } from "@/components/ui/stat";
import { MethodologyContent } from "@/components/methodology/methodology-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "CTemples is a comprehensive encyclopedia of India's temples — history, architecture, and practical travel, all in one place.",
};

// Transitional inline CTAs; the shared Button primitive is rebuilt in Phase 2.
const ctaPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-temple-red px-6 py-3 font-mono text-[0.72rem] uppercase tracking-label text-canvas transition-colors hover:bg-temple-red-deep";
const ctaSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas px-6 py-3 font-mono text-[0.72rem] uppercase tracking-label text-ink transition-colors hover:bg-canvas-soft";

const APPROACH = [
  {
    title: "Documented in depth",
    body: "History, legend, architecture, and spiritual significance, researched and written with care — the kind of depth a plaque never has room for.",
  },
  {
    title: "Photographed on site",
    body: "Every temple gets real imagery — the towers at dawn, the ritual, the crowd, the quiet — so you know what you're travelling to see.",
  },
  {
    title: "Made to travel",
    body: "Timings, fees, festivals, how to get there, and honest cost bands from real hub cities. Everything you need to actually go.",
  },
];

export default function AboutPage() {
  return (
    <div className="shell py-20 md:py-28">
      <header className="max-w-3xl">
        <Eyebrow>About CTemples</Eyebrow>
        <h1 className="mt-6 font-display text-display-lg leading-[1.02] text-ink">
          A guide to the temples of India, built to be explored.
        </h1>
        <p className="mt-7 text-lg leading-relaxed text-ink/75">
          India has tens of thousands of temples, and most of them are documented — if at all — in
          scattered fragments: a blurry photo here, a Wikipedia stub there, a travel forum thread
          from 2013. CTemples brings them into one place, treated with the seriousness of the
          architecture itself.
        </p>
      </header>

      <Divider className="my-16 md:my-20" />

      <section>
        <Reveal>
          <h2 className="max-w-3xl font-display text-display-md leading-tight text-ink">
            The plan is simple, if not small: cover every temple worth the journey — and cover it
            properly.
          </h2>
        </Reveal>
        <Stagger className="mt-14 grid gap-8 md:grid-cols-3">
          {APPROACH.map((item, i) => (
            <RevealItem key={item.title}>
              <div className="border-t border-line pt-6">
                <span className="font-mono text-xs text-temple-red">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl text-ink">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      <section className="mt-24 rounded-card border border-line bg-canvas-soft p-8 md:p-12">
        <Reveal>
          <Eyebrow tone="warm">The library</Eyebrow>
          <p className="mt-5 max-w-3xl font-display text-2xl leading-snug text-ink md:text-3xl">
            2,000+ temples across 28 states are on the way. This build is the frame that content
            drops into — designed first, so the temples arrive somewhere worthy of them.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <RevealItem><Stat value="2,000+" label="temples planned" /></RevealItem>
          <RevealItem><Stat value="28" label="states & territories" /></RevealItem>
          <RevealItem><Stat value="6" label="cultural regions" /></RevealItem>
          <RevealItem><Stat value="1" label="place to find them" /></RevealItem>
        </Stagger>
      </section>

      <section className="mt-24 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-display-md text-ink">Start exploring</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            A first handful of temples is live now — enough to feel how the whole thing will work.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/explore" className={ctaPrimary}>
            Explore temples
          </Link>
          <Link href="/contact" className={ctaSecondary}>
            Partner with us
          </Link>
        </div>
      </section>

      <div className="mt-16">
        <Eyebrow>How we choose</Eyebrow>
        <div className="mt-7">
          <MethodologyContent />
        </div>
      </div>
    </div>
  );
}
