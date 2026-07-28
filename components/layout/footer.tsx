import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { Reveal } from "@/components/motion/reveal";

/**
 * Site footer — prototype site-footer fidelity (docs/15 §0a): ink band with a brand block
 * ("Every temple is a door." + "A FIELD GUIDE TO SACRED INDIA"), gold mono column headers
 * (SITE / CONTRIBUTE), and a hairline bottom row with the prototype stamp + imagery/map-data
 * attribution.
 *
 * Polish (2026-07-28): the footer is treated as the site's final threshold — a gold ◆-on-
 * hairline crest opens the band (echoing the Finale motif), the content rises on a scroll
 * reveal, the brand statement is display-forward, and nav links draw a turmeric underline on
 * hover/focus. Reduced motion neutralizes the reveal (opacity-only) via the Reveal primitive.
 */
const SITE = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "States", href: "/states" },
  { label: "Deities", href: "/deities" },
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/methodology" },
];

const CONTRIBUTE = [
  { label: "Suggest a temple", href: "/suggest" },
  { label: "Partner with us", href: "/contact" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center text-sm text-porcelain/70 transition-colors hover:text-turmeric focus-visible:text-turmeric"
    >
      <span className="bg-gradient-to-r from-turmeric to-turmeric bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-threshold group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px] motion-reduce:transition-none">
        {label}
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface-deep text-porcelain">
      {/* The final threshold — a gold ◆ resting on a hairline that fades in from the edges. */}
      <div aria-hidden className="flex items-center gap-4" style={{ padding: "0 clamp(20px,6vw,110px)", paddingTop: "clamp(40px,6vh,64px)" }}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-porcelain/20" />
        <span className="text-turmeric" style={{ fontSize: 12 }}>◆</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-porcelain/20" />
      </div>

      <div style={{ padding: "clamp(40px,6vh,72px) clamp(20px,6vw,110px) 26px" }}>
        <Reveal>
          <div className="flex flex-wrap justify-between" style={{ gap: "clamp(30px,5vw,80px)" }}>
            <div className="max-w-[360px]">
              <Link href="/" className="flex items-center gap-2.5" aria-label="CTemples home">
                <GopuramMark className="h-7 w-6 text-magenta" strokeWidth={2} />
                <span className="font-display text-[19px] font-bold tracking-[-.02em]">CTemples</span>
              </Link>
              <p className="mt-5 text-balance font-display font-semibold leading-[1.18] tracking-[-.015em]" style={{ fontSize: "clamp(23px,2.6vw,30px)" }}>
                Every temple is a door.
              </p>
              <p className="mt-3 font-mono text-[10px] leading-[1.9] tracking-[.22em] text-porcelain/40">
                A FIELD GUIDE TO SACRED INDIA
              </p>
            </div>
            <div className="flex flex-wrap" style={{ gap: "clamp(36px,6vw,90px)" }}>
              <nav aria-label="Site">
                <p className="mb-[15px] font-mono text-[10px] tracking-[.26em] text-turmeric">SITE</p>
                <div className="flex flex-col gap-2.5">
                  {SITE.map((l) => (
                    <FooterLink key={l.href} href={l.href} label={l.label} />
                  ))}
                </div>
              </nav>
              <nav aria-label="Contribute">
                <p className="mb-[15px] font-mono text-[10px] tracking-[.26em] text-turmeric">CONTRIBUTE</p>
                <div className="flex flex-col gap-2.5">
                  {CONTRIBUTE.map((l) => (
                    <FooterLink key={l.href} href={l.href} label={l.label} />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </Reveal>
        <div
          className="flex flex-wrap justify-between gap-3 border-t border-porcelain/[.13] pt-[22px]"
          style={{ marginTop: "clamp(36px,6vh,60px)" }}
        >
          <p className="font-mono text-[9.5px] tracking-[.2em] text-porcelain/40">© 2026 CTEMPLES — FRONTEND PROTOTYPE</p>
          <p className="font-mono text-[9.5px] tracking-[.2em] text-porcelain/40">
            IMAGERY — WIKIMEDIA COMMONS · BASE MAP — DATAMEET, CC BY 4.0
          </p>
        </div>
      </div>
    </footer>
  );
}
