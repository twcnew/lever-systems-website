"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { isElementInViewport } from "@/lib/prefersReducedMotion";

const STEP_HOLD = 0.72;
const TRAVEL_DUR = 1.05;
const CLASS_LAG = 0.08;
const COL_PAUSE = 0.5;
const FLOW_EASE = "sine.inOut";

type PlaysMosaicFlowRefs = {
  rootRef: RefObject<HTMLElement | null>;
};

function getBeats(col: HTMLElement) {
  return Array.from(col.querySelectorAll<HTMLElement>(".plays-flow__beat"));
}

function measureKnobFractions(col: HTMLElement) {
  const track = col.querySelector<HTMLElement>(".plays-flow__progress");
  const beats = getBeats(col);
  if (!track || !beats.length) return [0];

  const trackRect = track.getBoundingClientRect();
  const trackHeight = trackRect.height || 1;

  return beats.map((beat) => {
    const beatRect = beat.getBoundingClientRect();
    const center = beatRect.top + beatRect.height / 2 - trackRect.top;
    return Math.min(1, Math.max(0, center / trackHeight));
  });
}

function setBeatClasses(col: HTMLElement, activeIndex: number) {
  getBeats(col).forEach((beat, index) => {
    beat.classList.toggle("lit", index === activeIndex);
    beat.classList.toggle("done", index < activeIndex);
  });
}

function clearBeatState(scope: ParentNode) {
  scope.querySelectorAll(".plays-flow__beat.lit, .plays-flow__beat.done").forEach((el) => {
    el.classList.remove("lit", "done");
  });
}

function clearColumnProgress(cols: HTMLElement[]) {
  cols.forEach((col) => {
    gsap.killTweensOf(col);
    col.style.removeProperty("--flow-progress");
    col.style.removeProperty("--knob-y");
  });
}

export function usePlaysMosaicFlow({ rootRef }: PlaysMosaicFlowRefs) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let visible = false;

    const cols = () => Array.from(root.querySelectorAll<HTMLElement>(".plays-flow__col"));

    const setColumnFocus = (activeCol: HTMLElement | null) => {
      cols().forEach((col) => {
        col.classList.toggle("plays-flow__col--active", col === activeCol);
      });
    };

    const clearActive = () => {
      cols().forEach((col) => col.classList.remove("plays-flow__col--active"));
      clearColumnProgress(cols());
      root.classList.remove("is-animating");
    };

    const resetVisual = () => {
      clearBeatState(root);
      clearActive();
    };

    const syncPlayback = () => {
      if (!timeline) return;
      visible = isElementInViewport(root, { threshold: 0.2 });
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    const buildTimeline = () => {
      timeline?.kill();
      timeline = null;
      resetVisual();

      const colEls = cols();
      if (!colEls.length) return;

      const master = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        paused: true,
        onRepeat: resetVisual,
      });

      colEls.forEach((col, colIndex) => {
        const beats = getBeats(col);
        const knobTargets = measureKnobFractions(col);
        const startY = knobTargets[0] ?? 0;

        const colTl = gsap.timeline({
          onStart: () => {
            clearBeatState(root);
            root.classList.add("is-animating");
            gsap.set(col, { "--flow-progress": startY, "--knob-y": startY });
            setColumnFocus(col);
            setBeatClasses(col, 0);
          },
        });

        beats.forEach((_, beatIndex) => {
          const targetY = knobTargets[beatIndex] ?? 0;

          if (beatIndex > 0) {
            colTl.to(col, {
              "--flow-progress": targetY,
              "--knob-y": targetY,
              duration: TRAVEL_DUR,
              ease: FLOW_EASE,
              overwrite: "auto",
            });

            colTl.call(
              () => setBeatClasses(col, beatIndex),
              undefined,
              `-=${TRAVEL_DUR - CLASS_LAG}`,
            );
          } else {
            colTl.set(col, { "--flow-progress": targetY, "--knob-y": targetY });
          }

          colTl.to({}, { duration: STEP_HOLD });
        });

        master.add(colTl);

        if (colIndex < colEls.length - 1) {
          master.call(() => {
            clearBeatState(col);
            setColumnFocus(null);
          });
          master.to({}, { duration: COL_PAUSE });
        }
      });

      timeline = master;
      syncPlayback();
    };

    const onVisibility = () => syncPlayback();

    const scheduleBuild = () => {
      timeline?.kill();
      timeline = null;
      requestAnimationFrame(() => {
        if (visible) buildTimeline();
      });
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !timeline) buildTimeline();
        else if (!visible) timeline?.pause();
        syncPlayback();
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    resizeObserver = new ResizeObserver(scheduleBuild);
    resizeObserver.observe(root);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      timeline?.kill();
      cols().forEach((col) => gsap.killTweensOf(col));
      resetVisual();
    };
  }, [rootRef]);
}
