import Link from "next/link";
import { buildExploreHref, type ParsedExploreParams } from "@/lib/explore-url";

/** ‹ 1 2 3 … N › — real crawlable links, truncated middle (docs/03 §6.9). */
export function Pagination({
  current,
  page,
  totalPages,
}: {
  current: ParsedExploreParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => buildExploreHref(current, { page: p });

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("ellipsis");
    items.push(p);
    prev = p;
  }

  const linkClass = (active: boolean) =>
    `flex h-11 min-w-[2.75rem] items-center justify-center rounded-full px-3 font-mono text-sm ${
      active ? "bg-magenta text-white" : "text-ink hover:bg-magenta-soft hover:text-magenta-deep"
    }`;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        className={`${linkClass(false)} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        ‹
      </Link>
      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-ink-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={linkClass(item === page)}
          >
            {item}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        className={`${linkClass(false)} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
      >
        ›
      </Link>
    </nav>
  );
}
