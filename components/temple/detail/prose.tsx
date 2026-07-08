import { cn } from "@/lib/utils";

/** Renders \n\n-separated long-form fields (history, legends, …) as paragraphs. */
export function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className={cn("prose-temple", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
