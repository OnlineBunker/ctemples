/** Decorative mandala geometry — used as an ambient/loading motif. Purely ornamental. */
export function MandalaMark({
  className,
  petals = 12,
  strokeWidth = 0.6,
}: {
  className?: string;
  petals?: number;
  strokeWidth?: number;
}) {
  const rings = [48, 40, 30, 20, 11];
  const petalAngles = Array.from({ length: petals }, (_, i) => (360 / petals) * i);
  const spokes = Array.from({ length: petals }, (_, i) => (360 / petals) * i + 360 / petals / 2);

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {rings.map((r) => (
        <circle key={r} cx="50" cy="50" r={r} opacity={0.7} />
      ))}
      {spokes.map((a) => (
        <line
          key={`s-${a}`}
          x1="50"
          y1="50"
          x2="50"
          y2="2"
          opacity={0.35}
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      {petalAngles.map((a) => (
        <path
          key={`p-${a}`}
          d="M50 14 Q57 30 50 44 Q43 30 50 14 Z"
          opacity={0.85}
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none" opacity={0.9} />
    </svg>
  );
}
