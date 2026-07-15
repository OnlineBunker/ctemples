import Link from "next/link";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { DeityIcon } from "@/components/brand/deity-icons";
import { DEITY_ORDER, DEITY_META, type DeityKey } from "@/lib/deities";
import { pluralize } from "@/lib/format";

/**
 * "By deity" — six tiles, icon-led (DESIGN_SYSTEM §1.5). Counts are derived from the
 * data (see lib/deities); a deity with no temples yet still gets a tile (the count line
 * is simply omitted), so the full library scales in without assuming the current set.
 */
export function DeityTiles({ counts }: { counts: Record<DeityKey, number> }) {
  return (
    <section className="shell py-14 md:py-20">
      <Reveal>
        <SectionHeading eyebrow="By deity" title="Find your god" />
      </Reveal>
      <Stagger className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {DEITY_ORDER.map((key) => {
          const meta = DEITY_META[key];
          const count = counts[key];
          return (
            <RevealItem key={key} className="h-full">
              <Link
                href={`/explore?deity=${key}`}
                className="group flex h-full min-h-[9rem] flex-col items-start justify-between rounded-card border border-line bg-canvas p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-magenta/40 hover:shadow-md motion-reduce:!transform-none"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 motion-reduce:!transform-none"
                  style={{ color: meta.accent, backgroundColor: `${meta.accent}14` }}
                >
                  <DeityIcon icon={meta.icon} className="h-7 w-7" animated />
                </span>
                <span className="mt-4">
                  <span className="block font-display text-xl font-semibold text-plum">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.68rem] uppercase tracking-label text-ink-muted">
                    {count > 0 ? pluralize(count, "temple") : "Explore →"}
                  </span>
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </Stagger>
    </section>
  );
}
