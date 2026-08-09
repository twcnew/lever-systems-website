"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

const STEP_BEAT = 1;
const PROGRESS_DUR = 0.75;
const EASE = "power2.inOut";

type BuildMissionFlowRefs = {
  rootRef: RefObject<HTMLElement | null>;
};

function getBeats(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(".build-beat"));
}

function setBeatState(beats: HTMLElement[], activeIndex: number) {
  beats.forEach((beat, index) => {
    beat.classList.toggle("lit", index === activeIndex);
    beat.classList.toggle("done", index < activeIndex);
  });
}

function clearBeats(scope: ParentNode) {
  scope.querySelectorAll(".build-beat.lit, .build-beat.done").forEach((el) => {
    el.classList.remove("lit", "done");
  });
}

export function useBuildMissionFlow({ rootRef }: BuildMissionFlowRefs) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let observer: IntersectionObserver | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let visible = false;

    const resetVisual = () => {
      clearBeats(root);
      root.classList.remove("is-animating");
      gsap.killTweensOf(root);
      root.style.removeProperty("--build-mission-progress");
    };

    const syncPlayback = () => {
      if (!timeline) return;
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    const buildTimeline = () => {
      timeline?.kill();
      timeline = null;
      resetVisual();

      const beats = getBeats(root);
      if (!beats.length) return;

      const hold = Math.max(STEP_BEAT - PROGRESS_DUR, 0.16);

      const master = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.4,
        paused: true,
        onRepeat: resetVisual,
      });

      master.call(() => {
        clearBeats(root);
        root.classList.add("is-animating");
        gsap.set(root, { "--build-mission-progress": 0 });
      });

      beats.forEach((_, index) => {
        const target = beats.length > 1 ? index / (beats.length - 1) : 0;

        master.call(() => setBeatState(beats, index));
        master.to(root, {
          "--build-mission-progress": target,
          duration: PROGRESS_DUR,
          ease: EASE,
          overwrite: "auto",
        });
        master.to({}, { duration: hold });
      });

      timeline = master;
      syncPlayback();
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !timeline) buildTimeline();
        syncPlayback();
      },
      { threshold: 0.25 },
    );

    observer.observe(root);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      timeline?.kill();
      resetVisual();
    };
  }, [rootRef]);
}
