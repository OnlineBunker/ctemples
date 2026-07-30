import type { Metadata } from "next";
import Link from "next/link";
import { getStateCounts } from "@/lib/temples";
import { STATE_REGION, REGION_ORDER, REGION_META } from "@/lib/regions";
import { slugify } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import { ThresholdDivider } from "@/components/brand/threshold-divider";

export const metadata: Metadata = {
  title: "States & regions",
  description:
    "Browse India's temples by state within each of the six cultural regions — a gazetteer of sacred geography.",
  alternates: { canonical: "/states" },
};

/**
 * /states — the gazetteer index (docs/15 §2G). Every one of the 36 states/UTs grouped by
 * its region (STATE_REGION, a fixed geographic fact); counts derive from the data, and a
 * zero-temple state is shown honestly ("—") rather than hidden or faked.
 */
export default async function StatesIndexPage() {
  const counts = await getStateCounts();
  const countBySlug = new Map(counts.map((c) => [c.slug, c.count]));
  const total = counts.reduce((n, c) => n + c.count, 0);

  const byRegion = REGION_ORDER.map((region) => ({
    region,
    states: Object.keys(STATE_REGION)
      .filter((name) => STATE_REGION[name] === region)
      .map((name) => ({ name, slug: slugify(name), count: countBySlug.get(slugify(name)) ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <>
      <Section surface="canvas">
        <p className="eyebrow">The gazetteer</p>
        <h1 className="mt-4 font-display text-display-xl font-semibold text-plum">States &amp; regions</h1>
        <p className="mt-5 max-w-2xl text-body-lg text-ink-muted">
          India&apos;s temples, placed. Browse by state within each of the six cultural regions —{" "}
          {total.toLocaleString("en-IN")} documented so far, with more arriving.
        </p>
      </Section>
      <ThresholdDivider from="canvas" to="recess" />
      <Section surface="recess">
        <div className="space-y-14">
          {byRegion.map((group) => (
            <div key={group.region}>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: REGION_META[group.region].pigment }}
                />
                <h2 className="font-display text-display-md font-semibold text-plum">
                  {REGION_META[group.region].label} India
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-body-sm text-ink-muted">{REGION_META[group.region].blurb}</p>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.states.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/states/${s.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-card border border-line bg-canvas px-4 py-3 transition-colors hover:border-magenta/40 hover:bg-magenta-soft/40"
                    >
                      <span className="font-display text-title-md font-semibold leading-tight text-plum transition-colors group-hover:text-magenta">
                        {s.name}
                      </span>
                      <span className="shrink-0 font-mono text-label-sm uppercase tracking-label text-ink-muted">
                        {s.count || "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
