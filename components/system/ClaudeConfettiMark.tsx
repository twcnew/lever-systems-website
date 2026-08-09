"use client";

import { useRef } from "react";
import { CHARACTER_LAYERS, PARTICLE_FRAME_HTML } from "@/lib/claudeConfetti/frames";
import { useClaudeConfettiTimeline } from "@/hooks/useClaudeConfettiTimeline";

/** Animated Confetti Claude mascot. */
export function ClaudeConfettiMark({ className = "" }: { className?: string }) {
  const containerRef = useRef<SVGSVGElement>(null);
  const characterRefs = useRef<(SVGGElement | null)[]>([]);
  const burst1GroupRef = useRef<SVGGElement>(null);
  const burst1FrameRefs = useRef<(SVGGElement | null)[]>([]);
  const burst2GroupRef = useRef<SVGGElement>(null);
  const burst2FrameRefs = useRef<(SVGGElement | null)[]>([]);

  useClaudeConfettiTimeline({
    containerRef,
    characterRefs,
    burst1GroupRef,
    burst1FrameRefs,
    burst2GroupRef,
    burst2FrameRefs,
  });

  return (
    <svg
      ref={containerRef}
      className={className}
      viewBox="0 0 129 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {CHARACTER_LAYERS.map((layer, i) => (
        <g
          key={`char-${i}`}
          ref={(el) => {
            characterRefs.current[i] = el;
          }}
          transform={layer.transform}
          style={{ display: i === 0 ? "inline" : "none" }}
          dangerouslySetInnerHTML={{ __html: layer.html }}
        />
      ))}

      <g ref={burst1GroupRef} style={{ display: "none" }}>
        {PARTICLE_FRAME_HTML.map((html, i) => (
          <g
            key={`burst1-${i}`}
            ref={(el) => {
              burst1FrameRefs.current[i] = el;
            }}
            style={{ display: i === 0 ? "inline" : "none" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </g>

      <g ref={burst2GroupRef} style={{ display: "none" }}>
        {PARTICLE_FRAME_HTML.map((html, i) => (
          <g
            key={`burst2-${i}`}
            ref={(el) => {
              burst2FrameRefs.current[i] = el;
            }}
            style={{ display: i === 0 ? "inline" : "none" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </g>
    </svg>
  );
}
