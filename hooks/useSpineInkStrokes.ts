"use client";

import { useEffect, type RefObject } from "react";
import roughLib from "roughjs";
import {
  SPINE_WIRES,
  type SpineAnchorSide,
  type SpineWire,
} from "@/lib/studio/spineFlowchart";

const SVG_NS = "http://www.w3.org/2000/svg";

type RoughApi = {
  generator: (config?: unknown) => RoughGenerator;
};

type RoughDrawable = {
  sets: Array<{ type: string; ops: unknown[] }>;
  options: {
    stroke: string;
    strokeWidth: number;
    fill?: string;
    strokeLineDash?: number[];
  };
};

type RoughGenerator = {
  path: (d: string, options?: Record<string, unknown>) => RoughDrawable;
  opsToPath: (set: { type: string; ops: unknown[] }, fixed?: number) => string;
};

const BOX_OPTIONS = {
  roughness: 1.15,
  bowing: 0.7,
  strokeWidth: 1.35,
  maxRandomnessOffset: 2.2,
  disableMultiStroke: true,
  preserveVertices: true,
  fill: "none" as const,
};

const PATH_OPTIONS = {
  roughness: 0.55,
  bowing: 0.4,
  strokeWidth: 1.3,
  maxRandomnessOffset: 0.8,
  disableMultiStroke: true,
  preserveVertices: true,
  fill: "none" as const,
};

type InkBinding = {
  source: Element;
  mark: SVGGElement;
};

type Point = {
  x: number;
  y: number;
};

type WireGeometry = {
  wire: SpineWire;
  d: string;
};

function resolveRough(): RoughApi {
  const mod = roughLib as RoughApi & { default?: RoughApi };
  if (typeof mod.generator === "function") return mod;
  if (mod.default && typeof mod.default.generator === "function") return mod.default;
  throw new Error("roughjs generator API missing");
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${x + radius} ${y}`,
    `H${x + w - radius}`,
    `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`,
    `V${y + h - radius}`,
    `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`,
    `H${x + radius}`,
    `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`,
    `V${y + radius}`,
    `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
    "Z",
  ].join(" ");
}

function boxRadius(el: Element) {
  if (el.classList.contains("spine-zone")) return 12;
  if (el.classList.contains("spine-split")) return 8;
  return 6;
}

function seedFor(el: Element, index: number) {
  const label = el.getAttribute("data-spine-zone")
    ?? el.getAttribute("data-spine-step")
    ?? el.getAttribute("data-spine-join")
    ?? el.className.toString();
  return seedForLabel(label, index);
}

function seedForLabel(label: string, index: number) {
  let hash = 11 + index * 17;
  for (let i = 0; i < label.length; i += 1) hash = (hash * 33 + label.charCodeAt(i)) % 9973;
  return hash + 1;
}

function anchorPoint(
  element: Element,
  side: SpineAnchorSide,
  rootRect: DOMRect,
): Point {
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
  const fromZone = from.closest(".spine-zone");
  const toZone = to.closest(".spine-zone");
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

function roundedPolyline(points: Point[], radius = 8) {
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

function resolveWireGeometries(root: HTMLElement, rootRect: DOMRect) {
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

  const loopSpan = root.querySelector(".spine-flow__loop-span")?.getBoundingClientRect();
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

    const d = roundedPolyline(route, wire.role === "feedback" ? 10 : 7);
    return d ? [{ wire, d }] : [];
  });
}

function toneClass(source: Element) {
  if (source.classList.contains("spine-zone")) return "";
  if (source.classList.contains("spine-split--dead")) {
    return "is-muted";
  }

  if (
    source.classList.contains("is-active")
    || source.classList.contains("spine-node--rule")
  ) {
    return "is-royal";
  }

  return "";
}

function syncTones(bindings: InkBinding[]) {
  bindings.forEach(({ source, mark }) => {
    const next = toneClass(source);
    const royal = next === "is-royal";
    const muted = next === "is-muted";
    mark.classList.toggle("is-royal", royal);
    mark.classList.toggle("is-muted", muted);
  });
}

function appendDrawable(
  overlay: SVGSVGElement,
  generator: RoughGenerator,
  drawable: RoughDrawable,
) {
  const group = document.createElementNS(SVG_NS, "g");
  group.classList.add("spine-ink__mark");

  drawable.sets.forEach((set) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", generator.opsToPath(set));
    if (set.type === "fillPath") {
      path.setAttribute("stroke", "none");
      path.setAttribute("stroke-width", "0");
      path.setAttribute("fill", "currentColor");
    } else {
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute(
        "stroke-width",
        String(set.type === "fillSketch" ? drawable.options.strokeWidth / 2 : drawable.options.strokeWidth),
      );
      if (drawable.options.strokeLineDash) {
        path.setAttribute("stroke-dasharray", drawable.options.strokeLineDash.join(" "));
      }
    }
    group.appendChild(path);
  });

  overlay.appendChild(group);
  return group;
}

function bindWireMeta(element: SVGElement, wire: SpineWire) {
  element.dataset.spineWire = wire.id;
  element.dataset.spineWireRole = wire.role;
  element.dataset.spineFrom = wire.from;
  element.dataset.spineTo = wire.to;
  if (wire.group) element.dataset.spineWireGroup = wire.group;
}

