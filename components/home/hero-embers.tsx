"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The one 3D accent: a field of warm diya embers drifting up behind the hero headline.
 * Deliberately tiny in scope. Loaded only via next/dynamic (ssr:false) and only when
 * motion is allowed + WebGL is present — see hero-embers-mount.tsx. If it never loads,
 * the SVG dusk scene + CSS glow already carry the hero, so nothing is lost.
 */

const COUNT = 130;
const Y_TOP = 5.5;
const Y_BOTTOM = -5.5;

function Embers() {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.25 + Math.random() * 0.6;
    }
    return { positions, speeds };
  }, []);

  const texture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,228,176,1)");
    g.addColorStop(0.4, "rgba(242,169,59,0.55)");
    g.addColorStop(1, "rgba(242,169,59,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const d = Math.min(delta, 0.05);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * d;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.6 + i) * d * 0.12;
      if (arr[i * 3 + 1] > Y_TOP) {
        arr[i * 3 + 1] = Y_BOTTOM;
        arr[i * 3] = (Math.random() - 0.5) * 16;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.42}
        map={texture}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroEmbers() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop="always"
      style={{ pointerEvents: "none" }}
    >
      <Embers />
    </Canvas>
  );
}
