"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { isElementInViewport } from "@/lib/prefersReducedMotion";
import {
  SPINE_WIRES,
  type SpineAnchorSide,
  type SpineWire,
} from "@/lib/studio/spineFlowchart";

const SVG_NS = "http://www.w3.org/2000/svg";

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

type Point = { x: number; y: number };

type WireGeometry = {
  wire: SpineWire;
  d: string;
};

function wireDuration(length: number) {
  return gsap.utils.clamp(1.7, 3.3, length / 72);
}

function anchorPoint(element: Element, side: SpineAnchorSide, rootRect: DOMRect): Point {
  const rect = element.getBoundingClientRect();
  const left = rect.left - rootRect.left;
  const top = rect.top - rootRect.top;

  if (side === "top") return { x: left + rect.width / 2, y: top };
  if (side === "right") return { x: left + rect.width, y: top + rect.height / 2 };
  if (side === "bottom") return { x: left + rect.width / 2, y: top + rect.height };
  return { x: left, y: top + rect.height / 2 };
}

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function zoneJoinRailY(from: Element, to: Element, rootRect: DOMRect) {
  const fromZone = from.closest(".spine-glass__zone");
  const toZone = to.closest(".spine-glass__zone");
  if (!fromZone || !toZone || fromZone === toZone) return null;
  const a = fromZone.getBoundingClientRect();
  const b = toZone.getBoundingClientRect();
  const upper = a.top <= b.top ? a : b;
  const lower = a.top <= b.top ? b : a;
  if (lower.top - upper.bottom < 4) return null;
  return (upper.bottom + lower.top) / 2 - rootRect.top;
}

function pointToward(from: Point, to: Point, amount: number): Point {
  const length = distance(from, to);
  if (length < 0.01) return from;
  const ratio = amount / length;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function roundedPolyline(points: Point[], radius = 10) {
  const clean = points.filter((point, index) => {
    const previous = points[index - 1];
    return !previous || distance(previous, point) > 0.1;
  });
  if (clean.length < 2) return "";

  const commands = [`M${clean[0].x.toFixed(2)} ${clean[0].y.toFixed(2)}`];
  for (let index = 1; index < clean.length - 1; index += 1) {
    const previous = clean[index - 1];
    const current = clean[index];
    const next = clean[index + 1];
    const turnRadius = Math.min(
      radius,
      distance(previous, current) / 2,
      distance(current, next) / 2,
    );
    const before = pointToward(current, previous, turnRadius);
    const after = pointToward(current, next, turnRadius);
    commands.push(
      `L${before.x.toFixed(2)} ${before.y.toFixed(2)}`,
      `Q${current.x.toFixed(2)} ${current.y.toFixed(2)} ${after.x.toFixed(2)} ${after.y.toFixed(2)}`,
    );
  }
  const last = clean[clean.length - 1];
  commands.push(`L${last.x.toFixed(2)} ${last.y.toFixed(2)}`);
  return commands.join(" ");
}

function resolveWireGeometries(root: HTMLElement, rootRect: DOMRect): WireGeometry[] {
  const anchors = new Map<string, Element>();
  root.querySelectorAll<HTMLElement>("[data-spine-node]").forEach((element) => {
    const id = element.dataset.spineNode;
    if (id) anchors.set(id, element);
  });

  const endpoints = new Map<string, {
    start: Point;
    end: Point;
    from: Element;
    to: Element;
  }>();
  SPINE_WIRES.forEach((wire) => {
    const from = anchors.get(wire.from);
    const to = anchors.get(wire.to);
    if (!from || !to) return;
    endpoints.set(wire.id, {
      start: anchorPoint(from, wire.fromSide, rootRect),
      end: anchorPoint(to, wire.toSide, rootRect),
      from,
      to,
    });
  });

  const groupRails = new Map<string, number>();
  SPINE_WIRES.forEach((wire) => {
    if (!wire.group || groupRails.has(wire.group)) return;
    const members = SPINE_WIRES.filter((candidate) => candidate.group === wire.group)
      .map((candidate) => endpoints.get(candidate.id))
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
    if (!members.length) return;
    const sourceY = Math.max(...members.map(({ start }) => start.y));
    const targetY = Math.min(...members.map(({ end }) => end.y));
    const joinY = zoneJoinRailY(members[0].from, members[0].to, rootRect);
    groupRails.set(
      wire.group,
      joinY ?? sourceY + (targetY - sourceY) * 0.5,
    );
  });

  const loopSpan = root.querySelector(".spine-glass__loop-span")?.getBoundingClientRect();
  const feedbackX = loopSpan
    ? loopSpan.left - rootRect.left - 18
    : Math.max(10, root.offsetWidth * 0.05);

  return SPINE_WIRES.flatMap<WireGeometry>((wire) => {
    const points = endpoints.get(wire.id);
    if (!points) return [];
    const { start, end } = points;
    let route: Point[];

    if (wire.route === "feedback") {
      const clearY = start.y + 18;
      route = [
        start,
        { x: start.x, y: clearY },
        { x: feedbackX, y: clearY },
        { x: feedbackX, y: end.y },
        end,
      ];
    } else if (wire.route === "lateral") {
      const middleX = start.x + (end.x - start.x) * 0.5;
      route = Math.abs(start.y - end.y) < 1
        ? [start, end]
        : [
            start,
            { x: middleX, y: start.y },
            { x: middleX, y: end.y },
            end,
          ];
    } else if (Math.abs(start.x - end.x) < 1) {
      route = [start, end];
    } else {
      const joinY = zoneJoinRailY(points.from, points.to, rootRect);
      const railY = wire.group
        ? (groupRails.get(wire.group) ?? joinY ?? start.y + (end.y - start.y) * 0.5)
        : (joinY ?? start.y + (end.y - start.y) * 0.5);
      route = [
        start,
        { x: start.x, y: railY },
        { x: end.x, y: railY },
        end,
      ];
    }

    const d = roundedPolyline(route, wire.role === "feedback" ? 12 : 9);
    return d ? [{ wire, d }] : [];
  });
}

function ensureOverlay(root: HTMLElement) {
  let overlay = root.querySelector<SVGSVGElement>(".spine-glass__wires");
  if (overlay) return overlay;

  overlay = document.createElementNS(SVG_NS, "svg");
  overlay.classList.add("spine-glass__wires");
  overlay.setAttribute("aria-hidden", "true");
  root.appendChild(overlay);
  return overlay;
}

function appendPath(
  parent: SVGElement,
  d: string,
  className: string,
  wire: SpineWire,
  length: number,
) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.classList.add(className);
  path.dataset.spineWire = wire.id;
  path.dataset.spineWireLength = String(length);
  path.dataset.spineWireRole = wire.role;
  parent.appendChild(path);
  return path;
}

