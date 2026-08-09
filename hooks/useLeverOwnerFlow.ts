"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { isElementInViewport } from "@/lib/prefersReducedMotion";

const STEP_BEAT_DEFAULT = 0.95;
const STEP_BEAT_PANEL = 1.4;
const REPEAT_DELAY_DEFAULT = 1.1;
const REPEAT_DELAY_PANEL = 1.4;

type LeverOwnerFlowMode = "default" | "panel";

type LeverOwnerFlowRefs = {
  rootRef: RefObject<HTMLElement | null>;
  mode?: LeverOwnerFlowMode;
};

function getBeats(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(".lever-owner__pillar"));
}

function setBeatState(beats: HTMLElement[], activeIndex: number, mode: LeverOwnerFlowMode) {
  beats.forEach((beat, index) => {
    beat.classList.toggle("lit", index === activeIndex);
    if (mode === "default") {
      beat.classList.toggle("done", index < activeIndex);
    } else {
      beat.classList.remove("done");
    }
  });
}

function clearBeats(scope: ParentNode) {
  scope.querySelectorAll(".lever-owner__pillar.lit, .lever-owner__pillar.done").forEach((el) => {
    el.classList.remove("lit", "done");
  });
}

export function useLeverOwnerFlow({ rootRef, mode = "default" }: LeverOwnerFlowRefs) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const stepBeat = mode === "panel" ? STEP_BEAT_PANEL : STEP_BEAT_DEFAULT;
    const repeatDelay = mode === "panel" ? REPEAT_DELAY_PANEL : REPEAT_DELAY_DEFAULT;

    let observer: IntersectionObserver | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let visible = false;

    const resetVisual = () => {
      clearBeats(root);
      root.classList.remove("is-animating");
      gsap.killTweensOf(root);
    };

    const syncPlayback = () => {
      if (!timeline) return;
      visible = isElementInViewport(root, { threshold: 0.28 });
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    const buildTimeline = () => {
      timeline?.kill();
      timeline = null;
      resetVisual();

      const beats = getBeats(root);
      if (!beats.length) return;

      const master = gsap.timeline({
        repeat: -1,
        repeatDelay,
        paused: true,
        onRepeat: resetVisual,
      });

      master.call(() => {
        clearBeats(root);
        root.classList.add("is-animating");
      });

      beats.forEach((_, index) => {
        master.call(() => setBeatState(beats, index, mode));
        master.to({}, { duration: stepBeat });
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
      { threshold: 0.28 },
    );

    observer.observe(root);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      timeline?.kill();
      resetVisual();
    };
  }, [rootRef, mode]);
}
