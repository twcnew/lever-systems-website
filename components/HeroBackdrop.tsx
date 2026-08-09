"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { withBasePath } from "@/lib/basePath";

const HERO_PAINTING = "/hero-painting-dither.webp";
/** Night tone from the painting — fills the stage before the image paints. */
const HERO_STAGE_INK = "#0e1218";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const ImageDithering = dynamic(
  () =>
    import("@paper-design/shaders-react").then((mod) => mod.ImageDithering),
  { ssr: false, loading: () => null },
);

/**
 * Hero backdrop: static painting is always in the DOM (no white flash),
 * WebGL dither layers on top once the shader chunk is ready.
 */
export function HeroBackdrop() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const src = withBasePath(HERO_PAINTING);

  return (
    <div className="stage__glass" aria-hidden="true">
      <img
        className="stage__glass-painting stage__glass-painting--base"
        src={src}
        alt=""
        decoding="sync"
        fetchPriority="high"
        width={1024}
        height={576}
      />
      {!reducedMotion ? (
        <ImageDithering
          className="stage__glass-painting stage__glass-painting--shader"
          width="100%"
          height="100%"
          image={src}
          fit="cover"
          type="8x8"
          size={2}
          colorSteps={5}
          originalColors
          colorBack={HERO_STAGE_INK}
          colorFront="#0e0a07"
          colorHighlight="#5A8BE4"
        />
      ) : null}
    </div>
  );
}
