import type { Region } from "@/lib/types";
import { REGION_META } from "@/lib/regions";

/**
 * Procedural, deterministic *daytime* scene — on-brand placeholder art wherever a real
 * photo/video will later go. Seeded from a string so it is stable across SSR/hydration
 * and gives each temple (and each gallery frame) a distinct composition. Region tints
 * the ledges + horizon via the pigment box. Pure/serverable — no hooks, no Math.random
 * at runtime. "Modern Utsavam" palette: porcelain sky, turmeric sun, plum silhouette.
 */

// Deterministic string hash -> 32-bit seed.
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

// Small deterministic PRNG.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function towerPath(cx: number, baseY: number, w: number, h: number): string {
  const topY = baseY - h;
  const tw = w * 0.34;
  return `M ${cx - w / 2} ${baseY} Q ${cx - w * 0.44} ${baseY - h * 0.55} ${cx - tw / 2} ${topY} L ${
    cx + tw / 2
  } ${topY} Q ${cx + w * 0.44} ${baseY - h * 0.55} ${cx + w / 2} ${baseY} Z`;
}

export function TempleScene({
  seed,
  region,
  variant = 0,
  className,
  label,
}: {
  seed: string;
  region: Region;
  variant?: number;
  className?: string;
  /** Provide for a meaningful image; omit for purely decorative use. */
  label?: string;
}) {
  const uid = `${seed}-${variant}`.replace(/[^a-z0-9-]/gi, "");
  const rnd = mulberry32(xmur3(uid));
  const pigment = REGION_META[region].pigment;

  const sunX = 200 + rnd() * 800;
  const sunY = 170 + rnd() * 120;
  const mountainous = region === "North" || region === "Northeast";

  const backTowers = Array.from({ length: 3 }, (_, i) => {
    const w = 90 + rnd() * 70;
    return {
      cx: 120 + i * 360 + rnd() * 160,
      w,
      h: 150 + rnd() * 90,
      o: 0.14 + i * 0.05,
    };
  });

  const mainCx = 600 + (rnd() - 0.5) * 260;
  const mainW = 300;
  const mainH = 440;
  const baseY = 700;

  const ledges = Array.from({ length: 6 }, (_, i) => {
    const f = (i + 1) / 7;
    const y = baseY - mainH * f;
    const half = (mainW / 2) * (1 - f) + mainW * 0.17 * f;
    return { y, half: half * 0.92 };
  });

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? "img" : "presentation"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {label ? <title>{label}</title> : null}
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9F1" />
          <stop offset="55%" stopColor="#FDEEDE" />
          <stop offset="100%" stopColor="#FFE9D3" />
        </linearGradient>
        <radialGradient id={`sun-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC300" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FF7A00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4EADF" />
          <stop offset="100%" stopColor="#EADCCB" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect width="1200" height="800" fill={`url(#sky-${uid})`} />

      {/* kolam arcs — faint concentric geometry, echoing the graphic language */}
      {[300, 220, 140].map((r) => (
        <circle
          key={r}
          cx={sunX}
          cy={sunY}
          r={r}
          fill="none"
          stroke={pigment}
          strokeOpacity={0.08}
          strokeWidth={2}
        />
      ))}

      {/* sun glow + disc */}
      <circle cx={sunX} cy={sunY} r={220} fill={`url(#sun-${uid})`} />
      <circle cx={sunX} cy={sunY} r={46} fill="#FFC300" opacity={0.9} />

      {/* distant ridges */}
      {mountainous ? (
        <>
          <path
            d="M0 560 L220 400 L430 540 L640 380 L860 520 L1080 400 L1200 500 L1200 800 L0 800 Z"
            fill={pigment}
            opacity={0.1}
          />
          <path
            d="M0 640 L260 520 L520 620 L780 500 L1020 610 L1200 540 L1200 800 L0 800 Z"
            fill={pigment}
            opacity={0.14}
          />
        </>
      ) : (
        <path d="M0 640 Q300 590 600 630 T1200 620 L1200 800 L0 800 Z" fill={pigment} opacity={0.1} />
      )}

      {/* back temple silhouettes */}
      {backTowers.map((t, i) => (
        <path key={i} d={towerPath(t.cx, 700, t.w, t.h)} fill="#3D0A40" opacity={t.o} />
      ))}

      {/* main temple — plum silhouette */}
      <path d={towerPath(mainCx, baseY, mainW, mainH)} fill="#3D0A40" />
      {ledges.map((l, i) => (
        <line
          key={i}
          x1={mainCx - l.half}
          y1={l.y}
          x2={mainCx + l.half}
          y2={l.y}
          stroke={pigment}
          strokeOpacity={0.55}
          strokeWidth={3}
        />
      ))}
      {/* finial */}
      <path
        d={`M ${mainCx - 26} ${baseY - mainH} L ${mainCx} ${baseY - mainH - 40} L ${mainCx + 26} ${baseY - mainH} Z`}
        fill="#3D0A40"
      />
      <circle cx={mainCx} cy={baseY - mainH - 48} r={7} fill="#E5006D" />
      {/* daylight doorway (light, not glowing) */}
      <path
        d={`M ${mainCx - 26} ${baseY} L ${mainCx - 26} ${baseY - 78} Q ${mainCx} ${baseY - 118} ${mainCx + 26} ${baseY - 78} L ${mainCx + 26} ${baseY} Z`}
        fill="#FFF9F1"
        opacity={0.9}
      />
      <path
        d={`M ${mainCx - 14} ${baseY} L ${mainCx - 14} ${baseY - 60} Q ${mainCx} ${baseY - 88} ${mainCx + 14} ${baseY - 60} L ${mainCx + 14} ${baseY} Z`}
        fill="#E5006D"
        opacity={0.16}
      />

      {/* ground */}
      <rect x="0" y="700" width="1200" height="100" fill={`url(#ground-${uid})`} />
      <line x1="0" y1="704" x2="1200" y2="704" stroke={pigment} strokeOpacity={0.2} strokeWidth={2} />
    </svg>
  );
}
