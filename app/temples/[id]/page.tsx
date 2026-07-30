import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTempleById, getTempleIds, getAllTemples } from "@/lib/temples";
import { computeRelatedSections, visibleSections, reachModes } from "@/lib/detail-sections";
import { buildTempleTitle, buildTempleDescription } from "@/lib/seo";
import { getHero } from "@/lib/media";

import Link from "next/link";
import { DetailHero } from "@/components/temple/detail/detail-hero";
import { ReadingProgress } from "@/components/temple/detail/reading-progress";
import { TempleFooterNav } from "@/components/temple/detail/temple-footer-nav";
import { QuickFacts } from "@/components/temple/detail/quick-facts";
import { MobileSectionNav } from "@/components/temple/detail/mobile-section-nav";
import { SectionIndex } from "@/components/temple/detail/section-index";
import { BackToTop } from "@/components/temple/detail/back-to-top";
import { DetailSection } from "@/components/temple/detail/detail-section";
import { Prose } from "@/components/temple/detail/prose";
import { PlanAround } from "@/components/temple/detail/plan-around";
import { BestTime } from "@/components/temple/detail/best-time";
import { HowToReach } from "@/components/temple/detail/how-to-reach";
import { CostTable } from "@/components/temple/detail/cost-table";
import { Gallery } from "@/components/temple/detail/gallery";
import { TempleMap } from "@/components/temple/detail/temple-map";
import { RelatedGrid } from "@/components/temple/detail/related-grid";
import { Nearby } from "@/components/temple/detail/nearby";

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

  const hero = getHero(temple.media);
  return {
    // `{ absolute }` bypasses the root layout's "%s · CTemples" template — docs/12 §2's
    // per-route title is already the complete, ≤60-char `<title>` value.
    title: { absolute: buildTempleTitle(temple.name, temple.city) },
    description: buildTempleDescription(temple),
    alternates: { canonical: `/temples/${temple.id}` },
    openGraph: hero
      ? { type: "article", url: `/temples/${temple.id}`, images: [{ url: hero.url, alt: hero.alt }] }
      : { type: "article", url: `/temples/${temple.id}` },
  };
}

