import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTempleById, getTempleIds, getRelatedTemples } from "@/lib/temples";
import { DetailHero } from "@/components/temple/detail/detail-hero";
import { QuickFacts } from "@/components/temple/detail/quick-facts";
import { DetailSection } from "@/components/temple/detail/detail-section";
import { Prose } from "@/components/temple/detail/prose";
import { FactRows } from "@/components/temple/detail/fact-rows";
import { CostTable } from "@/components/temple/detail/cost-table";
import { Gallery } from "@/components/temple/detail/gallery";
import { TempleMap } from "@/components/temple/detail/temple-map";
import { BestTime } from "@/components/temple/detail/best-time";
import { Nearby } from "@/components/temple/detail/nearby";
import { TempleCard } from "@/components/temple/temple-card";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";

// Static generation for every temple route — the data is static at build time.
export async function generateStaticParams() {
  return (await getTempleIds()).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const temple = await getTempleById(id);
  if (!temple) return { title: "Temple not found" };
  return {
    title: temple.name,
    description: temple.overview.slice(0, 155),
  };
}

export default async function TemplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const temple = await getTempleById(id);
  if (!temple) notFound();
  const related = await getRelatedTemples(temple, 3);

  return (
    <article>
      <DetailHero temple={temple} />

      <div className="shell">
        {/* Quick facts strip overlaps the hero's lower edge */}
        <div className="relative z-10 -mt-10">
          <QuickFacts temple={temple} />
        </div>

        {/* Overview lead */}
        <div className="mt-16 md:mt-24">
          <Reveal>
            <Prose
              text={temple.overview}
              className="max-w-3xl text-xl leading-relaxed text-limewash/90 md:text-2xl md:leading-relaxed"
            />
          </Reveal>
        </div>

        <div className="mt-20 space-y-20 md:mt-24 md:space-y-28">
          <DetailSection id="history" index="01" eyebrow="History" title="How it came to be">
            <Prose text={temple.history} />
          </DetailSection>

          <DetailSection id="legends" index="02" eyebrow="Legends & mythology" title="The stories it carries">
            <Prose text={temple.legendsAndMythology} />
          </DetailSection>

          <DetailSection id="architecture" index="03" eyebrow="Architecture" title="How it was built">
            <Prose text={temple.architecture} />
          </DetailSection>

          <DetailSection id="significance" index="04" eyebrow="Spiritual significance" title="Why it matters">
            <Prose text={temple.spiritualSignificance} />
          </DetailSection>

          <DetailSection id="best-time" index="05" eyebrow="Best time to visit" title="When to go">
            <BestTime best={temple.bestTimeToVisit} />
          </DetailSection>

          <DetailSection id="visit" index="06" eyebrow="Timings & entry" title="Before you arrive">
            <div className="grid gap-10 md:grid-cols-2">
              <FactRows
                rows={[
                  { label: "Opening", value: temple.timings.opening },
                  { label: "Closing", value: temple.timings.closing },
                  ...(temple.timings.notes ? [{ label: "Good to know", value: temple.timings.notes }] : []),
                ]}
              />
              <FactRows
                rows={[
                  { label: "Entry · Indian", value: temple.entryFee.indian },
                  ...(temple.entryFee.foreign ? [{ label: "Entry · Foreign", value: temple.entryFee.foreign }] : []),
                  ...(temple.entryFee.cameraOrPhoneFee
                    ? [{ label: "Camera / phone", value: temple.entryFee.cameraOrPhoneFee }]
                    : []),
                ]}
              />
            </div>
          </DetailSection>

          <DetailSection id="reach" index="07" eyebrow="How to reach" title="Getting there">
            <FactRows
              rows={[
                { label: "By air", value: temple.howToReach.byAir },
                { label: "By train", value: temple.howToReach.byTrain },
                { label: "By road", value: temple.howToReach.byRoad },
              ]}
            />
          </DetailSection>

          <DetailSection id="cost" index="08" eyebrow="Cost to visit" title="What a trip costs">
            <CostTable estimates={temple.costEstimates} />
          </DetailSection>

          <DetailSection id="gallery" index="09" eyebrow="Gallery" title="In pictures">
            <Gallery
              images={temple.gallery}
              templeName={temple.name}
              region={temple.region}
              seed={temple.id}
            />
          </DetailSection>

          <DetailSection id="nearby" index="10" eyebrow="Nearby" title="Also worth your time">
            <Nearby items={temple.nearbyAttractions} />
          </DetailSection>

          <DetailSection id="map" index="11" eyebrow="Location" title="On the map">
            <TempleMap temple={temple} />
          </DetailSection>
        </div>
      </div>

      {related.length ? (
        <section className="shell mt-24 md:mt-32">
          <Reveal>
            <Eyebrow>Related temples</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-limewash">Continue the journey</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <TempleCard key={t.id} temple={t} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
