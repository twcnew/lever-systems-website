"use client";

import { useId, useRef } from "react";
import { useClaudeJumpTimeline } from "@/hooks/useClaudeJumpTimeline";

/** Claude mascot — walks along the card baseline (Codrops technique). */
export function ClaudeJumpMark({
  className = "",
  trackClassName = "",
  flipClassName = "",
}: {
  className?: string;
  trackClassName?: string;
  flipClassName?: string;
}) {
  const clipId = useId().replace(/:/g, "");
  const trackRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const leftHandRef = useRef<SVGRectElement>(null);
  const rightHandRef = useRef<SVGRectElement>(null);
  const legRefs = useRef<(SVGRectElement | null)[]>([]);

  useClaudeJumpTimeline({
    trackRef,
    flipRef,
    containerRef,
    groupRef,
    eyesRef,
    bodyRef,
    leftHandRef,
    rightHandRef,
    legRefs,
  });

  return (
    <div ref={trackRef} className={trackClassName}>
      <div ref={flipRef} className={flipClassName}>
        <svg
          ref={containerRef}
          className={className}
        viewBox="0 0 107 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`claude-jump-ground-${clipId}`}>
            <rect x="-20" y="-50" width="160" height="136" />
          </clipPath>
        </defs>
        <g ref={groupRef}>
          <g clipPath={`url(#claude-jump-ground-${clipId})`}>
            <rect
              ref={(el) => {
                legRefs.current[3] = el;
              }}
              x="85"
              y="60"
              width="11"
              height="26"
              fill="#DD775B"
            />
            <rect
              ref={(el) => {
                legRefs.current[2] = el;
              }}
              x="64"
              y="60"
              width="11"
              height="26"
              fill="#DD775B"
            />
            <rect
              ref={(el) => {
                legRefs.current[1] = el;
              }}
              x="32"
              y="60"
              width="11"
              height="26"
              fill="#DD775B"
            />
            <rect
              ref={(el) => {
                legRefs.current[0] = el;
              }}
              x="11"
              y="60"
              width="11"
              height="26"
              fill="#DD775B"
            />
          </g>
          <g ref={bodyRef}>
            <rect x="11" width="85" height="65" fill="#DD775B" />
            <rect ref={rightHandRef} x="85" y="21" width="22" height="23" fill="#DD775B" />
            <rect ref={leftHandRef} y="21" width="22" height="23" fill="#DD775B" />
            <g ref={eyesRef}>
              <rect x="75" y="11" width="11" height="11" fill="black" />
              <rect x="21" y="11" width="11" height="11" fill="black" />
            </g>
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
}