function appendParticle(overlay: SVGSVGElement, wire: SpineWire, start: DOMPoint) {
  const group = document.createElementNS(SVG_NS, "g");
  group.classList.add("spine-glass__particle");
  group.dataset.spineWire = wire.id;
  group.setAttribute("transform", `translate(${start.x} ${start.y})`);
  group.setAttribute("opacity", "0");

  const halo = document.createElementNS(SVG_NS, "circle");
  halo.classList.add("spine-glass__particle-halo");
  halo.setAttribute("r", "7");
  halo.setAttribute("cx", "0");
  halo.setAttribute("cy", "0");

  const core = document.createElementNS(SVG_NS, "circle");
  core.classList.add("spine-glass__particle-core");
  core.setAttribute("r", "2.4");
  core.setAttribute("cx", "0");
  core.setAttribute("cy", "0");

  group.append(halo, core);
  overlay.appendChild(group);
  return group;
}

function paintWires(root: HTMLElement) {
  const overlay = ensureOverlay(root);
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
  overlay.setAttribute("width", String(width));
  overlay.setAttribute("height", String(height));
  overlay.replaceChildren();

  const defs = document.createElementNS(SVG_NS, "defs");
  const gradient = document.createElementNS(SVG_NS, "linearGradient");
  gradient.id = "spine-glass-wire-grad";
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "0%");
  gradient.setAttribute("y2", "100%");
  const stopA = document.createElementNS(SVG_NS, "stop");
  stopA.setAttribute("offset", "0%");
  stopA.setAttribute("stop-color", "#8eb6ff");
  const stopB = document.createElementNS(SVG_NS, "stop");
  stopB.setAttribute("offset", "100%");
  stopB.setAttribute("stop-color", "#5a8be4");
  gradient.append(stopA, stopB);
  defs.appendChild(gradient);
  overlay.appendChild(defs);

  const rootRect = root.getBoundingClientRect();
  const geometries = resolveWireGeometries(root, rootRect);

  geometries.forEach((geometry) => {
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("spine-glass__wire");
    group.dataset.spineWire = geometry.wire.id;
    group.dataset.spineWireRole = geometry.wire.role;
    overlay.appendChild(group);

    const halo = appendPath(group, geometry.d, "spine-glass__wire-halo", geometry.wire, 0);
    const path = appendPath(group, geometry.d, "spine-glass__wire-path", geometry.wire, 0);
    const length = path.getTotalLength();
    halo.dataset.spineWireLength = String(length);
    path.dataset.spineWireLength = String(length);

    const start = path.getPointAtLength(0);
    appendParticle(overlay, geometry.wire, start);
  });

  return geometries.length;
}

export function useSpineGlassFlow(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline | null = null;
    let animationContext: gsap.Context | null = null;
    let buildFrame = 0;
    let rebuildTimer = 0;
    let inViewport = isElementInViewport(root, { threshold: 0.12 });

    const nodes = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          "[data-spine-ink='box'][data-spine-node]:not(.spine-glass__zone)",
        ),
      );
    const zones = () =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-spine-zone]"));
    const dots = () =>
      Array.from(root.querySelectorAll<SVGGElement>(".spine-glass__particle"));
    const motions = () =>
      Array.from(root.querySelectorAll<SVGPathElement>(".spine-glass__wire-path"));

    const motionFor = (id: string) =>
      root.querySelector<SVGPathElement>(`.spine-glass__wire-path[data-spine-wire="${id}"]`);
    const dotFor = (id: string) =>
      root.querySelector<SVGGElement>(`.spine-glass__particle[data-spine-wire="${id}"]`);

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

    const rebuild = () => {
      teardownTimeline();
      const count = paintWires(root);
      if (count > 0) {
        root.classList.add("is-wired");
        buildTimeline();
      }
    };

    const scheduleRebuild = () => {
      window.clearTimeout(rebuildTimer);
      cancelAnimationFrame(buildFrame);
      rebuildTimer = window.setTimeout(() => {
        buildFrame = requestAnimationFrame(rebuild);
      }, 48);
    };

    const handleVisibility = () => syncPlayback();
    const handleMotionChange = () => scheduleRebuild();
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.12;
        syncPlayback();
      },
      { threshold: [0, 0.12, 0.35] },
    );

    const resizeObserver = new ResizeObserver(scheduleRebuild);
    resizeObserver.observe(root);

    intersectionObserver.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);
    scheduleRebuild();

    return () => {
      window.clearTimeout(rebuildTimer);
      cancelAnimationFrame(buildFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
      teardownTimeline();
    };
  }, [rootRef]);
}
