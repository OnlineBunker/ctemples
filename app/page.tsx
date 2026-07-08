import { getFeaturedTemples, getRegionCounts } from "@/lib/temples";
import { Hero } from "@/components/home/hero";
import { RegionExplorer } from "@/components/home/region-explorer";
import { TempleCard } from "@/components/temple/temple-card";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stat } from "@/components/ui/stat";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function HomePage() {
  const featured = getFeaturedTemples();
  const counts = getRegionCounts();

  return (
    <>
      <Hero />

      {/* Mission / thesis */}
      <section className="shell py-24 md:py-32">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow>The idea</Eyebrow>
            <p className="mt-6 font-display text-display-md leading-[1.06] text-limewash">
              Every temple is a passage — gate after gate, from the noise of the street to the
              still lamp at the centre.
            </p>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-limewash/70">
              We film them, walk them, and write them up in full: the history and the myths, the
              architecture and the festivals, the timings and the fees — and what a trip actually
              costs from your city. One place to plan the journey inward.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Featured showcase */}
      <section className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Featured temples"
            title="Where to begin"
            description="A curated first handful, chosen for how differently each one carries the same devotion."
            action={
              <ButtonLink href="/explore" variant="outline" size="sm">
                All temples
              </ButtonLink>
            }
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((temple) => (
            <RevealItem key={temple.id} className="h-full">
              <TempleCard temple={temple} />
            </RevealItem>
          ))}
        </Stagger>
      </section>

      {/* Browse by region */}
      <section className="shell py-24 md:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Browse by region"
            title="One geography of devotion"
            description="Each region carries its own building tradition and its own pigment. Follow a colour into its temples."
          />
        </Reveal>
        <div className="mt-14">
          <RegionExplorer counts={counts} />
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-brass/15 bg-nightstone-900/40">
        <div className="shell py-16">
          <Stagger className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <RevealItem><Stat value="2,000+" label="temples in the library" /></RevealItem>
            <RevealItem><Stat value="28" label="states & territories" /></RevealItem>
            <RevealItem><Stat value="6" label="cultural regions" /></RevealItem>
            <RevealItem><Stat value="100s" label="festivals a year" /></RevealItem>
          </Stagger>
        </div>
      </section>
    </>
  );
}
