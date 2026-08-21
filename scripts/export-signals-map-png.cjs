const { mkdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { createRequire } = require("node:module");

function loadPlaywright() {
  const candidates = [
    join(process.env.HOME, ".npm/_npx/f0a362733743bae2/node_modules/playwright"),
    join(process.env.HOME, ".npm/_npx/e41f203b7505f1fb/node_modules/playwright"),
  ];
  const found = candidates.find((dir) => existsSync(join(dir, "index.js")));
  if (!found) throw new Error("Playwright not found");
  return createRequire(join(found, "package.json"))("playwright");
}

const { chromium } = loadPlaywright();

const ROOT = join(__dirname, "..");
const OUT_PNG = join(ROOT, "exports", "signals-map-linkedin.png");
const PAGE_URL = process.env.SIGNALS_URL ?? "http://localhost:3001/studio/signals/";
// LinkedIn portrait post. Match the website's stage width (880px) so the map
// sits at its natural website size (800px cap) — no enlargement, no cropping.
// Height is left natural (content-driven) to mirror the site.
const WIDTH = 880;

async function main() {
  await mkdir(join(ROOT, "exports"), { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 1,
  });

  await page.goto(PAGE_URL, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      .studio-spine__stage { max-width: none !important; padding: 0 !important; }
      .studio-spine__poster--modern {
        display: block !important;
        width: ${WIDTH}px !important;
        border: 0 !important;
        margin: 0 !important;
      }
      .top-nav, .drawer, .studio-spine__intro, .cs-closing-band,
      .studio-spine__variant-label { display: none !important; }
      body { background: #050403 !important; }
      /* Zoom for mobile legibility: tighten padding/chrome so the map fills
         more of the frame, and let the rings-square fill the content width. */
      .signals-glass { padding: 16px 16px 14px !important; }
      .signals-glass__hero { margin: 2px 0 8px !important; }
      .signals-glass__title { font-size: 26px !important; }
      .signals-glass__kicker { font-size: 12px !important; }
      .signals-glass__rings { margin: 4px 0 8px !important; }
      .signals-glass__rings-square { width: 100% !important; }
      .signals-glass__rule { margin: 4px 0 6px !important; }
      .signals-glass__rule-text { font-size: 12px !important; padding: 7px 14px !important; }
      .signals-glass .spine-glass__bust-corner { height: 96px !important; max-width: 120px !important; }
    `,
  });

  const poster = page.locator(".studio-spine__poster--modern");
  await poster.waitFor({ state: "visible" });
  await page.evaluate(() => {
    document
      .querySelector(".studio-spine__poster--modern")
      ?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(800);

  await poster.screenshot({
    path: OUT_PNG,
    type: "png",
  });

  await browser.close();
  console.log("wrote", OUT_PNG);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
