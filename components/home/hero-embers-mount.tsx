"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Heavy three.js bundle is never in the initial payload — loaded on the client only.
const HeroEmbers = dynamic(() => import("./hero-embers"), { ssr: false, loading: () => null });

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Gates the 3D accent: renders only after mount, only when motion is allowed, and only
 * when WebGL is present. Otherwise the hero's SVG scene + glow stand on their own.
 */
export function HeroEmbersMount() {
  const reduce = useReducedMotion();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(webglAvailable());
  }, []);

  if (reduce || !ok) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-70">
      <HeroEmbers />
    </div>
  );
}