function appendWire(
  overlay: SVGSVGElement,
  generator: RoughGenerator,
  geometry: WireGeometry,
  index: number,
) {
  const { wire, d } = geometry;
  const dashed = wire.role === "fallback" || wire.role === "feedback";
  const drawable = generator.path(d, {
    ...PATH_OPTIONS,
    seed: seedForLabel(wire.id, index),
    stroke: "#0e0a07",
    strokeLineDash: dashed ? [4, 3] : undefined,
  });
  const base = appendDrawable(overlay, generator, drawable);
  base.classList.add(
    "spine-ink__wire",
    "spine-ink__wire-base",
    `spine-ink__wire--${wire.role}`,
  );
  bindWireMeta(base, wire);

  const motion = document.createElementNS(SVG_NS, "path");
  motion.classList.add("spine-ink__motion");
  motion.setAttribute("d", d);
  motion.setAttribute("fill", "none");
  motion.setAttribute("stroke", "none");
  bindWireMeta(motion, wire);
  overlay.appendChild(motion);
  motion.dataset.spineWireLength = String(motion.getTotalLength());
}

function appendDot(overlay: SVGSVGElement, geometry: WireGeometry) {
  const { wire, d } = geometry;
  const start = d.match(/^M([\d.-]+)\s+([\d.-]+)/);
  const x = start?.[1] ?? "0";
  const y = start?.[2] ?? "0";

  const dot = document.createElementNS(SVG_NS, "g");
  dot.classList.add("spine-ink__dot");
  dot.setAttribute("transform", `translate(${x} ${y})`);
  bindWireMeta(dot, wire);

  const halo = document.createElementNS(SVG_NS, "circle");
  halo.classList.add("spine-ink__dot-halo");
  halo.setAttribute("r", "10");
  halo.setAttribute("cx", "0");
  halo.setAttribute("cy", "0");

  const core = document.createElementNS(SVG_NS, "circle");
  core.classList.add("spine-ink__dot-core");
  core.setAttribute("r", "1.6");
  core.setAttribute("cx", "0");
  core.setAttribute("cy", "0");

  dot.append(halo, core);
  overlay.appendChild(dot);
}

export function useSpineInkStrokes(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let generator: RoughGenerator;
    try {
      generator = resolveRough().generator();
    } catch (error) {
      console.error("spine ink rough", error);
      return;
    }

    const overlay = document.createElementNS(SVG_NS, "svg");
    overlay.classList.add("spine-ink");
    overlay.setAttribute("aria-hidden", "true");
    root.appendChild(overlay);

    let bindings: InkBinding[] = [];
    let rebuildTimer = 0;
    let frame = 0;

    const rebuild = () => {
      try {
        const width = root.offsetWidth;
        const height = root.offsetHeight;
        if (width < 8 || height < 8) {
          rebuildTimer = window.setTimeout(rebuild, 80);
          return;
        }

        overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
        overlay.setAttribute("width", String(width));
        overlay.setAttribute("height", String(height));
        overlay.replaceChildren();
        bindings = [];

        const rootRect = root.getBoundingClientRect();
        const boxes = Array.from(root.querySelectorAll<HTMLElement>('[data-spine-ink="box"]'));
        const zoneBoxes = boxes.filter((element) => element.classList.contains("spine-zone"));
        const contentBoxes = boxes.filter((element) => !element.classList.contains("spine-zone"));

        const drawBox = (el: HTMLElement, index: number) => {
          const rect = el.getBoundingClientRect();
          const x = rect.left - rootRect.left + 0.5;
          const y = rect.top - rootRect.top + 0.5;
          const w = Math.max(2, rect.width - 1);
          const h = Math.max(2, rect.height - 1);
          const dashed =
            el.classList.contains("spine-split--dead")
            || el.classList.contains("spine-node--alt");

          const node = appendDrawable(
            overlay,
            generator,
            generator.path(roundedRectPath(x, y, w, h, boxRadius(el)), {
              ...BOX_OPTIONS,
              seed: seedFor(el, index),
              stroke: "#0e0a07",
              strokeLineDash: dashed ? [5, 3] : undefined,
            }),
          );
          node.classList.add("spine-ink__box");
          const nodeId = el.dataset.spineNode;
          if (nodeId) node.dataset.spineNode = nodeId;
          bindings.push({ source: el, mark: node });
        };

        zoneBoxes.forEach(drawBox);
        const geometries = resolveWireGeometries(root, rootRect);
        geometries.forEach((geometry, index) => {
          appendWire(overlay, generator, geometry, index);
        });
        contentBoxes.forEach((element, index) => {
          drawBox(element, zoneBoxes.length + index);
        });
        geometries.forEach((geometry) => {
          appendDot(overlay, geometry);
        });

        syncTones(bindings);
        if (bindings.length && geometries.length) {
          root.classList.add("is-inked");
          root.dispatchEvent(
            new CustomEvent("spine:ink-ready", {
              detail: { wireCount: geometries.length },
            }),
          );
        }
      } catch (error) {
        console.error("spine ink strokes", error);
      }
    };

    const scheduleRebuild = () => {
      window.clearTimeout(rebuildTimer);
      cancelAnimationFrame(frame);
      rebuildTimer = window.setTimeout(rebuild, 48);
    };

    const resizeObserver = new ResizeObserver(scheduleRebuild);
    resizeObserver.observe(root);
    root.querySelectorAll<HTMLElement>("[data-spine-node]").forEach((element) => {
      resizeObserver.observe(element);
    });

    window.addEventListener("resize", scheduleRebuild);
    visualViewport?.addEventListener("resize", scheduleRebuild);

    const mutationObserver = new MutationObserver((records) => {
      const classChange = records.some((record) => {
        if (record.attributeName !== "class") return false;
        const target = record.target as Element;
        return !target.closest(".spine-ink");
      });
      if (classChange) syncTones(bindings);
    });
    mutationObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });

    rebuild();
    frame = requestAnimationFrame(rebuild);

    return () => {
      window.clearTimeout(rebuildTimer);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      visualViewport?.removeEventListener("resize", scheduleRebuild);
      overlay.remove();
      root.classList.remove("is-inked");
    };
  }, [rootRef]);
}
