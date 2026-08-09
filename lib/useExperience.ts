"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion, smoothScrollBehavior } from "./prefersReducedMotion";

/**
 * Landing chrome: drawer, nav theme on scroll, in-page anchors.
 * Cinematic intro + curtain scroll disabled — hero is a normal document section
 * with a soft blur-rise entrance (s37-style).
 */

export function useExperience(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add("no-cinema");

    const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const $$ = <T extends HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];

    const cleanups: Array<() => void> = [];
    const listen = (
      target: Window | HTMLElement | Document,
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    };

    const nav = $(".topnav");
    const stage = $("[data-stage]");
    const ghostPanel = $(".deck__panel--ghost");

    if (ghostPanel) ghostPanel.style.display = "none";
    stage?.classList.add("is-open");

    const revealHero = () => {
      nav?.classList.add("nav-ready", "play-nav");
      $(".hero__title")?.classList.add("in");
      $$("[data-sub] .sub-row, .hero__pill, .hero__ctas").forEach((el) =>
        el.classList.add("in", "play-in"),
      );
      $("[data-logos]")?.classList.add("play-in");
    };

    if (prefersReducedMotion()) {
      revealHero();
    } else {
      // Double rAF so the first paint stays at the initial (blurred) state.
      requestAnimationFrame(() => {
        requestAnimationFrame(revealHero);
      });
    }

    const setNav = (pastHero: boolean) => {
      if (!nav) return;
      nav.classList.toggle("is-glass", !pastHero);
      nav.classList.toggle("is-dark", pastHero);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      setNav(window.scrollY > vh * 0.65);
    };
    listen(window, "scroll", onScroll, { passive: true });
    listen(window, "resize", onScroll, { passive: true });
    onScroll();

    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      setNav(true);
      requestAnimationFrame(() => {
        document.getElementById(initialHash)?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }

    const drawer = $("[data-drawer]");
    const burger = $("[data-burger]");
    if (drawer && burger) {
      listen(burger, "click", () => drawer.classList.add("is-open"));
      const close = drawer.querySelector("[data-drawer-close]");
      if (close) listen(close as HTMLElement, "click", () => drawer.classList.remove("is-open"));
      drawer.querySelectorAll("a").forEach((a) =>
        listen(a as HTMLElement, "click", () => drawer.classList.remove("is-open")),
      );
    }

    const onDocClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const onLanding = window.location.pathname === "/";

      if (anchor.classList.contains("topnav__brand")) {
        if (!onLanding) return;
        e.preventDefault();
        drawer?.classList.remove("is-open");
        window.scrollTo({ top: 0, behavior: smoothScrollBehavior() });
        return;
      }

      const hashIndex = href.indexOf("#");
      if (hashIndex < 0) return;
      const id = href.slice(hashIndex + 1);
      if (!id || !onLanding) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      drawer?.classList.remove("is-open");
      el.scrollIntoView({ behavior: smoothScrollBehavior(), block: "start" });
    };
    listen(document.body, "click", onDocClick as EventListener);

    return () => {
      cleanups.forEach((fn) => fn());
      document.documentElement.classList.remove("no-cinema");
      document.documentElement.classList.remove("fp-on");
    };
  }, [rootRef]);
}
