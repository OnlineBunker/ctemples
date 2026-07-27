import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { KolamMotif } from "@/components/brand/kolam-motif";
import { Section } from "@/components/ui/section";

/**
 * Methodology teaser — the inner sanctum (docs/15 §2B): a full `surface-sanctum` plum
 * band that flows seamlessly into the plum footer. Links to the permanent /methodology
 * route (D7).
 */
export function MethodologyTeaser() {
  return (
    <Section surface="sanctum">
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 text-white/10">
          <KolamMotif className="h-full w-full" />
        </div>
        <Reveal>
          <div className="relative max-w-2xl">
            <p className="font-mono text-label uppercase tracking-label text-turmeric">How we choose</p>
            <h2 className="mt-5 font-display text-display-md font-semibold">A reference you can trust</h2>
            <p className="mt-5 text-body-lg leading-relaxed text-porcelain/80">
              Every entry is written to the same template — history, legend, architecture,
              festivals, timings, and what a visit actually costs — and sourced from
              freely-licensed material. No sponsored rankings, no pay-to-feature.
            </p>
            <Link
              href="/methodology"
              className="mt-7 inline-flex items-center gap-1.5 font-semibold text-turmeric transition-colors hover:text-porcelain"
            >
              How we choose
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
