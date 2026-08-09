#!/usr/bin/env python3
"""Remove a green-screen background and export a transparent PNG."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def remove_green_screen(
    image: Image.Image,
    *,
    green_min: int = 120,
    dominance: int = 40,
    softness: int = 25,
) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if g < green_min:
                continue

            green_strength = g - max(r, b)
            if green_strength < dominance:
                continue

            if green_strength >= dominance + softness:
                pixels[x, y] = (r, g, b, 0)
                continue

            fade = (green_strength - dominance) / softness
            pixels[x, y] = (r, g, b, int(a * (1 - fade)))

    return rgba


def trim_transparent(
    image: Image.Image,
    *,
    top_padding: int = 12,
    bottom_padding: int = 0,
) -> Image.Image:
    alpha = image.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    padded_top = max(0, top - top_padding)
    padded_bottom = max(padded_top + 1, bottom - bottom_padding)
    return image.crop((left, padded_top, right, padded_bottom))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Source image path")
    parser.add_argument("output", type=Path, help="Output PNG path")
    parser.add_argument(
        "--trim",
        action="store_true",
        help="Crop to subject bounds and keep a small top margin",
    )
    parser.add_argument(
        "--top-padding",
        type=int,
        default=12,
        help="Transparent pixels to preserve above the subject when trimming",
    )
    parser.add_argument(
        "--bottom-padding",
        type=int,
        default=0,
        help="Pixels to crop above the bottom of the subject bounds when trimming",
    )
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(args.input)
    result = remove_green_screen(image)
    if args.trim:
        result = trim_transparent(
            result,
            top_padding=args.top_padding,
            bottom_padding=args.bottom_padding,
        )
    result.save(args.output, format="PNG", optimize=True)
    print(f"Wrote {args.output} ({result.size[0]}x{result.size[1]})")


if __name__ == "__main__":
    main()
