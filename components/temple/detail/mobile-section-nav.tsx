import { ChevronDown } from "lucide-react";
import { padCount } from "@/lib/format";
import type { VisibleSection } from "@/lib/detail-sections";

/**
 * Mobile's collapsed "On this page" disclosure (docs/06 §4) — sits between the quick-facts
 * bar and section 3. A native `<details>`, no JS needed for the open/close behavior itself.
 */
export function MobileSectionNav({ sections }: { sections: VisibleSection[] }) {
  if (sections.length === 0) return null;
  return (
    <details className="group rounded-card border border-line print:hidden lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 font-mono text-xs uppercase tracking-label text-plum marker:content-none [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="border-t border-line px-5 py-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block py-2 text-sm text-ink-muted hover:text-magenta">
              {padCount(s.index)} — {s.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
