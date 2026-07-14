import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Partner with us",
  description:
    "Bring a temple, a collection, or a region to CTemples. A frontend prototype — the form is not yet connected to a backend.",
};

const PERKS = [
  "A filmed, written, and mapped page for each temple you steward",
  "Placement in region and deity browsing, and in featured showcases",
  "Practical travel info kept accurate — timings, fees, festivals, costs",
];

export default function ContactPage() {
  return (
    <div className="shell py-20 md:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Eyebrow>Partner with us</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg leading-[1.03] text-ink">
            Bring a temple to CTemples.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">
            We work with temple trusts, tourism boards, operators, and photographers to document India&apos;s
            temples properly — and to make them easy to find and easy to visit.
          </p>
          <ul className="mt-10 space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex gap-3 text-ink-muted">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" />
                <span className="leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
