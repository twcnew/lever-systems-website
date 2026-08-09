"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { isElementInViewport } from "@/lib/prefersReducedMotion";

const SVG_NS = "http://www.w3.org/2000/svg";
const MOBILE_BREAKPOINT = 1180;

type WireRefs = {
  sceneRef: RefObject<HTMLDivElement | null>;
  wiresRef: RefObject<SVGSVGElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  lensRef: RefObject<HTMLDivElement | null>;
};

export function useRevenueEngineWires({
  sceneRef,
  wiresRef,
  panelRef,
  lensRef,
}: WireRefs) {
  useEffect(() => {
    const scene = sceneRef.current;
    const wires = wiresRef.current;
    const panel = panelRef.current;
    const lens = lensRef.current;
    if (!scene || !wires || !panel || !lens) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let visible = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let lastWidth = window.innerWidth;

    const clearWires = () => {
      while (wires.firstChild) wires.removeChild(wires.firstChild);
    };

    const rowAnchor = (row: Element, side: "left" | "right") => {
      const rowRect = row.getBoundingClientRect();
      const sceneRect = scene.getBoundingClientRect();
      return {
        x: (side === "left" ? rowRect.left : rowRect.right) - sceneRect.left,
        y: rowRect.top + rowRect.height / 2 - sceneRect.top,
      };
    };

    const syncPlayback = () => {
      if (!timeline) return;
      visible = isElementInViewport(scene, { threshold: 0.2 });
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    const rebuild = () => {
      observer?.disconnect();
      observer = null;
      timeline?.kill();
      timeline = null;
      visible = false;
      clearWires();

      gsap.set(lens, { opacity: 0, clearProps: "top,height" });
      lens.classList.remove("scanning");
      panel.querySelectorAll(".rev-engine__erow.lit").forEach((row) => {
        row.classList.remove("lit");
      });

      if (window.innerWidth <= MOBILE_BREAKPOINT) return;

      const width = scene.clientWidth;
      const height = scene.clientHeight;
      wires.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const defs = document.createElementNS(SVG_NS, "defs");
      defs.innerHTML = `
        <linearGradient id="rev-engine-wire" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="var(--re-wire)" stop-opacity="0.22"/>
          <stop offset="1" stop-color="var(--re-wire)" stop-opacity="0.3"/>
        </linearGradient>`;
      wires.appendChild(defs);

      const sceneRect = scene.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const panelLeft = panelRect.left - sceneRect.left;
      const panelRight = panelRect.right - sceneRect.left;
      const panelTop = panelRect.top - sceneRect.top;
      const panelMidY = panelTop + panelRect.height / 2;

      const inRows = Array.from(scene.querySelectorAll(".rev-engine__in-row"));
      const outRows = Array.from(scene.querySelectorAll(".rev-engine__out-row"));
      const engineRows = Array.from(panel.querySelectorAll(".rev-engine__erow"));

      const addPath = (d: string) => {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", "url(#rev-engine-wire)");
        path.setAttribute("stroke-width", "1.25");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        wires.appendChild(path);
        return path;
      };

      const addDot = (x: number, y: number, opacity: number) => {
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
        dot.setAttribute("r", "2.5");
        dot.setAttribute("fill", "var(--re-wire)");
        dot.setAttribute("fill-opacity", String(opacity));
        wires.appendChild(dot);
      };

      inRows.forEach((row) => {
        const anchor = rowAnchor(row, "right");
        const midX = (anchor.x + panelLeft) / 2;
        addPath(
          `M ${anchor.x} ${anchor.y} C ${midX} ${anchor.y}, ${midX} ${panelMidY}, ${panelLeft} ${panelMidY}`,
        );
        addDot(anchor.x, anchor.y, 0.35);
      });

      outRows.forEach((row) => {
        const anchor = rowAnchor(row, "left");
        const midX = (panelRight + anchor.x) / 2;
        addPath(
          `M ${panelRight} ${panelMidY} C ${midX} ${panelMidY}, ${midX} ${anchor.y}, ${anchor.x} ${anchor.y}`,
        );
        addDot(anchor.x, anchor.y, 0.45);
      });

      if (reducedMotion) return;

      const reviewIndex = engineRows.findIndex((row) =>
        row.classList.contains("review"),
      );

      timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.4,
        paused: true,
        onRepeat: () => {
          engineRows.forEach((row) => row.classList.remove("lit"));
        },
      });

      timeline.set(lens, { opacity: 0 });

      engineRows.forEach((row, index) => {
        const isReview = index === reviewIndex;
        timeline!.to(
          lens,
          {
            top: (row as HTMLElement).offsetTop,
            height: (row as HTMLElement).offsetHeight,
            opacity: 1,
            duration: index === 0 ? 0.4 : 0.5,
            ease: "power2.inOut",
            onStart: () => {
              engineRows.forEach((item) => item.classList.remove("lit"));
              row.classList.add("lit");
              lens.classList.toggle("scanning", isReview);
            },
          },
          index === 0 ? undefined : ">",
        );
        timeline!.to(lens, { opacity: 1, duration: isReview ? 1.7 : 0.5 });
      });

      timeline.add(() => lens.classList.remove("scanning"));

      outRows.forEach((row, index) => {
        timeline!.fromTo(
          row,
          { boxShadow: "0 0 0px rgba(35,82,222,0)" },
          {
            boxShadow: "0 0 16px rgba(35,82,222,0.35)",
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
          },
          index === 0 ? ">-0.05" : ">-0.18",
        );
      });

      timeline.to(lens, { opacity: 0, duration: 0.5 }, ">+0.5");

      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[entries.length - 1]?.isIntersecting ?? false;
          syncPlayback();
        },
        { threshold: 0.2 },
      );
      observer.observe(scene);
      visible = isElementInViewport(scene, { threshold: 0.2 });
      syncPlayback();
    };

    const scheduleRebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 150);
    };

    const onResize = () => {
      const nextWidth = window.innerWidth;
      const crossed =
        (lastWidth <= MOBILE_BREAKPOINT && nextWidth > MOBILE_BREAKPOINT) ||
        (lastWidth > MOBILE_BREAKPOINT && nextWidth <= MOBILE_BREAKPOINT);
      if (crossed && Math.abs(nextWidth - lastWidth) < 80) return;
      lastWidth = nextWidth;
      scheduleRebuild();
    };

    const onVisibility = () => syncPlayback();

    const boot = () => requestAnimationFrame(rebuild);
    if (document.fonts?.ready) document.fonts.ready.then(boot);
    else boot();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (typeof ResizeObserver !== "undefined") {
      let lastSceneWidth = -1;
      resizeObserver = new ResizeObserver(() => {
        const nextWidth = scene.clientWidth;
        if (Math.abs(nextWidth - lastSceneWidth) < 40) return;
        lastSceneWidth = nextWidth;
        scheduleRebuild();
      });
      resizeObserver.observe(scene);
    }

    return () => {
      clearTimeout(resizeTimer);
      observer?.disconnect();
      resizeObserver?.disconnect();
      timeline?.kill();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      clearWires();
    };
  }, [sceneRef, wiresRef, panelRef, lensRef]);
}
