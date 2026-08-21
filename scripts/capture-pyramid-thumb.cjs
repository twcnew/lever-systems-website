const { existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
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
const sharp = require("sharp");

const ROOT = join(__dirname, "..");
const OUT_PNG = join(ROOT, "public", "studio", "pyramid.png");
const RAW_PNG = join(tmpdir(), "lever-pyramid-thumb-raw.png");
const PAGE_URL = process.env.PYRAMID_URL ?? "http://localhost:3001/studio/pyramid/";
// 720px wide yields a near-4:5 poster; pad to exact 4:5 for the gallery card.
const WIDTH = Number(process.env.PYRAMID_WIDTH) || 720;
const TARGET_W = WIDTH;
const TARGET_H = Math.round(TARGET_W / 0.8);

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 1,
  });

  await page.emulateMedia({ reducedMotion: "reduce" });

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
      .top-nav, .drawer, .studio-spine__intro, .cs-closing-band {
        display: none !important;
      }
      body { background: #050403 !important; }
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

  await poster.screenshot({ path: RAW_PNG, type: "png" });
  await browser.close();

  // Fit the poster into an exact 4:5 portrait canvas (dark letterbox) so the
  // gallery thumbnail fills its frame with no crop and no composite error.
  await sharp(RAW_PNG)
    .resize({
      width: TARGET_W,
      height: TARGET_H,
      fit: "contain",
      background: "#050403",
    })
    .png()
    .toFile(OUT_PNG);

  console.log("wrote", OUT_PNG, `${TARGET_W}x${TARGET_H}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
