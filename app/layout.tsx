import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Caveat, Geist, Instrument_Serif } from "next/font/google";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-ink-note",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lever — Autonomous AI Systems for GTM Teams",
    template: "%s — Lever",
  },
  description:
    "AI-native GTM engineer. I design and build signal-led outbound, inbound routing, and revenue workflows inside your stack — pipeline on autopilot.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Lever",
    title: "Lever — Autonomous AI Systems for GTM Teams",
    description:
      "AI-native GTM engineer. Signal-led outbound, inbound routing, and revenue workflows inside your stack.",
    images: [
      {
        url: "/og-lever.jpg",
        width: 1200,
        height: 630,
        alt: "Lever — Autonomous AI systems for GTM teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lever — Autonomous AI Systems for GTM Teams",
    description:
      "AI-native GTM engineer. Signal-led outbound, inbound routing, and revenue workflows inside your stack.",
    images: ["/og-lever.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrumentSerif.variable} ${caveat.variable} antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero-painting-dither.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