export default async function TemplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const temple = await getTempleById(id);
  if (!temple) notFound();

  const allTemples = await getAllTemples();
  const related = computeRelatedSections(temple, allTemples);
  const sections = visibleSections(temple, related);
  const modes = reachModes(temple);

  // Prev/next wrap around the atlas order (docs/15 §0a — the prototype's closing bar).
  const idx = allTemples.findIndex((t) => t.id === temple.id);
  const prevTemple = allTemples[(idx - 1 + allTemples.length) % allTemples.length];
  const nextTemple = allTemples[(idx + 1) % allTemples.length];

  function meta(sectionId: string) {
    return sections.find((s) => s.id === sectionId) ?? null;
  }

  const whyVisit = meta("why-visit");
  const planAround = meta("plan-around");
  const bestTime = meta("best-time");
  const overview = meta("overview")!; // always present (docs/06 §1 floor)
  const howToReach = meta("how-to-reach");
  const history = meta("history");
  const legends = meta("legends");
  const architecture = meta("architecture");
  const spiritualSignificance = meta("spiritual-significance");
  const cost = meta("cost");
  const gallery = meta("gallery");
  const map = meta("map")!; // always present (docs/06 §1 floor)
  const within100km = meta("within-100km");
  const sameDeity = meta("same-deity");
  const sameStyle = meta("same-style");
  const nearbyAttractions = meta("nearby-attractions");

  return (
    <article>
      <ReadingProgress />
      {/* Prototype breadcrumb row (docs/15 §0a): ← THE ATLAS + region · state · city. */}
      <div className="shell flex flex-wrap items-baseline justify-between gap-3.5 pt-[clamp(20px,4vh,36px)] print:hidden">
        <Link
          href="/explore"
          className="font-mono text-[10.5px] tracking-[.2em] text-ink/60 transition-colors hover:text-magenta"
        >
          ← THE ATLAS
        </Link>
        <p className="font-mono text-[10.5px] tracking-[.2em] text-ink-muted">
          {`${temple.region} INDIA · ${temple.state} · ${temple.city}`.toUpperCase()}
        </p>
      </div>

      <div className="shell">
        <DetailHero temple={temple} />
      </div>

      <div className="shell">
        {/* Quick-facts is `sticky` inside THIS container only — it naturally stops
            sticking once the container's bottom edge (the end of section 5) scrolls past,
            a plain CSS consequence of `position: sticky`'s containing block, no JS needed
            (docs/06 §5 row 2: "sticky within page until section 5 scrolls past"). */}
        <div className="relative mt-10">
          <QuickFacts temple={temple} />

          <div className="mt-8">
            <MobileSectionNav sections={sections} />
          </div>

          <div className="mt-10 space-y-16 md:mt-14 md:space-y-20">
            {whyVisit ? (
              <DetailSection id="why-visit" index={whyVisit.index} eyebrow="Why visit" title={whyVisit.label}>
                <Prose text={temple.whyVisit} className="text-lg md:text-xl" />
              </DetailSection>
            ) : null}

            {planAround && temple.tripDuration ? (
              <DetailSection id="plan-around" index={planAround.index} eyebrow="Plan around" title="Plan around this temple">
                <PlanAround tripDuration={temple.tripDuration} nearest={related.within100km.slice(0, 3)} />
              </DetailSection>
            ) : null}

            {bestTime ? (
              <DetailSection id="best-time" index={bestTime.index} eyebrow="Best time to visit" title={bestTime.label}>
                <BestTime best={temple.bestTimeToVisit} />
              </DetailSection>
            ) : null}
          </div>
        </div>

        {/* Sections 6+ live outside the sticky-quick-facts container above, and inside a
            two-column grid with the section index (D20) as the right rail — the nav's own
            `sticky` element stretches (the grid default) to match this column's full
            height, so it sticks all the way through section 18, not just its own row. */}
        {/* `minmax(0,1fr)`, NOT `1fr`. A bare `1fr` track is `minmax(auto,1fr)`, so its
            minimum is the content's min-content width — one wide child (the gallery rail,
            the cost table) blew the whole column out to 2720px at a 1280px viewport, which
            in turn stretched the map to 1275px tall and magnified every related card. The
            excess was then unreachable because the page clips horizontal overflow. */}
        <div className="mt-16 space-y-16 md:mt-20 md:space-y-20 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-16 lg:space-y-0">
          <div className="space-y-16 md:space-y-20">
            <DetailSection id="overview" index={overview.index} eyebrow="Overview" title={overview.label}>
              <Prose text={temple.overview} />
            </DetailSection>

            {howToReach ? (
              <DetailSection id="how-to-reach" index={howToReach.index} eyebrow="How to reach" title={howToReach.label}>
                <HowToReach modes={modes} />
              </DetailSection>
            ) : null}

            {history ? (
              <DetailSection id="history" index={history.index} eyebrow="History" title={history.label}>
                <Prose text={temple.history} />
              </DetailSection>
            ) : null}

            {legends ? (
              <DetailSection id="legends" index={legends.index} eyebrow="Legends & mythology" title={legends.label}>
                <Prose text={temple.legendsAndMythology} />
              </DetailSection>
            ) : null}

            {architecture ? (
              <DetailSection id="architecture" index={architecture.index} eyebrow="Architecture" title={architecture.label}>
                <Prose text={temple.architecture} />
              </DetailSection>
            ) : null}

            {spiritualSignificance ? (
              <DetailSection
                id="spiritual-significance"
                index={spiritualSignificance.index}
                eyebrow="Spiritual significance"
                title={spiritualSignificance.label}
              >
                <Prose text={temple.spiritualSignificance} />
              </DetailSection>
            ) : null}

            {cost ? (
              <DetailSection id="cost" index={cost.index} eyebrow="Cost to visit" title={cost.label}>
                <CostTable estimates={temple.costEstimates} />
              </DetailSection>
            ) : null}

            {gallery ? (
              <DetailSection id="gallery" index={gallery.index} eyebrow="Gallery" title={gallery.label} className="print:hidden">
                <Gallery media={temple.media} templeName={temple.name} region={temple.region} seed={temple.id} />
              </DetailSection>
            ) : null}

            <DetailSection id="map" index={map.index} eyebrow="Location" title={map.label}>
              <TempleMap temple={temple} />
            </DetailSection>

            {within100km ? (
              <DetailSection id="within-100km" index={within100km.index} eyebrow="Nearby temples" title={within100km.label}>
                {related.within100km.length > 0 ? (
                  <RelatedGrid
                    items={related.within100km.map((r) => ({ temple: r.temple, distanceKm: r.distanceKm }))}
                  />
                ) : (
                  <>
                    <p className="mb-6 text-ink-muted">
                      This temple is fairly remote — the nearest are further afield.
                    </p>
                    <RelatedGrid items={related.remoteFallback.map((t) => ({ temple: t }))} />
                  </>
                )}
              </DetailSection>
            ) : null}

            {sameDeity ? (
              <DetailSection id="same-deity" index={sameDeity.index} eyebrow="Same deity" title={sameDeity.label}>
                <RelatedGrid items={related.sameDeity.map((t) => ({ temple: t }))} />
              </DetailSection>
            ) : null}

            {sameStyle ? (
              <DetailSection id="same-style" index={sameStyle.index} eyebrow="Architecture" title={sameStyle.label}>
                <RelatedGrid items={related.sameStyle.map((t) => ({ temple: t }))} />
              </DetailSection>
            ) : null}

            {nearbyAttractions ? (
              <DetailSection
                id="nearby-attractions"
                index={nearbyAttractions.index}
                eyebrow="Nearby attractions"
                title={nearbyAttractions.label}
              >
                <Nearby items={temple.nearbyAttractions} />
              </DetailSection>
            ) : null}
          </div>

          <SectionIndex sections={sections} />
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <TempleFooterNav
          prev={{ id: prevTemple.id, name: prevTemple.name }}
          next={{ id: nextTemple.id, name: nextTemple.name }}
        />
      </div>

      <BackToTop />
    </article>
  );
}
