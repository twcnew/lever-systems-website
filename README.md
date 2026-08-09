# Lever System Website

Static Next.js site (App Router) for Lever: landing page, customers index, and case studies.

## Local

```bash
npm install
npm run dev     # → http://localhost:3001
npm run build   # static export → out/ (no basePath — Vercel / root domain)
```

## Deploy (Vercel)

1. Import this repo in Vercel.
2. Framework: Next.js. Do **not** set `GH_PAGES`.
3. Optional env: `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (defaults to `https://lever.studio`).
4. Build command: `npm run build` (produces `out/` via `output: "export"`).

Preview / production deploys from git as usual.

### GitHub Pages (optional mirror)

```bash
npm run build:pages   # GH_PAGES=true → basePath /lumio or /lever-studio
npm run deploy        # scripts/deploy-gh-pages.sh
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/use-cases/` | Customers index |
| `/use-cases/swan/` | Swan case study |
| `/use-cases/flex/` | FlexAI case study |
| `/use-cases/happypal/` | HappyPal case study |

## Stack

- Next.js 16 (static export) + React 19 + TypeScript + Tailwind CSS v4
- Motion: CSS + GSAP where needed; ink CTAs via Tegaki / rough-notation
- Cal.com embed on the closing section
