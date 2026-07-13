import type { Metadata } from "next";
import { SuggestForm } from "@/components/suggest/suggest-form";
import { Eyebrow } from "@/components/ui/eyebrow";

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

export default function SuggestPage() {
  return (
    <div className="shell py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Eyebrow>Suggest a temple</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg leading-[1.03] text-ink">
            Know a temple we&apos;re missing?
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">
            CTemples grows one researched entry at a time. If there&apos;s a temple that deserves
            a page — or you&apos;ve spotted something out of date on one that already has one —
            tell us about it.
          </p>
          <ul className="mt-10 space-y-4">
            {WHAT_TO_INCLUDE.map((item) => (
              <li key={item} className="flex gap-3 text-ink-muted">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-temple-red" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <SuggestForm />
      </div>
    </div>
  );
}
