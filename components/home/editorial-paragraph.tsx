import { Reveal } from "@/components/motion/reveal";

/** Two-sentence editorial framing, centered under the hero (UX_SPEC §1.4). */
export function EditorialParagraph() {
  return (
    <section className="shell py-12 md:py-16">
      <Reveal>
        <p className="mx-auto max-w-[640px] text-balance text-center font-display text-2xl leading-snug text-plum sm:text-[1.75rem]">
          India holds more than 20,000 temples — from living pilgrimage sites to
          millennia-old stone. CTemples is a curated encyclopedia: start with a trip idea,
          a state, or a deity.
        </p>
      </Reveal>
    </section>
  );
}
