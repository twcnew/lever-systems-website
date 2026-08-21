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
const OUT = join(ROOT, "exports", "pyramid-linkedin.png");
const URL = process.env.PYRAMID_URL ?? "http://localhost:3001/studio/pyramid/";
const WIDTH = Number(process.env.PYRAMID_WIDTH) || 880;

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 1,
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      .studio-spine__stage { max-width: none !important; padding: 0 !important; }
      .studio-spine__poster--modern {
        display: block !important;
        width: ${WIDTH}px !important;
        border: 0 !important;
        margin: 0 !important;
      }
      .top-nav, .drawer, .studio-spine__intro, .cs-closing-band {
        display: none !important;
      }
      body { background: #050403 !important; }
      .pyramid-glass__band.is-active {
        border-color: rgba(255, 255, 255, 0.28) !important;
        background: rgba(255, 255, 255, 0.1) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22),
          0 18px 40px rgba(0, 0, 0, 0.28) !important;
      }
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
  await poster.screenshot({ path: OUT, type: "png" });
  await browser.close();
  console.log("wrote", OUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
