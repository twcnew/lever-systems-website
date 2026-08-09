"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseRiskTickerOptions = {
  count: number;
  /** How many lines stay stacked on screen at once (oldest on top). */
  stackSize?: number;
};

export type TickerLine = {
  /** Stable identity for this occurrence, for keyed enter/exit animation. */
  key: number;
  /** Index into the source lines array. */
  index: number;
};

/**
 * Cycles through ticker lines once the element enters the viewport. Starts
 * empty, types the first line, then stacks completed lines above while the
 * next one types below. Advancement is driven externally (e.g. typewriter
 * completion). Pauses when scrolled away or the tab is hidden.
 */
export function useRiskTicker({ count, stackSize = 2 }: UseRiskTickerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    if (reduced) setHasEntered(true);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && !document.hidden;
        setIsVisible(visible);
        if (visible) setHasEntered(true);
      },
      { threshold: 0.12 },
    );
    observer.observe(el);

    const onVisibility = () => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      const visible = inView && !document.hidden;
      setIsVisible(visible);
      if (visible) setHasEntered(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  const advance = useCallback(() => {
    if (!hasEntered || document.hidden) return;
    setStep((prev) => prev + 1);
  }, [hasEntered]);

  const depth =
    !hasEntered || count <= 0 ? 0 : Math.max(1, Math.min(stackSize, step + 1));

  const lines: TickerLine[] =
    depth > 0
      ? Array.from({ length: depth }, (_, i) => {
          const key = step - (depth - 1 - i);
          const index = ((key % count) + count) % count;
          return { key, index };
        })
      : [];

  return { containerRef, lines, reducedMotion, isVisible: isVisible && hasEntered, advance, hasEntered };
}
