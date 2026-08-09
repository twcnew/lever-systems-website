"use client";

import { useRef } from "react";
import { GYM_FRAME_HTML } from "@/lib/claudeGym/frames";
import { useClaudeGymTimeline } from "@/hooks/useClaudeGymTimeline";

/** Animated Gym Claude mascot — frame-by-frame SVG + GSAP (Codrops technique). */
export function ClaudeGymMark({ className = "" }: { className?: string }) {
  const containerRef = useRef<SVGSVGElement>(null);
  const frameRefs = useRef<(SVGGElement | null)[]>([]);

  useClaudeGymTimeline(containerRef, frameRefs);

  return (
    <svg
      ref={containerRef}
      className={className}
      viewBox="0 0 158 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {GYM_FRAME_HTML.map((html, i) => (
        <g
          key={i}
          ref={(el) => {
            frameRefs.current[i] = el;
          }}
          style={{ display: i === 0 ? "inline" : "none" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </svg>
  );
}
