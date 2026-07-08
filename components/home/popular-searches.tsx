import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Popular searches — six chips linking to pre-canned Explore URLs (UX_SPEC §1.7).
 * The alias-aware `?q=` routes light up fully once Explore search ships (Phase 3/6);
 * the URLs are valid now. No section H2 — this is a thin chip row.
 */
const CHIPS: { label: string; href: string }[] = [
  { label: "Shiva temples", href: "/explore?view=list&deity=shiva" },
  { label: "Tamil Nadu", href: "/explore?view=map&state=tamil-nadu" },
  { label: "UNESCO sites", href: "/explore?view=list&tag=unesco-world-heritage" },
  { label: "Pilgrimage", href: "/explore?view=map&preset=pilgrimage" },
  { label: "Himalayan temples", href: "/explore?view=list&q=himalayan" },
  { label: "Living temples", href: "/explore?view=list&q=living" },
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
