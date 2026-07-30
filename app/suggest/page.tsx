import type { Metadata } from "next";
import { SuggestForm } from "@/components/suggest/suggest-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { STATE_REGION } from "@/lib/regions";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Suggest a temple",
  description:
    "Know a temple CTemples should cover, or spot something out of date? Tell us — a frontend prototype, the form is not yet connected to a backend.",
};

const WHAT_TO_INCLUDE = [
  "The temple's name and where it is",
  "What makes it worth a page — history, architecture, a festival, a view",
  "Anything you think we've got wrong on an existing entry",
];

/**
 * `?state=<slug>` arrives from a state page with nothing documented yet ("help us add one →").
 * That link promised context and delivered a blank form — the visitor had to retype the very
 * state they had just come from. The slug is resolved back to its real display name here (never
 * echoed raw, so a crafted slug can't inject arbitrary text into the page or the field) and used
 * to prefill Location and to acknowledge where they came from.
 */
const STATE_BY_SLUG = new Map(Object.keys(STATE_REGION).map((name) => [slugify(name), name]));

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawState = Array.isArray(sp.state) ? sp.state[0] : sp.state;
  const stateName = rawState ? (STATE_BY_SLUG.get(rawState.trim()) ?? null) : null;

  return (
    <div className="shell py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Eyebrow>Suggest a temple</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg leading-[1.03] text-ink">
            {stateName ? `Know a temple in ${stateName}?` : "Know a temple we're missing?"}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">
            {stateName ? (
              <>
                We haven&apos;t documented {stateName} yet. CTemples grows one researched entry at a
                time, so a pointer from someone who knows the place is exactly how it starts.
              </>
            ) : (
              <>
                CTemples grows one researched entry at a time. If there&apos;s a temple that
                deserves a page — or you&apos;ve spotted something out of date on one that already
                has one — tell us about it.
              </>
            )}
          </p>
          <ul className="mt-10 space-y-4">
            {WHAT_TO_INCLUDE.map((item) => (
              <li key={item} className="flex gap-3 text-ink-muted">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <SuggestForm defaultLocation={stateName ?? ""} />
      </div>
    </div>
  );
}
