"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const FOOT_ORIGINS = ["16.5 86", "37.5 86", "69.5 86", "90.5 86"] as const;
const HIP_ORIGINS = ["16.5 60", "37.5 60", "69.5 60", "90.5 60"] as const;

const STOMP_STEPS = 8;
const STOMP_LEAD_IN = 0.06;
const STOMP_SQUASH = 0.28;
const RESIZE_DEBOUNCE_MS = 150;

type WalkNodes = {
  track: HTMLDivElement;
  flip: HTMLDivElement;
  container: SVGSVGElement;
  group: SVGGElement;
  eyes: SVGGElement;
  body: SVGGElement;
  hands: SVGRectElement[];
  legs: SVGRectElement[];
};

type WalkRefs = {
  trackRef: RefObject<HTMLDivElement | null>;
  flipRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<SVGSVGElement | null>;
  groupRef: RefObject<SVGGElement | null>;
  eyesRef: RefObject<SVGGElement | null>;
  bodyRef: RefObject<SVGGElement | null>;
  leftHandRef: RefObject<SVGRectElement | null>;
  rightHandRef: RefObject<SVGRectElement | null>;
  legRefs: RefObject<(SVGRectElement | null)[]>;
};

function setLegOrigins(legs: SVGRectElement[], origins: readonly string[]) {
  for (let i = 0; i < legs.length; i += 1) {
    gsap.set(legs[i], { svgOrigin: origins[i], scaleY: 1 });
  }
}

function resetPose(nodes: WalkNodes) {
  const { track, flip, container, group, eyes, body, hands, legs } = nodes;
  gsap.set(track, { x: 0, y: 0 });
  gsap.set(flip, { scaleX: 1 });
  gsap.set(container, { clearProps: "transform" });
  gsap.set(group, { x: 0, y: 0 });
  gsap.set(eyes, { x: 0, y: 0 });
  gsap.set(body, { rotation: 0, x: 0, y: 0 });
  gsap.set(hands, { y: 0 });
  gsap.set(legs, { rotation: 0, scaleY: 1 });
  setLegOrigins(legs, HIP_ORIGINS);
}

/**
 * Distance the mascot walks each leg. When the track sits inside a wider
 * banner it walks the available width (minus a little breathing room);
 * otherwise it falls back to a short back-and-forth sized off its own sprite.
 */
function getWalkTravel(track: HTMLDivElement): number {
  const mascotW = track.offsetWidth || 54;
  const bandW = track.parentElement?.clientWidth ?? 0;

  if (bandW > mascotW) {
    const travel = bandW - mascotW - 24;
    if (travel > 0) return Math.round(travel);
  }

  return Math.round(Math.min(88, Math.max(52, mascotW * 1.35)));
}

function addIntroBeat(timeline: gsap.core.Timeline, nodes: WalkNodes) {
  const { eyes, body, legs, flip } = nodes;

  setLegOrigins(legs, FOOT_ORIGINS);

  timeline
    .addLabel("intro")
    .set(flip, { scaleX: 1 }, "intro")
    .to(eyes, { x: -3, y: -2, duration: 0.3, ease: "power2.out" }, "intro")
    .to(
      body,
      { rotation: -3, x: -3, y: -5, svgOrigin: "53 65", duration: 0.3, ease: "power2.out" },
      "intro",
    )
    .to(
      legs,
      {
        rotation: (i: number) => [-7, -8, -8, -9][i],
        scaleY: (i: number) => [1.35, 1.3, 1.2, 1.15][i],
        duration: 0.3,
        ease: "power2.out",
      },
      "intro",
    )
    .to({}, { duration: 0.25 }, "intro+=0.3")
    .to(eyes, { x: 0, y: 0, duration: 0.2, ease: "power2.inOut" }, "intro+=0.55")
    .to(body, { rotation: 0, x: 0, y: 0, duration: 0.2, ease: "power2.inOut" }, "intro+=0.55")
    .to(legs, { rotation: 0, scaleY: 1, duration: 0.2, ease: "power2.inOut" }, "intro+=0.55")
    .call(() => setLegOrigins(legs, HIP_ORIGINS), undefined, "intro+=0.75");
}

function addWalkStomps(
  timeline: gsap.core.Timeline,
  legs: SVGRectElement[],
  body: SVGGElement,
  label: string,
  duration: number,
) {
  const step = duration / STOMP_STEPS;
  const quarter = step * 0.25;
  const half = step * 0.5;

  for (let i = 0; i < STOMP_STEPS; i += 1) {
    const offset = STOMP_LEAD_IN + i * step;
    const at = `${label}+=${offset.toFixed(3)}`;
    const pairA = i % 2 === 0 ? [legs[0], legs[2]] : [legs[1], legs[3]];
    const pairB = i % 2 === 0 ? [legs[1], legs[3]] : [legs[0], legs[2]];

    timeline
      .to(body, { y: -3, duration: quarter, ease: "power2.out" }, at)
      .to(pairA, { scaleY: STOMP_SQUASH, duration: quarter, ease: "power3.out" }, at)
      .to(body, { y: 0, duration: quarter, ease: "power2.in" }, `${at}+=${quarter.toFixed(3)}`)
      .to(pairA, { scaleY: 1, duration: quarter, ease: "power2.in" }, `${at}+=${quarter.toFixed(3)}`)
      .to(pairB, { scaleY: STOMP_SQUASH, duration: quarter, ease: "power3.out" }, `${at}+=${half.toFixed(3)}`)
      .to(pairB, { scaleY: 1, duration: quarter, ease: "power2.in" }, `${at}+=${(half + quarter).toFixed(3)}`);
  }
}

