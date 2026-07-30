import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontDisplay, fontBody, fontMono, fontTelugu } from "./fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_URL, SITE_NAME, INDEXABLE } from "@/lib/site";

export const metadata: Metadata = {
  // Env-driven (lib/site.ts) — was hardcoded to the placeholder `ctemples.example`, which made
  // every canonical and Open Graph URL point at a domain nobody owns.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CTemples — the temple encyclopedia of India",
    template: "%s · CTemples",
  },
  description:
    "A comprehensive, tourist-friendly encyclopedia of India's temples: history, legend, architecture, festivals, timings, and how to visit. A frontend prototype.",
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    title: "CTemples — the temple encyclopedia of India",
    description:
      "History, legend, architecture, and travel for India's temples — searchable state by state and deity by deity.",
    type: "website",
    locale: "en_IN",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CTemples — the temple encyclopedia of India",
    description:
      "History, legend, architecture, and travel for India's temples — searchable state by state and deity by deity.",
  },
  // NO `alternates.canonical` here on purpose. Next inherits layout metadata into every child
  // route, so a canonical set at the root would make EVERY page declare itself a duplicate of
  // "/" — which tells search engines to drop the entire site bar the homepage. Canonicals are
  // therefore declared per route (see each page's metadata / generateMetadata).
  // Honours the prototype-wide noindex until the environment explicitly flips it.
  robots: INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF6F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        fontDisplay.variable,
        fontBody.variable,
        fontMono.variable,
        fontTelugu.variable,
      )}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-magenta focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-label focus:text-canvas"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
