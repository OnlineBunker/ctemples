import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Divider } from "@/components/brand/divider";
import { MethodologyContent } from "@/components/methodology/methodology-content";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How CTemples researches and writes each entry, the no-fabrication policy, image licensing, and how to suggest a correction.",
};

/**
 * A thin route (docs/02 §1.1, D7) — the same methodology content /about embeds, at its
 * own permanent, citable URL, so it never has to move again once something links to it.
 */
export default function MethodologyPage() {
  return (
    <div className="shell py-20 md:py-28">
      <header className="max-w-3xl">
        <Eyebrow>Methodology</Eyebrow>
        <h1 className="mt-6 font-display text-display-lg leading-[1.02] text-ink">
          How we choose, research, and write.
        </h1>
        <p className="mt-7 text-lg leading-relaxed text-ink/75">
          CTemples wins on trust, not volume — one honest, sourced entry at a time. This page is
          the permanent record of how that entry gets made.
        </p>
      </header>

      <Divider className="my-16 md:my-20" />

      <MethodologyContent />
    </div>
  );
}
