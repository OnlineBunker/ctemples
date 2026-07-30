import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { queryTemples } from "@/lib/temples";
import { STATE_REGION, REGION_META } from "@/lib/regions";
import { slugify } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import { TempleCard, summaryToCard } from "@/components/ui/temple-card";
import { TempleImage } from "@/components/media/temple-image";
import { ButtonLink } from "@/components/ui/button";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { ThresholdDivider } from "@/components/brand/threshold-divider";

const STATE_BY_SLUG = new Map(Object.keys(STATE_REGION).map((name) => [slugify(name), name]));

export function generateStaticParams() {
  return Array.from(STATE_BY_SLUG.keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = STATE_BY_SLUG.get(slug);
  if (!name) return {};
  return {
    title: `Temples in ${name}`,
    description: `Temples of ${name}, ${REGION_META[STATE_REGION[name]].label} India — history, architecture, festivals, and how to visit.`,
    alternates: { canonical: `/states/${slug}` },
  };
}

/**
 * /states/[slug] — a state gazetteer entry (docs/15 §2G). A portal-arch portrait of the
 * state's top temple, region context, data-derived count, and its temples as unified
 * cards. A zero/low-temple state degrades to an honest contribution funnel (thin-landing
 * guard) rather than a dead end — no fabricated content.
 */
export default async function StatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = STATE_BY_SLUG.get(slug);
  if (!name) notFound();
  const region = STATE_REGION[name];
  const { items, total } = await queryTemples({ state: slug, perPage: 60 });
  const hero = items[0] ? summaryToCard(items[0]) : null;
  const heroImg = hero?.hero?.url;

  return (
    <>
      <Section surface="canvas">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,52%)_minmax(0,48%)] lg:gap-12">
          <div>
            <Link href="/states" className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-magenta">
              ← All states
            </Link>
            <p className="mt-4 font-mono text-label uppercase tracking-label text-ink-muted">
              {REGION_META[region].label} India
            </p>
            <h1 className="mt-2 font-display text-display-xl font-semibold text-plum">{name}</h1>
            <p className="mt-3 font-mono text-label uppercase tracking-label text-magenta-deep">
              {total === 0 ? "Documented soon" : total === 1 ? "1 temple documented" : `${total} temples documented`}
            </p>
            <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-ink-muted">{REGION_META[region].blurb}</p>
            {total > 0 ? (
              <div className="mt-8">
                <ButtonLink href={`/explore?state=${slug}`} variant="primary" size="lg">
                  See all in Explore
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              </div>
            ) : null}
          </div>

          <div className="relative order-first lg:order-last">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-2.5 -z-0 rounded-portal border border-turmeric/25 sm:-inset-3"
            />
            {heroImg ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-portal">
                <TempleImage
                  src={heroImg}
                  alt={hero?.hero?.alt ?? name}
                  region={region}
                  seed={hero?.id ?? slug}
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-portal ring-1 ring-inset ring-turmeric/30" />
              </div>
            ) : (
              <div className="relative flex aspect-[4/3] items-center justify-center rounded-portal border border-line bg-surface-recess text-magenta/40">
                <GopuramMark className="h-24 w-24" />
              </div>
            )}
          </div>
        </div>
      </Section>

      <ThresholdDivider from="canvas" to="recess" />

      {total > 0 ? (
        <Section surface="recess">
          <h2 className="font-display text-display-md font-semibold text-plum">Temples in {name}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <TempleCard key={t.id} temple={summaryToCard(t)} />
            ))}
          </div>
        </Section>
      ) : (
        <Section surface="recess">
          <div className="mx-auto max-w-xl text-center">
            <GopuramMark className="mx-auto h-16 w-16 text-magenta/50" />
            <h2 className="mt-6 font-display text-display-md font-semibold text-plum">
              No temples documented in {name} yet
            </h2>
            <p className="mt-4 text-body-lg leading-relaxed text-ink-muted">
              We&apos;re building CTemples state by state. Know a temple in {name} that belongs here?
              Help us add it.
            </p>
            <div className="mt-8">
              <ButtonLink href={`/suggest?state=${slug}`} variant="primary" size="lg">
                Suggest a temple
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
