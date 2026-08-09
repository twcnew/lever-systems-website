"use client";

import { useEffect, type RefObject } from "react";

const STEP_MS = 1400;

type SolutionPipelineHighlightRefs = {
  rootRef: RefObject<HTMLElement | null>;
};

export function useSolutionPipelineHighlight({ rootRef }: SolutionPipelineHighlightRefs) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const steps = Array.from(root.querySelectorAll<HTMLElement>(".sol-pipe__step"));
    if (!steps.length) return;

    const defaultIndex = Math.max(
      0,
      steps.findIndex((step) => step.dataset.default === "true"),
    );
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer: ReturnType<typeof setInterval> | undefined;
    let index = defaultIndex;

    const setActive = (nextIndex: number) => {
      index = nextIndex;
      steps.forEach((step, stepIndex) => {
        step.classList.toggle("is-active", stepIndex === nextIndex);
      });
    };

    const stopCycle = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = undefined;
    };

    const startCycle = () => {
      if (reducedMotion) {
        setActive(defaultIndex);
        return;
      }

      stopCycle();
      timer = setInterval(() => {
        setActive((index + 1) % steps.length);
      }, STEP_MS);
    };

    const syncPlayback = (visible: boolean) => {
      if (visible && !document.hidden) startCycle();
      else {
        stopCycle();
        setActive(defaultIndex);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => syncPlayback(entry.isIntersecting),
      { threshold: 0.28 },
    );

    const onVisibility = () => {
      const rect = root.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      syncPlayback(visible);
    };

    observer.observe(root);
    setActive(defaultIndex);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      stopCycle();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rootRef]);
}
