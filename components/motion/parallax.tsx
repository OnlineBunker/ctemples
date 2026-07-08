"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical parallax for near-top-of-page hero layers. Tracks the viewport scroll (no
 * per-element target — that keeps it measurement-warning-free and cheap) and drifts an
 * absolutely-filled inner layer as the page scrolls. `speed` scales the drift; 0 is
 * static. Disabled under prefers-reduced-motion. Transforms only → zero layout shift.
 */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 170 * speed]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={reduce ? undefined : { y }}
        className="absolute inset-0 will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
