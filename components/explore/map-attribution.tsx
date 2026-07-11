import { cn } from "@/lib/utils";

/**
 * Map-mode attribution caption (docs/07 §2.4) — a license obligation, ships with the
 * map itself, not later. Matching credit lives on /about and in the README.
 */
export function MapAttribution({ className }: { className?: string }) {
  return (
    <p className={cn("font-mono text-[0.62rem] uppercase tracking-label text-ink-muted", className)}>
      Map data ©{" "}
      <a
        href="https://github.com/datameet/maps"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-magenta"
      >
        DataMeet community maps
      </a>{" "}
      (CC BY 4.0)
    </p>
  );
}
