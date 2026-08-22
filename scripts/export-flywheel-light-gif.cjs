const {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
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
const OUT_GIF = join(ROOT, "exports", "flywheel-light-linkedin.gif");
const AVATAR_PNG = join(ROOT, "public", "founder", "alexis-avatar.png");
const PAGE_URL =
  process.env.FLYWHEEL_URL ?? "http://localhost:3001/studio/flywheel/";
const CAPTURE_WIDTH = 1080;
const OUTPUT_FPS = 40;
const MAX_BYTES = 4_950_000;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function encodeGif(tempRoot, framesDir) {
  const pythonPath = join(tempRoot, "make-flywheel-light-gif.py");
  const script = `
from pathlib import Path
import subprocess
import imageio_ffmpeg
from PIL import Image

frames_dir = Path(${JSON.stringify(framesDir)})
pattern = str(frames_dir / "frame-%04d.png")
out_gif = Path(${JSON.stringify(OUT_GIF)})
avatar_path = Path(${JSON.stringify(AVATAR_PNG)})
temp_root = Path(${JSON.stringify(tempRoot)})
swatch_path = temp_root / "palette-swatch.png"
palette_path = temp_root / "palette.png"
ff = imageio_ffmpeg.get_ffmpeg_exe()
output_fps = ${OUTPUT_FPS}
max_bytes = ${MAX_BYTES}

def run(args):
    subprocess.check_call(args)

# Preserve both the light edition's key UI colors and the founder photo.
# The avatar is small in the poster, so its colors would otherwise have too
# little statistical weight to survive GIF's global 256-color palette.
ui_colors = [
    (244, 247, 255),
    (255, 255, 255),
    (16, 23, 44),
    (36, 88, 217),
    (55, 111, 235),
    (129, 69, 225),
    (14, 165, 233),
    (214, 226, 255),
]
avatar = Image.open(avatar_path).convert("RGB")
avatar.thumbnail((320, 320), Image.Resampling.LANCZOS)
avatar_quantized = avatar.quantize(
    colors=56,
    method=Image.Quantize.MEDIANCUT,
    dither=Image.Dither.NONE,
)
avatar_palette = avatar_quantized.getpalette()
avatar_counts = avatar_quantized.getcolors() or []
avatar_colors = []
for _, index in sorted(avatar_counts, reverse=True):
    offset = index * 3
    avatar_colors.append(tuple(avatar_palette[offset:offset + 3]))

swatch_colors = ui_colors + avatar_colors
block = 48
swatch = Image.new("RGB", (block * len(swatch_colors), block), (255, 255, 255))
for i, color in enumerate(swatch_colors):
    swatch.paste(Image.new("RGB", (block, block), color), (i * block, 0))
swatch.save(swatch_path)

# Build the animation deterministically from five stable card states. Only the
# action-card band is copied from each state; every Venn pixel comes from the
# same base image and therefore cannot animate during the GIF.
states = [Image.open(frames_dir / f"state-{step}.png").convert("RGB") for step in range(1, 6)]
base = states[0]
card_top = 1020
card_bottom = 1260
normalized_states = []
for state in states:
    normalized = base.copy()
    normalized.paste(
        state.crop((0, card_top, base.width, card_bottom)),
        (0, card_top),
    )
    normalized_states.append(normalized)

hold_frames = round(output_fps * 0.9)
transition_frames = round(output_fps * 0.3)
frame_index = 0
for state_index, current in enumerate(normalized_states):
    following = normalized_states[(state_index + 1) % len(normalized_states)]
    for _ in range(hold_frames):
        current.save(
            frames_dir / f"frame-{frame_index:04d}.png",
            compress_level=1,
        )
        frame_index += 1
    for transition_index in range(transition_frames):
        alpha = (transition_index + 1) / (transition_frames + 1)
        Image.blend(current, following, alpha).save(
            frames_dir / f"frame-{frame_index:04d}.png",
            compress_level=1,
        )
        frame_index += 1

print(
    "sequence",
    {
        "states": len(normalized_states),
        "hold_frames": hold_frames,
        "transition_frames": transition_frames,
        "total_frames": frame_index,
        "duration_seconds": frame_index / output_fps,
    },
)

def make_gif(fps, colors):
    run([
        ff, "-y", "-loglevel", "error",
        "-framerate", str(output_fps), "-i", pattern,
        "-i", str(swatch_path),
        "-filter_complex",
        f"[0:v]fps={fps},scale=${CAPTURE_WIDTH}:-1:flags=lanczos[v];"
        f"[1:v]scale=${CAPTURE_WIDTH}:48:flags=neighbor[bar];"
        f"[v][bar]overlay=0:0,"
        f"palettegen=max_colors={colors}:stats_mode=full:reserve_transparent=0",
        "-frames:v", "1",
        "-update", "1",
        str(palette_path),
    ])
    run([
        ff, "-y", "-loglevel", "error",
        "-framerate", str(output_fps), "-i", pattern,
        "-i", str(palette_path),
        "-filter_complex",
        f"[0:v]fps={fps},scale=${CAPTURE_WIDTH}:-1:flags=lanczos[v];"
        f"[v][1:v]paletteuse=dither=none:diff_mode=rectangle",
        "-loop", "0", str(out_gif),
    ])
    size = out_gif.stat().st_size
    print("gif", ${CAPTURE_WIDTH}, fps, colors, size)
    return size

# Keep native LinkedIn image width. Preserve the full 256-color GIF palette
# first, then choose the highest frame rate that fits the 5 MB budget. Lower
# palette sizes are only fallbacks if 256 colors cannot meet the limit.
attempts = [
    (40, 256),
    (36, 256),
    (30, 256),
    (28, 256),
    (24, 256),
    (22, 256),
    (20, 256),
    (18, 256),
    (16, 256),
    (15, 256),
    (12, 256),
    (40, 224),
    (36, 224),
    (30, 224),
    (28, 224),
    (24, 224),
    (22, 224),
    (20, 224),
    (18, 224),
    (16, 224),
    (15, 224),
    (12, 224),
    (40, 192),
    (36, 192),
    (30, 192),
    (28, 192),
    (24, 192),
    (22, 192),
    (20, 192),
    (18, 192),
    (16, 192),
    (15, 192),
    (12, 192),
]

for fps, colors in attempts:
    if make_gif(fps, colors) <= max_bytes:
        break
else:
    raise RuntimeError("Unable to encode the GIF below LinkedIn's 5 MB limit")
`;

  await writeFile(pythonPath, script);
  await run("python3", [pythonPath]);
}

async function main() {
  const tempRoot = await mkdtemp(join(tmpdir(), "lever-flywheel-light-"));
  const framesDir = join(tempRoot, "frames");
  await mkdir(framesDir, { recursive: true });
  await mkdir(join(ROOT, "exports"), { recursive: true });

  try {
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
        .studio-spine__poster { display: none !important; }
        .studio-spine__poster--flywheel-light {
          display: block !important;
          width: ${CAPTURE_WIDTH}px !important;
          border: 0 !important;
          margin: 0 !important;
        }
        .topnav, .drawer, .studio-spine__intro, .studio-spine__variant-label,
        .cs-closing-band { display: none !important; }
        .flywheel-glass--light .spine-glass__grain {
          display: none !important;
        }
        body { background: #f4f7ff !important; }
      `,
    });

    const poster = page.locator(".studio-spine__poster--flywheel-light");
    const root = poster.locator(".flywheel-glass--light");
    await poster.waitFor({ state: "visible" });
    await poster.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () =>
        document.querySelector(".flywheel-glass--light")?.dataset.activeStep ===
        "all",
    );
    await page.waitForTimeout(120);

    for (const step of [1, 2, 3, 4, 5]) {
      await root.evaluate((element, activeStep) => {
        element.dataset.activeStep = String(activeStep);
      }, step);
      await page.waitForTimeout(40);
      await poster.screenshot({
        path: join(framesDir, `state-${step}.png`),
        type: "png",
        animations: "disabled",
      });
    }

    await browser.close();
    console.log("captured 5 stable card states");
    await encodeGif(tempRoot, framesDir);
    console.log("wrote", OUT_GIF);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
