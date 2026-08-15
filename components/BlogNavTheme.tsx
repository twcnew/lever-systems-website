"use client";

import { useEffect } from "react";

/** Light inner pages: show the nav in ink-on-paper, no glass hero theme. */
export function BlogNavTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("blog-page");

    const nav = document.querySelector(".topnav");
    if (nav) {
      nav.classList.add("play-nav", "nav-ready", "is-dark");
      nav.classList.remove("is-glass");
    }

    return () => {
      root.classList.remove("blog-page");
      if (nav) {
        nav.classList.remove("play-nav", "nav-ready", "is-dark");
      }
    };
  }, []);

  return null;
}
