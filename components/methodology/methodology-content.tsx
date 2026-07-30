import Link from "next/link";

/**
 * The methodology content shared verbatim between /about and /methodology (D7:
 * "/methodology ships as a thin route... same content the About page embeds", docs/12 §6:
 * research/sourcing, the no-fabrication policy, the licensing note, and how to suggest a
 * correction). Extracted into its own component so there is exactly one copy of this prose
 * to keep accurate — not two that can quietly drift apart.
 */
export function MethodologyContent() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl text-ink">How entries are researched</h2>
        <p className="mt-3 leading-relaxed text-ink-muted">
          Every entry on CTemples is hand-written from freely-licensed, publicly available
          sources — Wikipedia, Wikidata, and similar public record — never auto-generated filler
          or scraped listicle text. As the library grows past this first handful of temples,
          later entries follow the same standard: researched and written before they ship, not
          the reverse.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink">The no-fabrication policy</h2>
        <p className="mt-3 leading-relaxed text-ink-muted">
          We&apos;d rather leave a field blank than guess. Timings, entry fees, and travel costs
          are omitted — never invented — when we don&apos;t have a reliable source for them.
          Dates, fees, and distances are checked against a source before they ship, and every
          entry is screened for banned marketing phrases and duplicated passages against the
          rest of the library. Popularity never appears as a fabricated visitor count — the only
          visitor figure we&apos;d ever show is one with a cited source.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink">Something wrong, or missing?</h2>
        <p className="mt-3 leading-relaxed text-ink-muted">
          If a fact looks out of date, or a temple you know deserves a place here,{" "}
          <Link href="/suggest" className="font-semibold text-magenta-deep hover:text-magenta-deep hover:underline">
            suggest a correction or a temple
          </Link>
          . Submissions aren&apos;t wired to a backend yet, so nothing is sent while this is a
          prototype — the form tells you so before you type.
        </p>
      </div>

      <p className="rounded-xl border border-line bg-canvas-soft p-5 font-mono text-[0.66rem] uppercase leading-relaxed tracking-label text-ink-muted">
        Note · CTemples is currently a frontend prototype. Temple content shown here is
        placeholder, written to the same standard the real library will follow.
      </p>

      <p className="rounded-xl border border-line bg-canvas-soft p-5 font-mono text-[0.66rem] uppercase leading-relaxed tracking-label text-ink-muted">
        Image licensing · Photography shown across the site is sourced from Wikimedia Commons
        under its various free licenses. Per-image credit lines are on the way; until then, this
        note stands as the site-wide attribution.
      </p>

      <p className="rounded-xl border border-line bg-canvas-soft p-5 font-mono text-[0.66rem] uppercase leading-relaxed tracking-label text-ink-muted">
        Map data ©{" "}
        <a
          href="https://github.com/datameet/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line-strong underline-offset-2 hover:text-ink"
        >
          DataMeet community maps
        </a>{" "}
        (CC BY 4.0). State boundaries in Explore&rsquo;s map mode are simplified from this
        dataset.
      </p>
    </div>
  );
}
