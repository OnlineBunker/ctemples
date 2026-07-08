import type { FC, ReactNode } from "react";

/**
 * Type shims for React's View Transitions API. The values exist at runtime because
 * next.config.mjs sets experimental.viewTransition:true (Next aliases `react` to its
 * bundled react-experimental, which exports these), but stable @types/react doesn't
 * declare them. Verified present at build: unstable_ViewTransition / unstable_addTransitionType.
 */
type ViewTransitionClass = "auto" | "none" | (string & {}) | Record<string, string>;

declare module "react" {
  interface ViewTransitionProps {
    children?: ReactNode;
    name?: string;
    className?: string;
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }
  export const unstable_ViewTransition: FC<ViewTransitionProps>;
  export function unstable_addTransitionType(type: string): void;
}
