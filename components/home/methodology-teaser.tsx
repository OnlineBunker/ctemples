import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { KolamMotif } from "@/components/brand/kolam-motif";

/**
 * Methodology teaser — a short paragraph + "How we choose →" (UX_SPEC §5.7), linking to the
 * permanent /methodology route (D7, docs/13 P8). Reuses the kolam motif as a decorative
 * flourish.
 */
export function MethodologyTeaser() {
  return (
    <section className="shell py-14 md:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-card bg-plum px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-white/10">
            <KolamMotif className="h-full w-full" />
          </div>
          <div className="relative max-w-2xl">
            <Eyebrow className="mb-5 !text-turmeric">How we choose</Eyebrow>
            <h2 className="font-display text-display-md font-semibold text-white">
              A reference you can trust
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Every entry is written to the same template — history, legend, architecture,
              festivals, timings, and what a visit actually costs — and sourced from
              freely-licensed material. No sponsored rankings, no pay-to-feature.
            </p>
            <Link
              href="/methodology"
              className="mt-7 inline-flex items-center gap-1.5 font-semibold text-turmeric transition-colors hover:text-white"
            >
              How we choose
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
