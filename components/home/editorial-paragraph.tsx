import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

/** The preface — one editorial statement in a quiet recess chamber (docs/15). */
export function EditorialParagraph() {
  return (
    <Section surface="recess" tight>
      <Reveal>
        <p className="mx-auto max-w-[720px] text-balance text-center font-display text-display-md leading-snug text-plum">
          India holds more than 20,000 temples — from living pilgrimage sites to
          millennia-old stone. CTemples is a field guide to all of them: start with a trip
          idea, a state, or a deity.
        </p>
      </Reveal>
    </Section>
  );
}
