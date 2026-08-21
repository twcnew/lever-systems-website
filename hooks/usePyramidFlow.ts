"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

const STEP_HOLD_S = 1.2;

/**
 * Loop an "is-active" class upward through the pyramid bands
 * (L1 -> L5 -> L1 ...). Plays only while the stage is in the viewport.
 * Respects prefers-reduced-motion (skips entirely).
 */
export function usePyramidFlow(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) return;

    const steps = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(".pyramid-glass__band[data-step]"),
      ).sort(
        (a, b) =>
          Number(a.dataset.step ?? 0) - Number(b.dataset.step ?? 0),
      ); // bottom (L1) first -> top (L5)

    let timeline: gsap.core.Timeline | null = null;
    let context: gsap.Context | null = null;
    let inViewport = false;
    let buildFrame = 0;

    const clearActive = () =>
      steps().forEach((s) => s.classList.remove("is-active"));

    const buildTimeline = () => {
      context?.revert();
      timeline?.kill();
      clearActive();

      context = gsap.context(() => {
        timeline = gsap.timeline({
          paused: true,
          repeat: -1,
          onRepeat: clearActive,
        });

        const ordered = steps();
        ordered.forEach((step, index) => {
          timeline?.call(
            () => {
              clearActive();
              step.classList.add("is-active");
            },
            undefined,
            index * STEP_HOLD_S,
          );
        });

        timeline.to({}, { duration: STEP_HOLD_S * 0.6 });
      }, root);
    };

    const syncPlayback = () => {
      if (!timeline) return;
      if (inViewport && !document.hidden) timeline.resume();
      else timeline.pause();
    };

    const scheduleBuild = () => {
      cancelAnimationFrame(buildFrame);
      buildFrame = requestAnimationFrame(buildTimeline);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.12;
        syncPlayback();
      },
      { threshold: [0, 0.12, 0.35] },
    );

    intersectionObserver.observe(root);
    document.addEventListener("visibilitychange", syncPlayback);
    scheduleBuild();

    return () => {
      cancelAnimationFrame(buildFrame);
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      clearActive();
      context?.revert();
      timeline?.kill();
    };
  }, [rootRef]);
}
