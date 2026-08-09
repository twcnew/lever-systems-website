"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

export const INK_PATH_DRAW_MS = 520;
export const INK_CTA_READING_GAP_MS = 180;

const REVEAL_IO = {
  mid: { threshold: 0, rootMargin: "-42% 0px -42% 0px" },
  early: { threshold: 0, rootMargin: "-32% 0px -18% 0px" },
} as const;

const PAST_RATIO = 0.35;

function isPastReveal(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom < window.innerHeight * PAST_RATIO;
}

type UseMidRevealOptions = {
  enabled?: boolean;
  timing?: keyof typeof REVEAL_IO;
  onReveal: () => void;
  onSkip?: () => void;
};

export function useMidReveal<T extends Element>(
  ref: RefObject<T | null>,
  { enabled = true, timing = "mid", onReveal, onSkip }: UseMidRevealOptions,
) {
  const onRevealRef = useRef(onReveal);
  const onSkipRef = useRef(onSkip);
  onRevealRef.current = onReveal;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    let settled = false;

    const settle = (action: "reveal" | "skip") => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);

      if (action === "reveal") {
        onRevealRef.current();
      } else {
        onSkipRef.current?.();
      }
    };

    if (prefersReducedMotion()) {
      settle("skip");
      return;
    }

    const onScroll = () => {
      if (!settled && isPastReveal(el)) {
        settle("skip");
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (settled) return;

      for (const entry of entries) {
        if (entry.isIntersecting) {
          settle("reveal");
          break;
        }
      }
    }, REVEAL_IO[timing]);

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });

    onScroll();

    return () => {
      settled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, ref, timing]);
}
