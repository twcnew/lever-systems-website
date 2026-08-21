"use client";

import { useEffect } from "react";

/** Light studio canvas: reveal TopNav in ink-on-paper, same as inner site pages. */
export function StudioNavTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js", "studio-page");
    root.classList.remove("no-js");

    const nav = document.querySelector(".topnav");
    if (nav) {
      nav.classList.add("play-nav", "nav-ready", "is-dark");
      nav.classList.remove("is-glass");
    }

    return () => {
      root.classList.remove("studio-page");
      if (nav) {
        nav.classList.remove("play-nav", "nav-ready", "is-dark");
      }
    };
  }, []);

  return null;
}
