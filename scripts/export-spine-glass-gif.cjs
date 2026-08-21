const { mkdir, writeFile, readdir, unlink } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");
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
const FRAMES_DIR = join(ROOT, "exports", "spine-glass-gif-frames");
const OUT_GIF = join(ROOT, "exports", "spine-glass-linkedin.gif");
const OUT_MP4 = join(ROOT, "exports", "spine-glass-linkedin.mp4");
const PAGE_URL = process.env.SPINE_URL ?? "http://localhost:3001/studio/spine/";
const FPS = 12;
// LinkedIn portrait post: 4:5. Width controlled, not too wide.
const WIDTH = 800;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function pythonGif() {
  const script = `
from pathlib import Path
import subprocess
import imageio_ffmpeg
from PIL import Image

frames_dir = Path(${JSON.stringify(FRAMES_DIR)})
pattern = str(frames_dir / "frame-%04d.png")
out_gif = Path(${JSON.stringify(OUT_GIF)})
out_mp4 = Path(${JSON.stringify(OUT_MP4)})
exports_dir = out_gif.parent
swatch_path = exports_dir / "_palette_swatch_glass.png"
palette_path = exports_dir / "_spine_glass_palette.png"
ff = imageio_ffmpeg.get_ffmpeg_exe()
fps = "${FPS}"
width = "${WIDTH}"

def run(args):
    subprocess.check_call(args)

# Reserve brand + logo colors so chip logos + royal blue survive palettegen.
swatch_colors = [
    (54, 197, 240),   # Slack blue
    (46, 182, 125),   # HubSpot green
    (224, 30, 90),    # Clay magenta
    (236, 178, 46),   # Clay yellow
    (255, 91, 53),    # Clay orange
    (255, 206, 0),    # Clay gold
    (59, 209, 251),   # light blue
    (49, 107, 255),   # Lemlist blue
    (90, 139, 228),   # royal blue (Lever accent)
    (5, 4, 3),        # ink background
    (255, 255, 255),  # white text
    (244, 246, 251),  # off-white text
]
block = 64
swatch = Image.new("RGB", (block * len(swatch_colors), block), (255, 255, 255))
for i, color in enumerate(swatch_colors):
    tile = Image.new("RGB", (block, block), color)
    swatch.paste(tile, (i * block, 0))
swatch.save(swatch_path)

run([
    ff, "-y", "-framerate", fps, "-i", pattern,
    "-vf", f"scale={width}:-2:flags=lanczos",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
    "-movflags", "+faststart", str(out_mp4),
])
print("mp4", out_mp4, out_mp4.stat().st_size)

def make_gif(gif_width, colors):
    bar_w = gif_width
    run([
        ff, "-y", "-framerate", fps, "-i", pattern, "-i", str(swatch_path),
        "-filter_complex",
        f"[0:v]scale={gif_width}:-1:flags=lanczos[v];"
        f"[1:v]scale={bar_w}:40:flags=neighbor[bar];"
        f"[v][bar]overlay=0:0,palettegen=max_colors={colors}:stats_mode=full:reserve_transparent=0",
        str(palette_path),
    ])
    run([
        ff, "-y", "-framerate", fps, "-i", pattern, "-i", str(palette_path),
        "-filter_complex",
        f"[0:v]scale={gif_width}:-1:flags=lanczos[v];"
        f"[v][1:v]paletteuse=dither=bayer:bayer_scale=2:diff_mode=rectangle",
        "-loop", "0", str(out_gif),
    ])
    print("gif", gif_width, colors, out_gif.stat().st_size)

make_gif(int(width), 64)
if out_gif.stat().st_size > 5_000_000:
    make_gif(720, 48)
if out_gif.stat().st_size > 5_000_000:
    make_gif(640, 40)

swatch_path.unlink(missing_ok=True)
palette_path.unlink(missing_ok=True)
`;
  await mkdir(join(ROOT, "exports"), { recursive: true });
  await writeFile(join(ROOT, "exports", "_make_glass_gif.py"), script);
  await run("python3", [join(ROOT, "exports", "_make_glass_gif.py")]);
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 2400 },
    deviceScaleFactor: 1,
  });

  await page.goto(PAGE_URL, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      .studio-spine__stage { max-width: none !important; padding: 0 !important; }
      .studio-spine__poster { display: none !important; }
      .studio-spine__poster--modern {
        display: block !important;
        width: ${WIDTH}px !important;
        border: 0 !important;
        margin: 0 !important;
      }
      .spine-glass { padding: 28px 28px 24px !important; }
      .spine-glass__machine { padding-left: 20px !important; padding-right: 20px !important; }
      .top-nav, .drawer, .studio-spine__intro, .cs-closing-band,
      .studio-spine__variant-label { display: none !important; }
      body { background: #050403 !important; }
    `,
  });

  const poster = page.locator(".studio-spine__poster--modern");
  await poster.waitFor({ state: "visible" });
  await page.waitForSelector(".spine-glass.is-wired", { timeout: 15000 });
  await page.evaluate(() => {
    document
      .querySelector(".studio-spine__poster--modern")
      ?.scrollIntoView({ block: "start" });
  });

  // Wait for the glass flow to finish wiring, then start traversing.
  await page.waitForFunction(
    () => !document.querySelector(".spine-glass")?.classList.contains("is-traversing"),
    null,
    { timeout: 70000 },
  );
  await page.waitForFunction(
    () => document.querySelector(".spine-glass")?.classList.contains("is-traversing"),
    null,
    { timeout: 10000 },
  );

  await mkdir(FRAMES_DIR, { recursive: true });
  const existing = await readdir(FRAMES_DIR).catch(() => []);
  await Promise.all(
    existing
      .filter((name) => name.startsWith("frame-"))
      .map((name) => unlink(join(FRAMES_DIR, name))),
  );

  const interval = 1000 / FPS;
  let frame = 0;
  const started = Date.now();
  const maxMs = 50000;

  while (Date.now() - started < maxMs) {
    const tick = Date.now();
    const name = `frame-${String(frame).padStart(4, "0")}.png`;
    await poster.screenshot({
      path: join(FRAMES_DIR, name),
      type: "png",
      animations: "allow",
    });
    frame += 1;

    const traversing = await page.evaluate(() =>
      Boolean(
        document
          .querySelector(".spine-glass")
          ?.classList.contains("is-traversing"),
      ),
    );
    if (!traversing && frame > 10) break;

    const elapsed = Date.now() - tick;
    if (elapsed < interval) {
      await new Promise((resolve) => setTimeout(resolve, interval - elapsed));
    }
  }

  await browser.close();
  console.log(`captured ${frame} frames`);
  await pythonGif();
  console.log("wrote", OUT_GIF, OUT_MP4);

  const leftovers = await readdir(FRAMES_DIR).catch(() => []);
  await Promise.all(leftovers.map((name) => unlink(join(FRAMES_DIR, name))));
  await unlink(join(ROOT, "exports", "_make_glass_gif.py")).catch(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
