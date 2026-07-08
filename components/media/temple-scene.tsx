import type { Region } from "@/lib/types";
import { REGION_META } from "@/lib/regions";

/**
 * Procedural, deterministic dusk scene used as on-brand placeholder art wherever a real
 * photo/video will later go. Seeded from a string so it is stable across SSR/hydration
 * and gives each temple (and each gallery frame) a distinct composition. Region tints
 * the sky via the pigment box. Pure/serverable — no hooks, no Math.random at runtime.
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

  const sunX = 180 + rnd() * 840;
  const sunY = 300 + rnd() * 120;
  const mountainous = region === "North" || region === "Northeast";

  const stars = Array.from({ length: 26 }, () => ({
    x: rnd() * 1200,
    y: rnd() * 360,
    r: 0.6 + rnd() * 1.3,
    o: 0.3 + rnd() * 0.5,
  }));

  const backTowers = Array.from({ length: 3 }, (_, i) => {
    const w = 90 + rnd() * 70;
    return {
      cx: 120 + i * 360 + rnd() * 160,
      w,
      h: 150 + rnd() * 90,
      o: 0.35 + i * 0.12,
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

  const diyas = Array.from({ length: 3 }, () => ({
    x: mainCx + (rnd() - 0.5) * 420,
    y: 720 + rnd() * 40,
  }));

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
          <stop offset="0%" stopColor="#0A0816" />
          <stop offset="48%" stopColor="#17122b" />
          <stop offset="76%" stopColor={pigment} stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0c0a18" />
        </linearGradient>
        <radialGradient id={`sun-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7D9A0" />
          <stop offset="35%" stopColor="#F2A93B" />
          <stop offset="70%" stopColor="#E1462F" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E1462F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sanctum-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#E1462F" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E1462F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0814" />
          <stop offset="100%" stopColor="#06040d" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect width="1200" height="800" fill={`url(#sky-${uid})`} />

      {/* stars */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F4EEE2" opacity={s.o} />
      ))}

      {/* sun / moon glow + disc */}
      <circle cx={sunX} cy={sunY} r={260} fill={`url(#sun-${uid})`} />
      <circle cx={sunX} cy={sunY} r={54} fill="#F7D9A0" opacity={0.92} />

      {/* distant ridges */}
      {mountainous ? (
        <>
          <path d={`M0 560 L220 400 L430 540 L640 380 L860 520 L1080 400 L1200 500 L1200 800 L0 800 Z`} fill="#141026" opacity={0.85} />
          <path d={`M0 640 L260 520 L520 620 L780 500 L1020 610 L1200 540 L1200 800 L0 800 Z`} fill="#0f0b20" opacity={0.9} />
        </>
      ) : (
        <path d={`M0 640 Q300 590 600 630 T1200 620 L1200 800 L0 800 Z`} fill="#120e24" opacity={0.85} />
      )}

      {/* back temple silhouettes */}
      {backTowers.map((t, i) => (
        <path key={i} d={towerPath(t.cx, 700, t.w, t.h)} fill="#0b0817" opacity={t.o} />
      ))}

      {/* sanctum glow behind the main tower */}
      <circle cx={mainCx} cy={640} r={260} fill={`url(#sanctum-${uid})`} />

      {/* main temple */}
      <path d={towerPath(mainCx, baseY, mainW, mainH)} fill="#080610" />
      {ledges.map((l, i) => (
        <line
          key={i}
          x1={mainCx - l.half}
          y1={l.y}
          x2={mainCx + l.half}
          y2={l.y}
          stroke={pigment}
          strokeOpacity={0.22}
          strokeWidth={2}
        />
      ))}
      {/* finial */}
      <path d={`M ${mainCx - 26} ${baseY - mainH} L ${mainCx} ${baseY - mainH - 40} L ${mainCx + 26} ${baseY - mainH} Z`} fill="#080610" />
      <circle cx={mainCx} cy={baseY - mainH - 48} r={7} fill={pigment} opacity={0.8} />
      {/* lit doorway */}
      <path
        d={`M ${mainCx - 26} ${baseY} L ${mainCx - 26} ${baseY - 78} Q ${mainCx} ${baseY - 118} ${mainCx + 26} ${baseY - 78} L ${mainCx + 26} ${baseY} Z`}
        fill={`url(#sanctum-${uid})`}
      />
      <path
        d={`M ${mainCx - 14} ${baseY} L ${mainCx - 14} ${baseY - 60} Q ${mainCx} ${baseY - 88} ${mainCx + 14} ${baseY - 60} L ${mainCx + 14} ${baseY} Z`}
        fill="#F7D9A0"
        opacity={0.85}
      />

      {/* ground */}
      <rect x="0" y="700" width="1200" height="100" fill={`url(#ground-${uid})`} />

      {/* diyas */}
      {diyas.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={22} fill="#F2A93B" opacity={0.28} />
          <circle cx={d.x} cy={d.y} r={4.5} fill="#F7D9A0" />
        </g>
      ))}
    </svg>
  );
}
