"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { REGION_ORDER, REGION_META } from "@/lib/regions";
import { pluralize } from "@/lib/format";
import type { Region } from "@/lib/types";
import { cn } from "@/lib/utils";

const C = 150;
const R_IN = 56;
const R_OUT = 134;

function point(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
}

function wedgePath(index: number): string {
  const a0 = index * 60;
  const a1 = a0 + 60;
  const [x0, y0] = point(R_OUT, a0);
  const [x1, y1] = point(R_OUT, a1);
  const [x2, y2] = point(R_IN, a1);
  const [x3, y3] = point(R_IN, a0);
  return `M${x0} ${y0} A ${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`;
}

export function RegionExplorer({ counts }: { counts: Record<Region, number> }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<Region | null>(null);
  const total = REGION_ORDER.reduce((sum, r) => sum + counts[r], 0);
  const active = hovered ? REGION_META[hovered] : null;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      {/* Mandala */}
      <div className="relative mx-auto aspect-square w-full max-w-[380px]">
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          {/* slow decorative outer ring */}
          <g className="origin-center animate-mandala-spin">
            <circle
              cx="150"
              cy="150"
              r="144"
              fill="none"
              stroke="#C9A24B"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="2 8"
            />
          </g>
          {REGION_ORDER.map((region, i) => {
            const isOn = hovered === region;
            return (
              <path
                key={region}
                d={wedgePath(i)}
                fill={REGION_META[region].pigment}
                fillOpacity={isOn ? 0.92 : 0.16}
                stroke="#0c0a18"
                strokeWidth="2"
                className="cursor-pointer transition-[fill-opacity] duration-300"
                onMouseEnter={() => setHovered(region)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/explore?region=${region}`)}
              />
            );
          })}
          <circle cx="150" cy="150" r={R_IN - 4} fill="#12102a" stroke="#C9A24B" strokeOpacity="0.25" />
        </svg>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-4xl text-limewash">
            {active ? counts[active.region] : total}
          </span>
          <span className="mt-1 max-w-[7rem] font-mono text-[0.6rem] uppercase tracking-label text-limewash/55">
            {active ? `in ${active.label}` : "temples mapped"}
          </span>
        </div>
      </div>

      {/* Legend / links */}
      <div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {REGION_ORDER.map((region) => {
            const meta = REGION_META[region];
            const isOn = hovered === region;
            return (
              <li key={region}>
                <Link
                  href={`/explore?region=${region}`}
                  onMouseEnter={() => setHovered(region)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(region)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                    isOn ? "border-brass/40 bg-brass/[0.06]" : "border-transparent hover:bg-limewash/[0.04]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: meta.pigment }}
                    />
                    <span className="text-sm text-limewash">{meta.label}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-label text-limewash/45">
                    {counts[region]}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 min-h-[3rem] max-w-md text-sm leading-relaxed text-limewash/65">
          {active ? active.blurb : `Six regions, ${pluralize(total, "temple")} in this preview — and a full library of 2,000+ to follow. Pick a region to begin.`}
        </p>
      </div>
    </div>
  );
}
