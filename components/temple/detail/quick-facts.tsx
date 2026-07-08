import type { Temple } from "@/lib/types";

/** The compact facts strip under the hero: built / dynasty / style / deity. */
export function QuickFacts({ temple }: { temple: Temple }) {
  const items = [
    { label: "Built", value: temple.quickFacts.built },
    { label: "Dynasty", value: temple.quickFacts.dynasty },
    { label: "Style", value: temple.quickFacts.architecturalStyle },
    { label: "Presiding deity", value: temple.quickFacts.presidingDeity },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-brass/15 bg-brass/10 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-nightstone-900/85 p-5">
          <dt className="eyebrow text-limewash/45">{item.label}</dt>
          <dd className="mt-2 font-display text-lg leading-snug text-limewash">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
