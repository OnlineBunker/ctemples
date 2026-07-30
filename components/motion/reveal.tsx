"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Shared easing with the view transitions (DESIGN_SYSTEM §11.2): ease-out-quart.
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered reveal: rises 16px and fades in as it enters the viewport, matching the
 * view-transition easing so page and scroll motion feel of a piece. Under
 * prefers-reduced-motion it becomes an instant, transform-free fade.
 *
 * The 3px un-blur this used to animate has been REMOVED. `filter` is not a compositor-only
 * property: animating it forces the whole wrapped subtree to re-rasterise every frame, and
 * these wrappers hold entire page sections (the temple index is 15 rows with images). The
 * blur's visual contribution across a 350ms fade was essentially invisible, so it was paying
 * a real cost on low-end hardware for a detail nobody perceives. Opacity + transform are both
 * compositor-driven, so the reveal is now effectively free.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.35, ease: EASE, delay },
    },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container that staggers its RevealItem children (60ms) as the group enters view.
 */
export function Stagger({
  children,
  className,
  stagger = 0.06,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  // Same reasoning as Reveal above: no `filter` animation.
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.35, ease: EASE },
    },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
