import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Popular searches — six chips linking to pre-canned Explore URLs (docs/04 §6). List
 * mode is the default (D4), so bare facet params are canonical — no `?view=`/`?preset=`.
 */
const CHIPS: { label: string; href: string }[] = [
  { label: "Shiva temples", href: "/explore?deity=shiva" },
  { label: "Tamil Nadu", href: "/explore?state=tamil-nadu" },
  { label: "UNESCO sites", href: "/explore?tag=unesco-world-heritage" },
  { label: "Pilgrimage", href: "/explore?tag=pilgrimage" },
  { label: "Himalayan temples", href: "/explore?q=himalayan" },
  { label: "Living temples", href: "/explore?q=living" },
];

export function PopularSearches() {
  return (
    <section className="shell py-10">
      <Reveal>
        <Eyebrow className="mb-5">Popular searches</Eyebrow>
        <ul className="flex flex-wrap gap-3">
          {CHIPS.map((chip) => (
            <li key={chip.label}>
              <Link
                href={chip.href}
                className="inline-flex items-center rounded-full border border-transparent bg-turmeric-soft px-4 py-2 text-sm font-medium text-plum transition-colors hover:border-magenta hover:bg-magenta-soft hover:text-magenta-deep"
              >
                {chip.label}
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
