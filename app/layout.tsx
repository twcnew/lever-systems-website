import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VercelAnalytics } from "@/components/analytics/VercelAnalytics";
import { Caveat, Geist, Instrument_Serif } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
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
    default: "Lever — Personalized AI Systems for GTM Teams",
    template: "%s — Lever",
  },
  description:
    "AI-native GTM engineer. I design and build signal-led outbound, inbound routing, and revenue workflows inside your stack — pipeline on autopilot.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Lever",
    title: "Lever — Personalized AI Systems for GTM Teams",
    description:
      "AI-native GTM engineer. Signal-led outbound, inbound routing, and revenue workflows inside your stack.",
    images: [
      {
        // New path + query bust Slack/Discord OG caches
        url: "/og.jpg?v=7",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Lever — Personalized AI systems for GTM teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lever — Personalized AI Systems for GTM Teams",
    description:
      "AI-native GTM engineer. Signal-led outbound, inbound routing, and revenue workflows inside your stack.",
    images: ["/og.jpg?v=7"],
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
        <PostHogProvider>
          {children}
          <VercelAnalytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
