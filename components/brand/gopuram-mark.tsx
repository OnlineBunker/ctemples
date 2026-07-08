/** Line-drawn gopuram — the CTemples logomark and section-divider motif. */
export function GopuramMark({
  className,
  title,
  strokeWidth = 1.6,
}: {
  className?: string;
  title?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 56"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* tapering tower silhouette */}
      <path d="M4 52 L18 12 L30 12 L44 52 Z" />
      {/* tier ledges */}
      <line x1="6.8" y1="44" x2="41.2" y2="44" />
      <line x1="9.6" y1="36" x2="38.4" y2="36" />
      <line x1="12.4" y1="28" x2="35.6" y2="28" />
      <line x1="15.2" y1="20" x2="32.8" y2="20" />
      {/* arched doorway */}
      <path d="M20 52 L20 43 Q24 38.5 28 43 L28 52" />
      {/* kalasha finial */}
      <path d="M18 12 L24 4.5 L30 12" />
      <line x1="24" y1="12" x2="24" y2="6.4" />
      <circle cx="24" cy="5" r="1.7" />
      {/* ground line */}
      <line x1="2.5" y1="52" x2="45.5" y2="52" />
    </svg>
  );
}
