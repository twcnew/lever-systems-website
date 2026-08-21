"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

/**
 * Orchestrates the signals map animation:
 * - one-shot entrance from the center outward (hub, then first, second, third ring tools)
 * Leaves the CSS ripple / core pulse / twinkle to drive ambient life.
 */
export function useSignalsFlow(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const hub = root.querySelector<HTMLElement>(".signals-glass__hub-wrap");
    const groups = Array.from(
      root.querySelectorAll<HTMLElement>(".signals-glass__group"),
    );

    // Sort groups by ring order (first, second, third) then index for the
    // center-outward stagger.
    const ringOrder: Record<string, number> = { first: 0, second: 1, third: 2 };
    const sortedGroups = groups
      .map((el) => ({
        el,
        ring: el.classList.contains("signals-glass__group--first")
          ? "first"
          : el.classList.contains("signals-glass__group--second")
            ? "second"
            : "third",
      }))
      .sort((a, b) => ringOrder[a.ring] - ringOrder[b.ring]);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Entrance: hub first, then tools center -> outward.
      if (hub) {
        tl.fromTo(
          hub,
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            transformOrigin: "50% 50%",
          },
        );
      }
      tl.fromTo(
        sortedGroups.map((t) => t.el),
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: { each: 0.06, from: "start" },
          transformOrigin: "50% 50%",
        },
        hub ? ">-0.1" : 0,
      );
      tl.add(() => root.classList.add("is-live"));
    }, root);

    return () => {
      ctx.revert();
    };
  }, [rootRef]);
}
