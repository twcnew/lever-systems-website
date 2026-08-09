"use client";

import { useEffect } from "react";

export function CaseStudyNavTheme() {
  useEffect(() => {
    const nav = document.querySelector(".topnav");
    const hero = document.querySelector(".cs-hero");

    if (!nav || !hero) {
      return;
    }

    nav.classList.add("play-nav", "nav-ready");
    nav.classList.remove("is-glass", "is-dark");

    const getRootMargin = () =>
      `-${nav.getBoundingClientRect().height + 20}px 0px 0px 0px`;

    let observer = new IntersectionObserver(
      ([entry]) => {
        const pastHero = !entry?.isIntersecting;
        nav.classList.toggle("is-dark", pastHero);
        nav.classList.remove("is-glass");
      },
      {
        rootMargin: getRootMargin(),
        threshold: 0,
      },
    );

    observer.observe(hero);

    const onResize = () => {
      observer.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          const pastHero = !entry?.isIntersecting;
          nav.classList.toggle("is-dark", pastHero);
          nav.classList.remove("is-glass");
        },
        {
          rootMargin: getRootMargin(),
          threshold: 0,
        },
      );
      observer.observe(hero);
    };

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      nav.classList.remove("is-glass", "is-dark", "play-nav", "nav-ready");
    };
  }, []);

  return null;
}
