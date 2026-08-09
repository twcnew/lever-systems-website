"use client";

import { useEffect } from "react";

/**
 * The use-cases index has a light background and runs no hero intro, so the
 * shared TopNav would stay hidden (opacity 0) and white-on-light. Reveal it and
 * lock it to the dark (ink-on-paper) theme. Also force a white page canvas —
 * the global cream `--canvas` must not show around the nav.
 */
export function UseCasesNavTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("use-cases-index-page");

    const nav = document.querySelector(".topnav");
    if (nav) {
      nav.classList.add("play-nav", "nav-ready", "is-dark");
      nav.classList.remove("is-glass");
    }

    return () => {
      root.classList.remove("use-cases-index-page");
      if (nav) {
        nav.classList.remove("play-nav", "nav-ready", "is-dark");
      }
    };
  }, []);

  return null;
}
