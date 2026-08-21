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
const FRAMES_DIR = join(ROOT, "exports", "signals-map-gif-frames");
const OUT_GIF = join(ROOT, "exports", "signals-map-linkedin.gif");
const OUT_MP4 = join(ROOT, "exports", "signals-map-linkedin.mp4");
const PAGE_URL = process.env.SIGNALS_URL ?? "http://localhost:3001/studio/signals/";
// Capture at a comfortable cadence (12fps → ~83ms/frame, fits an 800px PNG
// screenshot without drift), then play back at 24fps for smoothness. To keep
// the GIF at exact 1x real speed, the page animations are slowed 2x during
// capture (GSAP timeScale 0.5 + CSS duration override), so 2x capture time
// ÷ 2x playback speed = 1x real speed.
const CAPTURE_FPS = 8;
const PLAY_FPS = 16;
// LinkedIn portrait post: 4:5. Match the website's stage width (880px) so the
// map sits at its natural website size (800px cap) — no enlargement, no
// cropping. Height is left natural (content-driven) to mirror the site.
const WIDTH = 880;
// Real animation loop period is 16s (4 ripple cycles of 4s + 1 sweep revolution
// of 16s). Slowed 2x during capture → 32s of capture covers exactly one full
// (slowed) loop → seamless. 256 frames at 8fps capture ÷ 16fps playback = 16s
// = exact 1x real speed.
const CAPTURE_MS = 32000;

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
swatch_path = exports_dir / "_palette_swatch_signals.png"
palette_path = exports_dir / "_signals_palette.png"
ff = imageio_ffmpeg.get_ffmpeg_exe()
fps = "${PLAY_FPS}"
width = "${WIDTH}"

def run(args):
    subprocess.check_call(args)

# Reserve brand + logo colors so chip logos + royal blue survive palettegen.
swatch_colors = [
    (54, 197, 240),   # Slack blue
    (46, 182, 125),    # HubSpot green
    (224, 30, 90),     # Clay magenta
    (236, 178, 46),    # Clay yellow
    (255, 91, 53),     # Clay orange
    (255, 206, 0),     # Clay gold
    (59, 209, 251),    # light blue
    (49, 107, 255),    # Lemlist blue
    (90, 139, 228),    # royal blue (Lever accent)
    (255, 103, 0),     # Reddit orange
    (244, 119, 56),    # ColdIQ orange
    (0, 168, 232),     # LinkedIn blue
    (8, 143, 197),     # Gong teal
    (5, 4, 3),         # ink background
    (255, 255, 255),   # white text
    (244, 246, 251),   # off-white text
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
    make_gif(840, 56)
if out_gif.stat().st_size > 5_000_000:
    make_gif(800, 48)
if out_gif.stat().st_size > 5_000_000:
    make_gif(760, 40)
if out_gif.stat().st_size > 5_000_000:
    make_gif(720, 32)
if out_gif.stat().st_size > 5_000_000:
    make_gif(680, 32)

swatch_path.unlink(missing_ok=True)
palette_path.unlink(missing_ok=True)
`;
  await mkdir(join(ROOT, "exports"), { recursive: true });
  await writeFile(join(ROOT, "exports", "_make_signals_gif.py"), script);
  await run("python3", [join(ROOT, "exports", "_make_signals_gif.py")]);
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
      .signals-glass { padding: 16px 16px 14px !important; }
      .top-nav, .drawer, .studio-spine__intro, .cs-closing-band,
      .studio-spine__variant-label { display: none !important; }
      body { background: #050403 !important; }
      /* Zoom for mobile legibility: tighten chrome so the map fills more of
         the frame, and let the rings-square fill the content width. */
      .signals-glass__hero { margin: 2px 0 8px !important; }
      .signals-glass__title { font-size: 26px !important; }
      .signals-glass__kicker { font-size: 12px !important; }
      .signals-glass__rings { margin: 4px 0 8px !important; }
      .signals-glass__rings-square { width: 100% !important; }
      .signals-glass__rule { margin: 4px 0 6px !important; }
      .signals-glass__rule-text { font-size: 12px !important; padding: 7px 14px !important; }
      .signals-glass .spine-glass__bust-corner { height: 96px !important; max-width: 120px !important; }
      /* Slow CSS animations 2x during capture so 8fps capture (comfortable,
         no drift) maps to 16fps playback at exact 1x real speed. */
      .signals-glass__pulse { animation-duration: 8s !important; }
      .signals-glass__pulse--2 { animation-delay: 2.67s !important; }
      .signals-glass__pulse--3 { animation-delay: 5.33s !important; }
      .signals-glass__group { animation-duration: 8s !important; }
    `,
  });

  // Slow the GSAP sweep timelines 2x (16.8s → 33.6s) to match the CSS 2x.
  await page.evaluate(() => {
    const gsap = window.__gsap || (window.gsap);
    if (gsap && gsap.globalTimeline) gsap.globalTimeline.timeScale(0.5);
  });

  const poster = page.locator(".studio-spine__poster--modern");
  await poster.waitFor({ state: "visible" });
  await page.evaluate(() => {
    document
      .querySelector(".studio-spine__poster--modern")
      ?.scrollIntoView({ block: "start" });
  });
  // Let the GSAP entrance finish before capturing the loop.
  await page.waitForTimeout(1800);

  await mkdir(FRAMES_DIR, { recursive: true });
  const existing = await readdir(FRAMES_DIR).catch(() => []);
  await Promise.all(
    existing
      .filter((name) => name.startsWith("frame-"))
      .map((name) => unlink(join(FRAMES_DIR, name))),
  );

  // Wall-clock compensated capture at CAPTURE_FPS. Animations are slowed 2x,
  // so CAPTURE_MS of capture = one full slowed loop (32s = 2x the 16s real
  // cycle). Playback at PLAY_FPS (2x CAPTURE_FPS) shows the animation at
  // exact 1x real speed. 256 frames cover exactly one 16s real cycle.
  const interval = 1000 / CAPTURE_FPS;
  // Capture one extra frame (frame 256 = phase 360° = frame 0) so the last
  // real frame (255) loops seamlessly into frame 0. Drop the extra frame
  // before building the GIF so it isn't duplicated.
  const totalFrames = Math.round((CAPTURE_FPS * CAPTURE_MS) / 1000) + 1; // 257
  let frame = 0;
  const started = Date.now();

  while (frame < totalFrames) {
    const tick = Date.now();
    const name = `frame-${String(frame).padStart(4, "0")}.png`;
    await poster.screenshot({
      path: join(FRAMES_DIR, name),
      type: "png",
      animations: "allow",
    });
    frame += 1;

    const elapsed = Date.now() - tick;
    if (elapsed < interval) {
      await new Promise((resolve) => setTimeout(resolve, interval - elapsed));
    }
  }

  await browser.close();
  // Drop the duplicate wrap frame (frame 256 == frame 0) for a seamless loop.
  await unlink(join(FRAMES_DIR, `frame-${String(totalFrames - 1).padStart(4, "0")}.png`)).catch(() => {});
  console.log(`captured ${totalFrames - 1} frames (seamless)`);
  await pythonGif();
  console.log("wrote", OUT_GIF, OUT_MP4);

  const leftovers = await readdir(FRAMES_DIR).catch(() => []);
  await Promise.all(leftovers.map((name) => unlink(join(FRAMES_DIR, name))));
  await unlink(join(ROOT, "exports", "_make_signals_gif.py")).catch(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
