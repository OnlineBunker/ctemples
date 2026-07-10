import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getTempleById } from "@/lib/temples";
import type { Region } from "@/lib/types";
import { TripIdeaCard, type TripIdea } from "./trip-idea-card";

/**
 * Trip ideas — the primary CTA surface (UX_SPEC §1.5). Curated, editorial presets (not
 * derived from the dataset), each linking to a pre-canned Explore URL. Representative
 * photos are pulled from a temple in the data; a missing one falls back to TempleScene.
 */
type Preset = Omit<TripIdea, "image" | "region" | "seed"> & {
  representativeId: string;
  fallbackRegion: Region;
};

const PRESETS: Preset[] = [
  {
    title: "South India Temple Trail",
    description: "Granite gopurams and living Dravidian ritual, from Hampi to the coast.",
    meta: "6 temples · 7 days · ~800 km",
    // Region is inexpressible in the URL contract (docs/02 §4) — the card's own subject,
    // Dravidian temple tradition, is the filter instead (docs/04 §4).
    href: "/explore?tag=dravidian",
    representativeId: "virupaksha-temple-hampi",
    fallbackRegion: "South",
  },
  {
    title: "Shiva Temples of the Himalayas",
    description: "High-altitude Jyotirlingas and shrines wrapped in mountain weather.",
    meta: "4 temples · 7 days · ~900 km",
    href: "/explore?deity=shiva",
    representativeId: "kedarnath-temple",
    fallbackRegion: "North",
  },
  {
    title: "UNESCO World Heritage Temples",
    description: "The stone masterworks — Konark, Thanjavur, Hampi — recognised worldwide.",
    meta: "6 temples · pan-India",
    href: "/explore?tag=unesco-world-heritage",
    representativeId: "konark-sun-temple",
    fallbackRegion: "East",
  },
  {
    title: "Living Temples of Tamil Nadu",
    description: "Everyday darshan in the great temple-towns of the far south.",
    meta: "5 temples · 4 days · ~450 km",
    href: "/explore?state=tamil-nadu",
    representativeId: "brihadeeswarar-temple",
    fallbackRegion: "South",
  },
];

export async function TripIdeas() {
  const ideas: TripIdea[] = await Promise.all(
    PRESETS.map(async (preset) => {
      const temple = await getTempleById(preset.representativeId);
      return {
        title: preset.title,
        description: preset.description,
        meta: preset.meta,
        href: preset.href,
        image: temple?.heroImage ?? "",
        region: temple?.region ?? preset.fallbackRegion,
        seed: preset.representativeId,
      };
    }),
  );

  return (
    <section className="shell py-14 md:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Trip ideas"
          title="Where will you go?"
          description="Curated routes to start planning — pick a thread and follow it into the map."
        />
      </Reveal>
      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ideas.map((idea, i) => (
          <RevealItem key={idea.title} className="h-full">
            <TripIdeaCard idea={idea} priority={i === 0} />
          </RevealItem>
        ))}
      </Stagger>
    </section>
  );
}
