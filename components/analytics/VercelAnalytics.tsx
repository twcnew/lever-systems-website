"use client";

import { Analytics } from "@vercel/analytics/next";

const ASSET_PAGE =
  /\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:$|\?)/i;

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (event.type !== "pageview") return event;
        try {
          const path = new URL(event.url, "https://lever.systems").pathname;
          if (ASSET_PAGE.test(path)) return null;
          if (path.includes("og-lever") || path === "/og.jpg") return null;
        } catch {
          return event;
        }
        return event;
      }}
    />
  );
}
