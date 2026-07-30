import type { Metadata } from "next";
import Link from "next/link";
import { getDeityCounts } from "@/lib/temples";
import { DEITY_ORDER, DEITY_META } from "@/lib/deities";
import { DeityIcon } from "@/components/brand/deity-icons";
import { pluralize } from "@/lib/format";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Deities",
  description:
    "Browse India's temples by the deity they honour — Shiva, Vishnu, Devi, Ganesha, Murugan, and Hanuman.",
  alternates: { canonical: "/deities" },
};

/** /deities — the pantheon index (docs/15 §2G). Six locked deities (D11), icon-led. */
export default async function DeitiesIndexPage() {
  const counts = await getDeityCounts();
  return (
    <Section surface="canvas">
      <p className="eyebrow">The pantheon</p>
      <h1 className="mt-4 font-display text-display-xl font-semibold text-plum">Find your god</h1>
      <p className="mt-5 max-w-2xl text-body-lg text-ink-muted">
        Six presiding deities anchor the great temple traditions of India. Follow one to the
        temples that honour it.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {DEITY_ORDER.map((key) => {
          const meta = DEITY_META[key];
          const count = counts[key];
          return (
            <Link
              key={key}
              href={`/deities/${key}`}
              className="group flex h-full min-h-[9rem] flex-col items-start justify-between rounded-card border border-line bg-canvas p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-magenta/40 hover:shadow-md motion-reduce:!transform-none"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 motion-reduce:!transform-none"
                style={{ color: meta.accent, backgroundColor: `${meta.accent}14` }}
              >
                <DeityIcon icon={meta.icon} className="h-7 w-7" animated />
              </span>
              <span className="mt-4">
                <span className="block font-display text-title-lg font-semibold text-plum transition-colors group-hover:text-magenta">
                  {meta.label}
                </span>
                <span className="mt-0.5 block font-mono text-label uppercase tracking-label text-ink-muted">
                  {count > 0 ? pluralize(count, "temple") : "Explore →"}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
