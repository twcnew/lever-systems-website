#!/usr/bin/env python3
"""Extract Confetti Claude SVG layers from ayotomcs bundle → lib/claudeConfetti/frames.tsx"""
from __future__ import annotations

import re
import subprocess
import textwrap
from pathlib import Path

BUNDLE_URL = "https://ayotomcs.me/_next/static/chunks/5ce46cbd0cd22c82.js"
OUT = Path(__file__).parent.parent / "lib" / "claudeConfetti" / "frames.tsx"


def fetch_bundle() -> str:
    return subprocess.check_output(["curl", "-sL", BUNDLE_URL], text=True)


def jsx_rect_to_svg(block: str) -> list[str]:
    """Convert i.jsx rect props in a block to <rect ...> strings."""
    rects: list[str] = []
    pattern = r'\(0,i\.jsx\)\("rect",\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\)'
    for m in re.finditer(pattern, block):
        props = m.group(1)
        attrs: dict[str, str] = {}
        for key in ("id", "x", "y", "width", "height", "fill", "transform"):
            pm = re.search(rf'{key}:"([^"]*)"', props)
            if pm:
                attrs[key] = pm.group(1)
        parts = []
        for key in ("id", "x", "y", "width", "height", "fill", "transform"):
            if key in attrs:
                parts.append(f'{key}="{attrs[key]}"')
        rects.append(f"<rect {' '.join(parts)}></rect>")
    return rects


def extract_group_children(block: str, frame_index: int) -> str:
    """Extract children HTML for one particle frame group."""
    positions = [m.start() for m in re.finditer(r"ref:t=>r\.current\[\d+\]=t", block)]
    if frame_index >= len(positions):
        raise RuntimeError(f"Missing particle frame {frame_index}")
    start = positions[frame_index]
    end = positions[frame_index + 1] if frame_index + 1 < len(positions) else len(block)
    segment = block[start:end]
    children_m = re.search(r"children:(?:\[(.*?)\]|\(0,i\.jsx\))", segment, re.DOTALL)
    if not children_m:
        raise RuntimeError(f"No children in particle frame {frame_index}")
    inner = children_m.group(1) if children_m.group(1) else segment
    if not children_m.group(1):
        # single rect child: children:(0,i.jsx)("rect",...
        inner = segment[segment.find("children:") :]
    return "".join(jsx_rect_to_svg(inner))


def extract_character_layers(chunk: str) -> list[dict[str, str]]:
    layers = []
    for i in range(1, 9):
        lid = f"l00{i}"
        pat = rf'\(0,i\.jsxs\)\("g",\{{id:"{lid}",transform:"([^"]*)".*?children:\[(.*?)\]\}}\),\(0,i\.jsxs\)\("g",\{{id:"l'
        if i < 8:
            next_id = f"l00{i+1}"
            m = re.search(
                rf'\(0,i\.jsxs\)\("g",\{{id:"{lid}",transform:"([^"]*)".*?children:\[(.*?)\]\}}\),\(0,i\.jsxs\)\("g",\{{id:"{next_id}"',
                chunk,
                re.DOTALL,
            )
        else:
            m = re.search(
                rf'\(0,i\.jsxs\)\("g",\{{id:"{lid}",transform:"([^"]*)".*?children:\[(.*?)\]\}}\),\(0,i\.jsxs\)\("g",\{{ref:',
                chunk,
                re.DOTALL,
            )
        if not m:
            raise RuntimeError(f"Missing layer {lid}")
        transform = m.group(1)
        inner_block = m.group(2)
        html = "".join(jsx_rect_to_svg(inner_block))
        layers.append({"transform": transform, "html": html})
    return layers


def extract_particle_frames(chunk: str) -> list[str]:
    burst_start = chunk.find('ref:c,display:"none",children:[')
    if burst_start < 0:
        raise RuntimeError("Burst group not found")
    burst = chunk[burst_start:]
    burst_end = burst.find('ref:s,display:"none"')
    burst1 = burst[:burst_end]
    frames = []
    for i in range(8):
        html = extract_group_children(burst1, i)
        frames.append(html)
    return frames


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def main() -> None:
    text = fetch_bundle()
    pos = text.find('viewBox:"0 0 129 113"')
    if pos < 0:
        raise RuntimeError("Confetti SVG not found in bundle")
    chunk = text[pos : pos + 120_000]

    chars = extract_character_layers(chunk)
    particles = extract_particle_frames(chunk)

    lines = [
        "/**",
        " * Confetti Claude SVG layers — extracted from ayotomcs.me/claude-mascot.",
        " * Credit: Ayotomiwa Wale-Durojaye (Codrops, May 2026).",
        " */",
        "",
        "export type CharacterLayer = { transform: string; html: string };",
        "",
        "export const CHARACTER_LAYERS: readonly CharacterLayer[] = [",
    ]
    for c in chars:
        lines.append(f'  {{ transform: `{esc(c["transform"])}`, html: `{esc(c["html"])}` }},')
    lines.append("] as const;")
    lines.append("")
    lines.append("export const PARTICLE_FRAME_HTML: readonly string[] = [")
    for p in particles:
        lines.append(f"  `{esc(p)}`,")
    lines.append("] as const;")
    lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines))
    print(f"Wrote {OUT} — {len(chars)} character layers, {len(particles)} particle frames")


if __name__ == "__main__":
    main()
