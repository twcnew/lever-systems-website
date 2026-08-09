/** Canonical production URL — override with NEXT_PUBLIC_SITE_URL on Vercel. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lever.systems"
).replace(/\/$/, "");
