"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import {
  CHARACTER_FRAME_COUNT,
  FRAME_DURATION,
  PARTICLE_FRAME_COUNT,
  PARTICLE_Y_OFFSETS,
} from "@/lib/claudeConfetti/sequence";

type ConfettiRefs = {
  containerRef: RefObject<Element | null>;
  characterRefs: RefObject<(SVGGElement | null)[]>;
  burst1GroupRef: RefObject<SVGGElement | null>;
  burst1FrameRefs: RefObject<(SVGGElement | null)[]>;
  burst2GroupRef: RefObject<SVGGElement | null>;
  burst2FrameRefs: RefObject<(SVGGElement | null)[]>;
};

export function useClaudeConfettiTimeline({
  containerRef,
  characterRefs,
  burst1GroupRef,
  burst1FrameRefs,
  burst2GroupRef,
  burst2FrameRefs,
}: ConfettiRefs) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const burst1Group = burst1GroupRef.current;
    const burst2Group = burst2GroupRef.current;

    const showOnly = (refs: (SVGGElement | null)[], index: number) => {
      for (let j = 0; j < refs.length; j++) {
        const el = refs[j];
        if (el) el.style.display = j === index ? "inline" : "none";
      }
    };

    if (reducedMotion) {
      showOnly(characterRefs.current, 0);
      if (burst1Group) burst1Group.style.display = "none";
      if (burst2Group) burst2Group.style.display = "none";
      return;
    }

    let charTl: gsap.core.Timeline | null = null;
    let burst1Tl: gsap.core.Timeline | null = null;
    let burst2Tl: gsap.core.Timeline | null = null;
    let visible = false;

    const syncPlayback = () => {
      if (!charTl || !burst1Tl || !burst2Tl) return;
      const play = visible && !document.hidden;
      if (play) {
        charTl.play();
        burst1Tl.play();
        burst2Tl.play();
      } else {
        charTl.pause();
        burst1Tl.pause();
        burst2Tl.pause();
      }
    };

    charTl = gsap.timeline({ repeat: -1, paused: true });
    for (let t = 0; t < CHARACTER_FRAME_COUNT; t++) {
      const time = FRAME_DURATION * t;
      charTl.call(() => showOnly(characterRefs.current, t), undefined, time);
    }

    burst1Tl = gsap.timeline({ repeat: -1, delay: FRAME_DURATION, paused: true });
    if (burst1Group) burst1Tl.set(burst1Group, { display: "inline" }, 0);
    for (let t = 0; t < PARTICLE_FRAME_COUNT; t++) {
      const time = FRAME_DURATION * t;
      const y = PARTICLE_Y_OFFSETS[t];
      burst1Tl.set(burst1Group, { attr: { transform: `translate(90, ${y})` } }, time);
      burst1Tl.call(() => showOnly(burst1FrameRefs.current, t), undefined, time);
    }

    burst2Tl = gsap.timeline({ repeat: -1, delay: FRAME_DURATION * 6, paused: true });
    if (burst2Group) burst2Tl.set(burst2Group, { display: "inline" }, 0);
    for (let t = 0; t < PARTICLE_FRAME_COUNT; t++) {
      const time = FRAME_DURATION * t;
      const y = PARTICLE_Y_OFFSETS[t];
      burst2Tl.set(burst2Group, { attr: { transform: `translate(40, ${y}) scale(-1, 1)` } }, time);
      burst2Tl.call(() => showOnly(burst2FrameRefs.current, t), undefined, time);
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
      charTl?.kill();
      burst1Tl?.kill();
      burst2Tl?.kill();
    };
  }, [
    containerRef,
    characterRefs,
    burst1GroupRef,
    burst1FrameRefs,
    burst2GroupRef,
    burst2FrameRefs,
  ]);
}
