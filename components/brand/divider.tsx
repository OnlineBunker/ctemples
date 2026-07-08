import { GopuramMark } from "./gopuram-mark";
import { cn } from "@/lib/utils";

/** Section divider: a warm hairline meeting a small gopuram — a threshold between sections. */
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
      <GopuramMark className="h-6 w-6 text-magenta/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
    </div>
  );
}
