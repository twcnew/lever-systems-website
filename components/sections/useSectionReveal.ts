"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal LP modules when they enter the viewport.
 * Uses a low threshold + rootMargin so tall sections don't stay at opacity 0
 * while their header is already on screen. Also reveals immediately if the
 * section is already visible or scrolled past on mount (deep links / fast scroll).
 */
export function useSectionReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      el.classList.add("is-live");
    };

    const armRevealReady = () => {
      // Two frames: let every in-view section mark is-live first, then opt into
      // the hidden initial state (progressive enhancement).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.add("reveal-ready");
        });
      });
    };

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Already on screen, or scrolled past — don't leave content invisible.
    if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) {
      reveal();
      armRevealReady();
      return;
    }
    if (rect.bottom <= vh * 0.08) {
      reveal();
      armRevealReady();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-live");
            observer.unobserve(entry.target);
          }
        }
      },
      // Any visible pixel in the upper 88% of the viewport triggers reveal.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(el);
    armRevealReady();
    return () => observer.disconnect();
  }, []);

  return ref;
}
