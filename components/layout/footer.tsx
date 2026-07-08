import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { Divider } from "@/components/brand/divider";

// UI-only placeholders — no destinations are wired in the prototype.
const SOCIALS = ["Instagram", "YouTube", "X"];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas">
      <div className="shell py-16">
        <Divider className="mb-14" />
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5" aria-label="CTemples home">
              <GopuramMark className="h-7 w-7 text-temple-red" />
              <span className="font-display text-lg text-ink">
                C<span className="text-temple-red">temples</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              A comprehensive encyclopedia of India&apos;s temples — their history, architecture,
              festivals, and everything you need to visit them.
            </p>
          </div>

          <nav aria-label="Contribute">
            <h2 className="eyebrow mb-4">Contribute</h2>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              {/* /suggest ships in Phase 8; the link is placed now per the plan. */}
              <li>
                <Link href="/suggest" className="transition-colors hover:text-temple-red">
                  Suggest a temple →
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-temple-red">
                  Partner with us →
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">Connect</h2>
            <ul className="space-y-2.5 text-sm text-ink-subtle">
              {SOCIALS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2.5 text-sm text-ink-muted">
              <li>
                <Link href="/about" className="transition-colors hover:text-temple-red">
                  About the project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[0.68rem] uppercase tracking-label text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>© {2026} CTemples · Made in India</span>
          <span>v0.1 prototype · placeholder content</span>
        </div>
      </div>
    </footer>
  );
}
