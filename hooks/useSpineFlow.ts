"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { isElementInViewport } from "@/lib/prefersReducedMotion";

const WIRE_PHASES = {
  captureFan: [
    "capture-first-core",
    "capture-second-core",
    "capture-third-core",
  ],
  scoreFan: [
    "score-core-tier-1",
    "score-core-tier-2",
    "score-core-tier-3",
  ],
  scoreExit: [
    "score-tier-1-hitl",
    "score-tier-2-hitl",
    "score-tier-3-hitl",
  ],
  hitlFan: [
    "hitl-owner-approve",
    "hitl-owner-rewrite",
    "hitl-owner-reject",
  ],
  routeFan: [
    "route-after-sync",
    "route-after-notify",
    "route-after-send",
  ],
} as const;

const NODE_PHASES = {
  captureInputs: ["capture-first", "capture-second", "capture-third"],
  scoreTiers: ["score-tier-1", "score-tier-2", "score-tier-3"],
  hitlChoices: ["hitl-approve", "hitl-rewrite", "hitl-reject"],
  routeActions: ["route-hubspot", "route-slack-route", "route-lemlist"],
} as const;

function wireDuration(length: number) {
  return gsap.utils.clamp(1.5, 3, length / 85);
}

export function useSpineFlow(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline | null = null;
    let animationContext: gsap.Context | null = null;
    let buildFrame = 0;
    let inViewport = isElementInViewport(root, { threshold: 0.12 });

    const nodes = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-spine-ink="box"][data-spine-node]:not(.spine-zone)',
        ),
      );
    const zones = () =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-spine-zone]"));
    const dots = () =>
      Array.from(root.querySelectorAll<SVGGElement>(".spine-ink__dot"));
    const motions = () =>
      Array.from(root.querySelectorAll<SVGPathElement>(".spine-ink__motion"));

    const motionFor = (id: string) =>
      root.querySelector<SVGPathElement>(`.spine-ink__motion[data-spine-wire="${id}"]`);
    const dotFor = (id: string) =>
      root.querySelector<SVGGElement>(`.spine-ink__dot[data-spine-wire="${id}"]`);

    const setZone = (id?: string) => {
      zones().forEach((zone) => {
        zone.classList.toggle("is-active", zone.dataset.spineZone === id);
      });
    };

    const setActiveNodes = (ids: readonly string[] = []) => {
      const active = new Set(ids);
      nodes().forEach((node) => {
        node.classList.toggle("is-active", active.has(node.dataset.spineNode ?? ""));
        node.classList.remove("is-done");
      });
    };

    const parkDot = (dot: SVGGElement, motion: SVGPathElement | null) => {
      if (motion) {
        const start = motion.getPointAtLength(0);
        dot.setAttribute("transform", `translate(${start.x} ${start.y})`);
      }
      gsap.set(dot, { opacity: 0 });
    };

    const resetVisualState = () => {
      dots().forEach((dot) => {
        parkDot(dot, motionFor(dot.dataset.spineWire ?? ""));
      });
      setActiveNodes();
      setZone();
      root.classList.remove("is-traversing");
    };

    const teardownTimeline = () => {
      timeline?.kill();
      timeline = null;
      animationContext?.revert();
      animationContext = null;
      resetVisualState();
    };

    const syncPlayback = () => {
      if (!timeline || motionQuery.matches) return;
      if (inViewport && !document.hidden) timeline.resume();
      else timeline.pause();
    };

    const buildTimeline = () => {
      teardownTimeline();
      if (motionQuery.matches) return;

      const travelers = dots();
      const paths = motions();
      if (!travelers.length || travelers.length !== paths.length) return;

      animationContext = gsap.context(() => {
        timeline = gsap.timeline({
          paused: true,
          repeat: -1,
          onRepeat: resetVisualState,
        });

        let at = 0;

        const enterZone = (id: string) => {
          timeline?.call(
            () => {
              setZone(id);
              setActiveNodes();
              root.classList.add("is-traversing");
            },
            undefined,
            at,
          );
        };

        const activate = (ids: readonly string[], hold = 0.18) => {
          timeline?.call(() => setActiveNodes(ids), undefined, at);
          at += hold;
        };

        const travel = (ids: readonly string[]) => {
          if (!timeline) return;
          const lengths = ids.map((id) => {
            const motion = motionFor(id);
            return Number(motion?.dataset.spineWireLength) || 0;
          });
          const duration = wireDuration(Math.max(1, ...lengths));
          const start = at;

          ids.forEach((id) => {
            const motion = motionFor(id);
            const dot = dotFor(id);
            if (!motion || !dot) return;

            const length = Number(motion.dataset.spineWireLength) || 1;
            const place = (progress: number) => {
              const point = motion.getPointAtLength(progress * length);
              dot.setAttribute(
                "transform",
                `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
              );
            };

            const proxy = { p: 0 };
            place(0);
            timeline?.set(dot, { opacity: 1 }, start);
            timeline?.fromTo(
              proxy,
              { p: 0 },
              {
                p: 1,
                duration,
                ease: "power2.inOut",
                onUpdate() {
                  place(proxy.p);
                },
              },
              start,
            );
            timeline?.to(
              dot,
              { opacity: 0, duration: 0.32, ease: "power2.out" },
              start + duration - 0.16,
            );
          });

          at += duration;
        };

        enterZone("capture");
        activate(NODE_PHASES.captureInputs, 0.65);
        travel(WIRE_PHASES.captureFan);
        activate(["capture-core"], 0.75);
        travel(["capture-core-rule"]);
        travel(["capture-score"]);

        enterZone("score");
        activate(["score-criteria"], 0.65);
        travel(["score-criteria-core"]);
        activate(["score-core"], 0.7);
        travel(WIRE_PHASES.scoreFan);
        activate(NODE_PHASES.scoreTiers, 0.75);
        travel(WIRE_PHASES.scoreExit);

        enterZone("hitl");
        activate(["hitl-owner"], 0.7);
        activate(["hitl-owner", "hitl-round-robin"], 0.55);
        travel(["hitl-round-robin-owner"]);
        activate(["hitl-owner"], 0.4);
        travel(WIRE_PHASES.hitlFan);
        activate(NODE_PHASES.hitlChoices, 0.65);
        activate(["hitl-reject"], 0.55);
        activate(["hitl-rewrite"], 0.55);
        activate(["hitl-approve"], 0.65);
        travel(["hitl-approve-route"]);

        enterZone("route");
        activate(["route-after"], 0.65);
        travel(WIRE_PHASES.routeFan);
        activate(NODE_PHASES.routeActions, 0.9);

        timeline.call(
          () => {
            setActiveNodes();
            setZone();
            root.classList.remove("is-traversing");
          },
          undefined,
          at,
        );
        at += 1.3;
        timeline.set({}, {}, at);
      }, root);

      syncPlayback();
    };

    const scheduleBuild = () => {
      cancelAnimationFrame(buildFrame);
      buildFrame = requestAnimationFrame(buildTimeline);
    };

    const handleVisibility = () => syncPlayback();
    const handleMotionChange = () => scheduleBuild();
    const handleInkReady = () => scheduleBuild();
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.12;
        syncPlayback();
      },
      { threshold: [0, 0.12, 0.35] },
    );

    intersectionObserver.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);
    root.addEventListener("spine:ink-ready", handleInkReady);
    scheduleBuild();

    return () => {
      cancelAnimationFrame(buildFrame);
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
      root.removeEventListener("spine:ink-ready", handleInkReady);
      teardownTimeline();
    };
  }, [rootRef]);
}
