import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontDisplay, fontBody, fontMono, fontTelugu } from "./fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageBanner } from "@/components/home/language-banner";

export const metadata: Metadata = {
  metadataBase: new URL("https://ctemples.example"),
  title: {
    default: "CTemples — the temple encyclopedia of India",
    template: "%s · CTemples",
  },
  description:
    "A comprehensive, tourist-friendly encyclopedia of India's temples: history, legend, architecture, festivals, timings, and how to visit. A frontend prototype.",
  openGraph: {
    title: "CTemples — the temple encyclopedia of India",
    description:
      "History, legend, architecture, and travel for India's temples — searchable state by state and deity by deity.",
    type: "website",
  },
  robots: { index: false, follow: false },
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
        <LanguageBanner />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
