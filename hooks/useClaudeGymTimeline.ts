"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { CLAUDE_GYM_FRAME_COUNT } from "@/lib/claudeGym/frames";
import { FRAME_SEQUENCE, getDelay } from "@/lib/claudeGym/sequence";

export function useClaudeGymTimeline(
  containerRef: RefObject<Element | null>,
  frameRefs: RefObject<(SVGGElement | null)[]>,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showFrame = (frame: number) => {
      for (let j = 0; j < CLAUDE_GYM_FRAME_COUNT; j++) {
        const el = frameRefs.current[j];
        if (el) el.style.display = j === frame ? "inline" : "none";
      }
    };

    if (reducedMotion) {
      showFrame(0);
      return;
    }

    let timeline: gsap.core.Timeline | null = null;
    let visible = false;

    const syncPlayback = () => {
      if (!timeline) return;
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    timeline = gsap.timeline({ repeat: -1, paused: true });
    let time = 0;

    for (let i = 0; i < FRAME_SEQUENCE.length; i++) {
      const frame = FRAME_SEQUENCE[i];
      timeline.call(() => showFrame(frame), undefined, time);
      time += getDelay(i, frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.2 },
    );

    observer.observe(container);

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    visible = rect.bottom > 0 && rect.top < vh;
    syncPlayback();

    const onVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      timeline?.kill();
    };
  }, [containerRef, frameRefs]);
}