function addLookUp(
  timeline: gsap.core.Timeline,
  eyes: SVGGElement,
  body: SVGGElement,
  at: string,
) {
  timeline
    .to(eyes, { y: -5, duration: 0.14, ease: "power2.out" }, at)
    .to(body, { y: -2, duration: 0.14, ease: "power2.out" }, at)
    .to(eyes, { y: 0, duration: 0.18, ease: "power2.in" }, `${at}+=0.22`)
    .to(body, { y: 0, duration: 0.18, ease: "power2.in" }, `${at}+=0.22`);
}

function addMiniHop(timeline: gsap.core.Timeline, group: SVGGElement, at: string) {
  timeline
    .to(group, { y: -10, duration: 0.12, ease: "power2.out" }, at)
    .to(group, { y: 0, duration: 0.09, ease: "power4.in" }, `${at}+=0.12`)
    .set(group, { y: 0 }, `${at}+=0.21`);
}

function hardResetLeg(nodes: WalkNodes) {
  const { group, eyes, body, hands, legs } = nodes;
  gsap.set(group, { y: 0 });
  gsap.set(eyes, { x: 0, y: 0 });
  gsap.set(body, { rotation: 0, x: 0, y: 0 });
  gsap.set(hands, { y: 0 });
  gsap.set(legs, { rotation: 0, scaleY: 1 });
  setLegOrigins(legs, HIP_ORIGINS);
}

function addWalkLeg(
  timeline: gsap.core.Timeline,
  nodes: WalkNodes,
  label: string,
  xTo: number,
  walkDuration: number,
  faceX: number,
) {
  const { track, flip, group, eyes, body, hands, legs } = nodes;

  timeline
    .addLabel(label)
    .call(() => hardResetLeg(nodes), undefined, label)
    .set(flip, { scaleX: faceX }, label)
    .to(track, { x: xTo, duration: walkDuration, ease: "linear" }, label);

  addWalkStomps(timeline, legs, body, label, walkDuration);
  addLookUp(timeline, eyes, body, `${label}+=${(walkDuration * 0.35).toFixed(2)}`);
  addMiniHop(timeline, group, `${label}+=${(walkDuration * 0.55).toFixed(2)}`);

  timeline.call(() => hardResetLeg(nodes), undefined, `${label}+=${walkDuration}`);
}

function buildWalkTimeline(nodes: WalkNodes): gsap.core.Timeline {
  resetPose(nodes);

  const travel = getWalkTravel(nodes.track);
  const walkDuration = Math.min(4.5, Math.max(2.4, travel / 34));

  const timeline = gsap.timeline({ repeat: -1, paused: true });

  addIntroBeat(timeline, nodes);
  addWalkLeg(timeline, nodes, "walkIn", travel, walkDuration, -1);
  addWalkLeg(timeline, nodes, "walkBack", 0, walkDuration, 1);
  timeline.to({}, { duration: 0.35 });

  return timeline;
}

/** Walking Claude along the card baseline — adapted from ayotomcs.me (Codrops, May 2026). */
export function useClaudeJumpTimeline({
  trackRef,
  flipRef,
  containerRef,
  groupRef,
  eyesRef,
  bodyRef,
  leftHandRef,
  rightHandRef,
  legRefs,
}: WalkRefs) {
  useLayoutEffect(() => {
    const track = trackRef.current;
    const flip = flipRef.current;
    const container = containerRef.current;
    const group = groupRef.current;
    const eyes = eyesRef.current;
    const body = bodyRef.current;
    const leftHand = leftHandRef.current;
    const rightHand = rightHandRef.current;
    const legs = legRefs.current.filter(Boolean) as SVGRectElement[];
    const hands = [leftHand, rightHand].filter(Boolean) as SVGRectElement[];

    if (!track || !flip || !container || !group || !eyes || !body || hands.length !== 2 || legs.length !== 4) {
      return;
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const nodes: WalkNodes = { track, flip, container, group, eyes, body, hands, legs };
    let timeline: gsap.core.Timeline | null = null;
    let visible = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let ctx = gsap.context(() => {});

    const syncPlayback = () => {
      if (!timeline) return;
      if (visible && !document.hidden) timeline.play();
      else timeline.pause();
    };

    const rebuildTimeline = () => {
      timeline?.kill();
      ctx.revert();
      ctx = gsap.context(() => {
        timeline = buildWalkTimeline(nodes);
      });
      syncPlayback();
    };

    rebuildTimeline();

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 },
    );

    observer.observe(container);

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    visible = rect.bottom > 0 && rect.top < vh;
    syncPlayback();

    const onVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisibility);

    const card = track.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (card && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuildTimeline, RESIZE_DEBOUNCE_MS);
      });
      resizeObserver.observe(card);
    }

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      timeline?.kill();
      ctx.revert();
    };
  }, [trackRef, flipRef, containerRef, groupRef, eyesRef, bodyRef, leftHandRef, rightHandRef, legRefs]);
}
