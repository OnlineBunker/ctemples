"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { TempleScene } from "@/components/media/temple-scene";
import { HeroEmbersMount } from "./hero-embers-mount";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      {/* Parallax dusk scene behind the headline. Taller than the section so the drift
          never reveals an edge. */}
      <Parallax speed={0.35} className="absolute inset-0">
        <div className="relative h-[135%] w-full -translate-y-[12%]">
          <TempleScene
            seed="ctemples-hero-gate"
            region="South"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </Parallax>

      <div aria-hidden className="absolute inset-0 bg-sanctum-glow" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-nightstone-900 via-nightstone-900/45 to-transparent"
      />
      <div aria-hidden className="absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay" />

      {/* One tasteful 3D accent — drifting diya embers. Lazy, motion/WebGL-gated. */}
      <HeroEmbersMount />

      <div className="shell relative z-10 py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <Eyebrow>2,000+ temples · 28 states · centuries of stone</Eyebrow>
          <h1 className="mt-6 font-display text-display-xl text-limewash">
            The gate is only
            <br />
            <span className="italic text-brass">the beginning.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-limewash/75">
            CTemples is a cinematic field guide to the temples of India — their history and
            legend, their architecture and festivals, and exactly what it takes to stand
            before them.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="/explore" variant="primary">
              Explore temples
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/explore" variant="outline">
              Browse by region
            </ButtonLink>
          </div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.6rem] uppercase tracking-label text-limewash/40"
      >
        <span>Scroll inward</span>
        <motion.span
          className="block h-8 w-px bg-gradient-to-b from-brass/60 to-transparent"
          animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </div>
    </section>
  );
}
