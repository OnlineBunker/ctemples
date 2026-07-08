// Re-export React's native View Transitions API under stable names. These resolve to
// Next's bundled react-experimental because next.config.mjs sets
// experimental.viewTransition:true. Centralising the import keeps the `unstable_`
// prefix in exactly one place. See DESIGN.md + globals.css for the CSS recipes.
import {
  unstable_ViewTransition as ViewTransition,
  unstable_addTransitionType as addTransitionType,
} from "react";

export { ViewTransition, addTransitionType };
